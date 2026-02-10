#!/usr/bin/env python3
"""
NovaMedix — Optimized Image Scraper
1. Reuses images from existing products with same name/clave (INTERNAL CACHE).
2. Searches DuckDuckGo concurrently for missing images.
3. Batch updates database.

Usage:
    python3 scripts/image_scraper.py --workers 4   # Run with 4 concurrent threads
"""

import os
import sys
import re
import time
import argparse
import json
import warnings
from concurrent.futures import ThreadPoolExecutor, as_completed
from urllib.parse import urlparse

import psycopg2
from psycopg2.extras import DictCursor, execute_values

warnings.filterwarnings("ignore", category=RuntimeWarning)

try:
    from duckduckgo_search import DDGS
except ImportError:
    print("❌ Instala dependencias: pip3 install -r scripts/requirements.txt")
    sys.exit(1)


# ─── Config ─────────────────────────────────────────────────────
DATABASE_URL = os.environ.get("DIRECT_URL", os.environ.get("DATABASE_URL", ""))

NOISE_WORDS = {
    "FCO", "FCOS", "TAB", "TABS", "CAP", "CAPS", "SOL", "SOLN",
    "JBE", "AMP", "SUSP", "CRA", "UNG", "OFT", "INY",
    "SPRAY", "POLVO", "SOBRES", "SOBRE", "PZA", "PZS",
    "ML", "MG", "GR", "KG", "LT", "OZ", "CM", "MM",
    "C", "CON", "DE", "EL", "EN", "LA", "LAS", "LOS", "UN", "UNA",
    "X", "Y", "POR", "DX", "CAJA", "FRASCO",
}

BATCH_SIZE = 50


def parse_database_url(url: str) -> dict:
    parsed = urlparse(url)
    return {
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "dbname": parsed.path.lstrip("/"),
        "user": parsed.username,
        "password": parsed.password,
        "sslmode": "require",
    }


def clean_product_name(nombre: str) -> str:
    """Clean product name for image search. Keeps dosage info for precision."""
    if not nombre: return ""
    name = re.sub(r"\([^)]*\)", "", nombre).strip()
    name = re.sub(r"[,/]", " ", name)
    words = re.findall(r"[A-Za-záéíóúñÁÉÍÓÚÑ0-9.\-]+", name.upper())
    
    cleaned = []
    for w in words:
        if w in NOISE_WORDS: continue
        if len(w) <= 1: continue
        # Keep dosage numbers like "500MG", "0.5MG", "100ML" — they matter
        # Only skip pure standalone numbers
        if re.match(r"^\d+$", w): continue
        cleaned.append(w)

    # Use up to 6 words for better search precision
    return " ".join(cleaned[:6]).lower()


def search_web_image(product_name: str, retries: int = 2) -> str | None:
    """Search DuckDuckGo with retries."""
    query = f"{product_name} medicamento farmacia mexico"
    
    for attempt in range(retries):
        try:
            with DDGS() as ddgs:
                results = list(ddgs.images(
                    keywords=query,
                    max_results=3,
                    size="Medium",
                    type_image="photo",
                    safesearch="moderate",
                ))

            if results:
                # Prioritize preferred domains
                preferred = ["fahorro", "superama", "farmacias", "walmart", "amazon", "plm"]
                for r in results:
                    if any(p in r.get("image", "") for p in preferred):
                        return r["image"]
                return results[0]["image"]
            
            return None

        except Exception:
            if attempt < retries - 1:
                time.sleep(1 + (attempt * 2))
            else:
                return None
    return None


def get_db_connection():
    return psycopg2.connect(**parse_database_url(DATABASE_URL))


def sync_internal_images(conn):
    """
    Step 1: Propagate images internally.
    If 'Product A' has an image, copy it to all other 'Product A's without image.
    """
    print("🔄 Syncing images internally...")
    with conn.cursor() as cur:
        # Find products with images
        cur.execute("""
            SELECT nombre, imagen FROM productos 
            WHERE imagen IS NOT NULL AND activo = true
        """)
        sources = cur.fetchall()
        
        updates = 0
        for name, img in sources:
            if not name or not img: continue
            # Update others with exact same name but no image
            cur.execute("""
                UPDATE productos 
                SET imagen = %s, "updatedAt" = NOW()
                WHERE nombre = %s AND imagen IS NULL
            """, (img, name))
            updates += cur.rowcount
            
        conn.commit()
    print(f"✅ Propagated images to {updates} products locally.\n")


def process_product(product):
    """Worker function to process a single product."""
    pid, nombre, clave = product
    search_name = clean_product_name(nombre)
    
    # Random sleep to avoid instant block
    time.sleep(0.5) 
    
    image_url = search_web_image(search_name)
    return (pid, image_url, search_name)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--workers", type=int, default=4, help="Concurrent threads")
    parser.add_argument("--limit", type=int, help="Limit number of products")
    args = parser.parse_args()

    if not DATABASE_URL:
        print("❌ Set DIRECT_URL env var")
        sys.exit(1)

    try:
        conn = get_db_connection()
        print("🔌 Connected to DB")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    # 1. Reuse existing images first
    sync_internal_images(conn)

    # 2. Fetch remaining missing
    with conn.cursor() as cur:
        query = "SELECT id, nombre, clave FROM productos WHERE imagen IS NULL AND activo = true"
        if args.limit: query += f" LIMIT {args.limit}"
        cur.execute(query)
        missing_products = cur.fetchall()

    total = len(missing_products)
    if total == 0:
        print("✨ All done! No images missing.")
        return

    print(f"🔍 Searching web for {total} products using {args.workers} workers...")
    
    buffer = []
    processed = 0
    found_count = 0

    with ThreadPoolExecutor(max_workers=args.workers) as executor:
        # Submit all tasks
        futures = {executor.submit(process_product, p): p for p in missing_products}

        for future in as_completed(futures):
            processed += 1
            pid, url, term = future.result()
            
            if url:
                found_count += 1
                buffer.append((url, pid))
                print(f"[{processed}/{total}] ✅ {term} ")
            else:
                print(f"[{processed}/{total}] ❌ {term}")

            # Batch update
            if len(buffer) >= BATCH_SIZE:
                with conn.cursor() as cur:
                    execute_values(cur, 
                        'UPDATE productos AS p SET imagen = v.img, "updatedAt" = NOW() FROM (VALUES %s) AS v(img, id) WHERE p.id = v.id',
                        buffer
                    )
                conn.commit()
                print(f"💾 Saved batch of {len(buffer)} images")
                buffer = []

    # Final batch
    if buffer:
        with conn.cursor() as cur:
            execute_values(cur, 
                'UPDATE productos AS p SET imagen = v.img, "updatedAt" = NOW() FROM (VALUES %s) AS v(img, id) WHERE p.id = v.id',
                buffer
            )
        conn.commit()
        print(f"💾 Saved final batch of {len(buffer)}")

    print(f"\n🎉 Finished! Found: {found_count}/{total}")
    conn.close()

if __name__ == "__main__":
    main()

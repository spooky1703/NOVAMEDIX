#!/usr/bin/env python3
"""
NovaMedix — Image Scraper
Searches for product images and updates the database.

Usage:
    python3 scripts/image_scraper.py              # Process all products without images
    python3 scripts/image_scraper.py --limit 10   # Process only 10 products (for testing)
    python3 scripts/image_scraper.py --reset       # Clear all images and re-scrape
"""

import os
import sys
import re
import time
import argparse
import json
import warnings
from urllib.parse import urlparse

import psycopg2
from psycopg2.extras import DictCursor

warnings.filterwarnings("ignore", category=RuntimeWarning)

try:
    from duckduckgo_search import DDGS
except ImportError:
    print("❌ Instala dependencias primero: pip3 install -r scripts/requirements.txt")
    sys.exit(1)


# ─── Config ─────────────────────────────────────────────────────
DATABASE_URL = os.environ.get(
    "DIRECT_URL",
    os.environ.get("DATABASE_URL", "")
)

# Words to strip from product names (packaging/dosage info, not useful for image search)
NOISE_WORDS = {
    "FCO", "FCOS", "TAB", "TABS", "CAP", "CAPS", "SOL", "SOLN",
    "JBE", "AMP", "SUSP", "CRA", "UNG", "OFT", "INY",
    "SPRAY", "POLVO", "SOBRES", "SOBRE", "PZA", "PZS",
    "ML", "MG", "GR", "KG", "LT", "OZ", "CM", "MM",
    "C", "CON", "DE", "EL", "EN", "LA", "LAS", "LOS", "UN", "UNA",
    "X", "Y", "POR", "DX",
}

# Rate limiting
DELAY_BETWEEN_SEARCHES = 1.5  # seconds


def parse_database_url(url: str) -> dict:
    """Parse PostgreSQL connection URL into components."""
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
    """
    Extract a clean, searchable product name from the nombre field.
    Examples:
        'SOLTRIM 80MG/400MG C/20 TABLETAS' → 'soltrim'
        'TEMPRA TAB 500MG C/20'             → 'tempra'
        'SUEROX VITAMINS NARANJA-MANGO 630 ML' → 'suerox vitamins naranja mango'
    """
    # Remove content in parentheses
    name = re.sub(r"\([^)]*\)", "", nombre).strip()

    # Split on common separators
    name = re.sub(r"[,/]", " ", name)

    # Split into words
    words = re.findall(r"[A-Za-záéíóúñÁÉÍÓÚÑ\-]+", name.upper())

    # Remove noise words, pure numbers, and dosage patterns like C/20
    cleaned = []
    for w in words:
        # Skip noise words
        if w in NOISE_WORDS:
            continue
        # Skip pure numbers
        if re.match(r"^\d+$", w):
            continue
        # Skip dosage patterns (80MG, 500ML, etc.)
        if re.match(r"^\d+[A-Z]+$", w):
            continue
        # Skip single character words
        if len(w) <= 1:
            continue
        cleaned.append(w)

    # Take first 3 meaningful words (more specific = better results)
    result = " ".join(cleaned[:3]).lower()
    return result if len(result) > 2 else nombre.split()[0].lower() if nombre else "medicamento"


def search_product_image(product_name: str, retries: int = 2) -> str | None:
    """
    Search DuckDuckGo for a product image.
    Returns the URL of the best image found, or None.
    """
    query = f"{product_name} medicamento farmacia mexico"

    for attempt in range(retries):
        try:
            with DDGS() as ddgs:
                results = list(ddgs.images(
                    keywords=query,
                    max_results=5,
                    size="Medium",
                    type_image="photo",
                    safesearch="moderate",
                ))

            if results:
                # Prefer images from known pharmaceutical sites
                preferred_domains = [
                    "fahorro.com", "superama.com", "farmaciasguadalajara",
                    "farmaciasbenavides", "walmart.com", "chedraui.com",
                    "mercadolibre", "amazon.com", "plm.com", "farmalisto",
                    "sanpablo.com", "pfrancesa.com", "lacomer.com",
                    "farmaciasdelahorro", "cornershop",
                ]

                for result in results:
                    url = result.get("image", "")
                    domain = urlparse(url).hostname or ""
                    if any(d in domain for d in preferred_domains):
                        return url

                # Fallback: return first result with ok dimensions
                for result in results:
                    w = result.get("width", 0)
                    h = result.get("height", 0)
                    if w >= 200 and h >= 200:
                        return result.get("image")

                # Last resort
                return results[0].get("image")

            return None

        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2)
            else:
                return None

    return None


def get_products(conn, limit: int | None = None, reset: bool = False) -> list:
    """Fetch products from the database."""
    with conn.cursor(cursor_factory=DictCursor) as cur:
        if reset:
            query = "SELECT id, clave, codigo, nombre FROM productos WHERE activo = true ORDER BY nombre"
        else:
            query = "SELECT id, clave, codigo, nombre FROM productos WHERE activo = true AND imagen IS NULL ORDER BY nombre"

        if limit:
            query += f" LIMIT {limit}"

        cur.execute(query)
        return cur.fetchall()


def update_product_image(conn, product_id: str, image_url: str):
    """Update a product's image URL in the database."""
    with conn.cursor() as cur:
        cur.execute(
            'UPDATE productos SET imagen = %s, "updatedAt" = NOW() WHERE id = %s',
            (image_url, product_id)
        )
    conn.commit()


def main():
    parser = argparse.ArgumentParser(description="NovaMedix Image Scraper")
    parser.add_argument("--limit", type=int, help="Max products to process")
    parser.add_argument("--reset", action="store_true", help="Re-scrape all products")
    parser.add_argument("--dry-run", action="store_true", help="Search but don't update DB")
    args = parser.parse_args()

    if not DATABASE_URL:
        print("❌ Set DIRECT_URL or DATABASE_URL environment variable")
        print('   Example: export DIRECT_URL="postgresql://..."')
        sys.exit(1)

    # Connect to database
    print("🔌 Connecting to database...")
    try:
        db_params = parse_database_url(DATABASE_URL)
        conn = psycopg2.connect(**db_params)
        print("✅ Connected\n")
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        sys.exit(1)

    # If reset, clear all images first
    if args.reset:
        with conn.cursor() as cur:
            cur.execute('UPDATE productos SET imagen = NULL, "updatedAt" = NOW()')
        conn.commit()
        print("🗑  All images cleared\n")

    # Fetch products
    products = get_products(conn, args.limit, args.reset)
    total = len(products)

    if total == 0:
        print("✨ All products already have images!")
        conn.close()
        return

    print(f"🔍 Processing {total} products...\n")

    found = 0
    failed = 0
    results_log = []

    for i, product in enumerate(products):
        product_id = product["id"]
        nombre = product["nombre"] or ""
        clave = product["clave"]

        # Clean the name for searching
        search_name = clean_product_name(nombre)

        # Progress
        progress = f"[{i + 1}/{total}]"
        display_name = nombre[:45].ljust(45)
        print(f"  {progress} {display_name} → \"{search_name}\"", end="", flush=True)

        # Search for image
        image_url = search_product_image(search_name)

        if image_url:
            found += 1
            print(f"  ✅")

            if not args.dry_run:
                update_product_image(conn, product_id, image_url)

            results_log.append({
                "clave": clave,
                "nombre": nombre,
                "search": search_name,
                "image": image_url,
                "status": "found"
            })
        else:
            failed += 1
            print(f"  ❌ no image found")
            results_log.append({
                "clave": clave,
                "nombre": nombre,
                "search": search_name,
                "image": None,
                "status": "not_found"
            })

        # Rate limit
        time.sleep(DELAY_BETWEEN_SEARCHES)

    # Summary
    print(f"\n{'─' * 55}")
    print(f"  ✅ Images found: {found}/{total}")
    print(f"  ❌ Not found:    {failed}/{total}")
    print(f"{'─' * 55}")

    # Save log
    log_path = os.path.join(os.path.dirname(__file__), "scraper_results.json")
    with open(log_path, "w", encoding="utf-8") as f:
        json.dump(results_log, f, ensure_ascii=False, indent=2)
    print(f"\n📄 Log saved to {log_path}")

    conn.close()
    print("🔌 Done")


if __name__ == "__main__":
    main()

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './db/prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const usuario = await prisma.usuario.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!usuario || !usuario.activo) {
                    return null;
                }

                const passwordMatch = await compare(
                    credentials.password as string,
                    usuario.password
                );

                if (!passwordMatch) {
                    return null;
                }

                return {
                    id: usuario.id,
                    email: usuario.email,
                    name: usuario.nombre,
                    role: usuario.rol,
                };
            },
        }),
    ],
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as { role: string }).role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as { role?: string }).role = token.role as string;
                (session.user as { id?: string }).id = token.id as string;
            }
            return session;
        },
    },
});

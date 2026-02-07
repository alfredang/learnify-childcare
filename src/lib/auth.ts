import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import type { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface User {
    role?: UserRole
    organizationId?: string | null
  }
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
      organizationId?: string | null
    }
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string
    role: UserRole
    organizationId?: string | null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials")
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          throw new Error("Invalid credentials")
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) {
          throw new Error("Invalid credentials")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          organizationId: user.organizationId,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role || "LEARNER"
        token.organizationId = user.organizationId || null
      }

      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, organizationId: true },
        })
        if (dbUser) {
          token.role = dbUser.role
          token.organizationId = dbUser.organizationId
        }
      }

      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
        session.user.organizationId = token.organizationId as string | null
      }
      return session
    },
  },
})

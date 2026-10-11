import { prisma } from "@/lib/prisma";
import { emailIsAdmin } from "@/lib/auth-role";
import { isValidEmail, normalizeEmail } from "@/lib/email";
import bcrypt from "bcryptjs";
import { type AuthOptions, type Profile } from "next-auth";
import type { User as DbUser } from "@/lib/generated/prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

function verifiedGoogleEmail(profile: Profile | undefined): string | null {
  if (!profile || typeof profile.email !== "string") return null;
  const verified = (profile as { email_verified?: unknown }).email_verified === true;
  if (!verified) return null;
  const email = normalizeEmail(profile.email);
  return isValidEmail(email) ? email : null;
}

function isUniqueEmail(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "P2002"
  );
}

/** Keep one User row for both Google and password sign-in. Password is never cleared. */
async function linkGoogleAccount(input: {
  email: string;
  name?: string | null;
  image?: string | null;
}): Promise<DbUser> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (!existing) {
    try {
      return await prisma.user.create({
        data: {
          email: input.email,
          name: input.name || null,
          image: input.image || null,
          emailVerified: new Date(),
        },
      });
    } catch (err) {
      if (!isUniqueEmail(err)) throw err;
      const raced = await prisma.user.findUnique({ where: { email: input.email } });
      if (!raced) throw err;
      return mergeGoogleProfile(raced, input);
    }
  }
  return mergeGoogleProfile(existing, input);
}

async function mergeGoogleProfile(
  existing: DbUser,
  input: { name?: string | null; image?: string | null },
): Promise<DbUser> {
  const name = existing.name ?? input.name ?? null;
  const image = existing.image ?? input.image ?? null;
  const emailVerified = existing.emailVerified ?? new Date();
  if (existing.name === name && existing.image === image && existing.emailVerified) {
    return existing;
  }
  return prisma.user.update({
    where: { id: existing.id },
    data: { name, image, emailVerified },
  });
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Enter your email and password");
        }

        const email = normalizeEmail(credentials.email);
        if (!isValidEmail(email)) {
          throw new Error("Incorrect email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.password) {
          throw new Error("No password account found for this email");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );

        if (!isPasswordValid) {
          throw new Error("Incorrect password");
        }

        if (!user.emailVerified) {
          throw new Error("Confirm your email before signing in");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/",
  },
  session: {
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;
      return verifiedGoogleEmail(profile) !== null;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        if (session.name === null) token.name = null;
        if (typeof session.image === "string" || session.image === null) {
          token.picture = session.image;
          token.image = session.image;
        }
      }

      if (account?.provider === "google") {
        const email = verifiedGoogleEmail(profile);
        if (!email) throw new Error("Google did not confirm this email");

        const dbUser = await linkGoogleAccount({
          email,
          name: user?.name,
          image: user?.image,
        });
        token.id = dbUser.id;
        token.sub = dbUser.id;
        token.email = dbUser.email;
        token.name = dbUser.name;
        token.image = dbUser.image;
        token.picture = dbUser.image;
      } else if (user?.id) {
        token.id = user.id;
        token.sub = user.id;
      }

      if (token.id && (user || account || !token.role)) {
        const row = await prisma.user.findUnique({
          where: { id: token.id },
          select: { role: true, email: true },
        });
        if (row) {
          const role = emailIsAdmin(row.email) ? "ADMIN" : row.role;
          if (role !== row.role) {
            await prisma.user.update({ where: { id: token.id }, data: { role } });
          }
          token.role = role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role === "ADMIN" ? "ADMIN" : "USER";
        if (token.email) session.user.email = token.email;
        session.user.name = token.name ?? null;
        session.user.image =
          (typeof token.picture === "string" ? token.picture : null) ??
          (typeof token.image === "string" ? token.image : null);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

import {
  getAuthProviderByNextAuthId,
  getConfiguredAuthProviders,
  linkOAuthAccount,
} from "@/lib/auth/oauth";
import { emailIsAdmin } from "@/lib/auth-role";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/roles";
import { promotePlatformAdmin } from "@/lib/studio/admin-unlimited";
import { type AuthOptions } from "next-auth";

/** Session JWT is stored in cookies — never put data URLs or OAuth secrets in it. */
function cookieSafeImage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!/^https?:\/\//i.test(value)) return null;
  return value;
}

function slimJwt(token: Record<string, unknown>) {
  delete token.access_token;
  delete token.refresh_token;
  delete token.id_token;
  delete token.accessToken;
  delete token.refreshToken;
  delete token.idToken;
  const image = cookieSafeImage(token.image ?? token.picture);
  token.image = image;
  token.picture = image;
  return token;
}

export const authOptions: AuthOptions = {
  providers: getConfiguredAuthProviders().map((p) => p.createProvider()),
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
      const provider = getAuthProviderByNextAuthId(account?.provider);
      if (!provider) return false;

      const email = provider.resolveEmail(profile);
      if (!email) return false;

      const row = await prisma.user.findUnique({
        where: { email },
        select: { bannedAt: true },
      });
      if (row?.bannedAt) return false;
      return true;
    },
    async jwt({ token, user, account, profile, trigger, session }) {
      if (trigger === "update" && session) {
        if (typeof session.name === "string") token.name = session.name;
        if (session.name === null) token.name = null;
        if (typeof session.image === "string" || session.image === null) {
          const image = cookieSafeImage(session.image);
          token.picture = image;
          token.image = image;
        }
      }

      const provider = getAuthProviderByNextAuthId(account?.provider);
      if (provider) {
        const email = provider.resolveEmail(profile);
        if (!email) throw new Error("OAuth provider did not confirm this email");

        const dbUser = await linkOAuthAccount({
          email,
          name: user?.name,
          image: cookieSafeImage(user?.image),
        });
        if (dbUser.bannedAt) {
          throw new Error("This account has been suspended");
        }
        token.id = dbUser.id;
        token.sub = dbUser.id;
        token.email = dbUser.email;
        token.name = dbUser.name;
        const image = cookieSafeImage(dbUser.image);
        token.image = image;
        token.picture = image;
        token.banned = false;
      }

      if (token.id) {
        const row = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            email: true,
            unlimitedGenerations: true,
            bannedAt: true,
          },
        });
        if (!row || row.bannedAt) {
          token.banned = true;
          delete token.role;
        } else {
          token.banned = false;
          if (user || account || !token.role) {
            const role = emailIsAdmin(row.email) ? UserRole.ADMIN : row.role;
            const needsAdminSync =
              role === UserRole.ADMIN &&
              (role !== row.role || !row.unlimitedGenerations);
            if (needsAdminSync) {
              await promotePlatformAdmin(token.id as string);
            }
            token.role = role;
          }
        }
      }
      return slimJwt(token as Record<string, unknown>) as typeof token;
    },
    async session({ session, token }) {
      if (token.banned) {
        return { ...session, user: undefined as never, expires: session.expires };
      }
      if (session.user) {
        session.user.id = token.id;
        session.user.role =
          token.role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.USER;
        if (token.email) session.user.email = token.email;
        session.user.name = token.name ?? null;
        session.user.image = cookieSafeImage(token.picture ?? token.image);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

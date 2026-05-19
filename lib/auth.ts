import NextAuth from "next-auth";
import Resend from "next-auth/providers/resend";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./db";
import { sendMagicLink } from "./email/magic-link";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    verifyRequest: "/login/check-email",
  },
  providers: [
    Resend({
      // Auth.js requires non-empty apiKey to construct the provider; the actual
      // send is delegated to sendVerificationRequest so we route around it in dev.
      apiKey: process.env.RESEND_API_KEY || "dev-no-op",
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      async sendVerificationRequest({ identifier, url }) {
        await sendMagicLink({ to: identifier, url });
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Block sign-ins for users not pre-provisioned by an admin.
      // (Magic-link sign-ins create User rows by default; we want allow-list only.)
      if (!user.email) return false;
      const existing = await db.user.findUnique({
        where: { email: user.email },
        select: { id: true },
      });
      return Boolean(existing);
    },
    async jwt({ token, user, trigger }) {
      // On sign-in or update, refresh role/entity from DB.
      if (user?.email || trigger === "update") {
        const email = user?.email ?? token.email;
        if (typeof email === "string") {
          const dbUser = await db.user.findUnique({
            where: { email },
            select: { id: true, role: true, entityId: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.entityId = dbUser.entityId;
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (typeof token.id === "string") session.user.id = token.id;
      if (typeof token.role === "string") {
        session.user.role = token.role as typeof session.user.role;
      }
      session.user.entityId =
        typeof token.entityId === "string" ? token.entityId : null;
      return session;
    },
  },
});

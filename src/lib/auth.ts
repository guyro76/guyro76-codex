import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseSignIn } from "./supabase";

// Fallback secret so JWT signing works on the live deployment even before
// NEXTAUTH_SECRET is set in the host environment.
const NEXTAUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  "c72ab1c8595fcfdf8082bc20fb757401465bf2aca21642bd0981b80d3786f498";

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID || "",
      clientSecret: process.env.APPLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("דואר אלקטרוני וסיסמה נדרשים");
        }

        const user = await supabaseSignIn(
          credentials.email,
          credentials.password
        );

        if (!user) {
          throw new Error("דואר אלקטרוני או סיסמה לא נכונים");
        }

        return {
          id: user.id,
          email: user.email,
          name:
            user.user_metadata?.name ||
            user.user_metadata?.full_name ||
            user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "user";
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

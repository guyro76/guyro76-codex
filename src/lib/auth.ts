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

/**
 * Owner access code — sign in with a single code, no password.
 *
 * The code is a password equivalent: anyone holding it becomes admin. It is
 * therefore read from the environment and never committed, and the comparison
 * is constant-time so a wrong code leaks nothing about the right one.
 *
 * Set POSTWAVE_ACCESS_CODE (and ADMIN_EMAIL for the account it signs in as).
 * With no code configured, this provider refuses every attempt rather than
 * falling back to something guessable.
 */
const ACCESS_CODE = (process.env.POSTWAVE_ACCESS_CODE || "").trim();
const OWNER_EMAIL = (process.env.ADMIN_EMAIL || "").trim();

function codeMatches(given: string): boolean {
  if (!ACCESS_CODE) return false;
  // Reject early only on an empty input; length is compared inside the loop
  // so timing does not reveal the configured length.
  if (!given) return false;
  const a = ACCESS_CODE;
  const b = given;
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) {
    diff |= (a.charCodeAt(i % a.length) || 0) ^ (b.charCodeAt(i % b.length) || 0);
  }
  return diff === 0;
}

export const authOptions: NextAuthOptions = {
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    // A year: signing in with the code is meant to be the last time a
    // password is needed on this device.
    maxAge: 365 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 365 * 24 * 60 * 60,
  },
  providers: [
    CredentialsProvider({
      id: "access-code",
      name: "Access code",
      credentials: {
        code: { label: "קוד כניסה", type: "password" },
      },
      async authorize(credentials) {
        const given = (credentials?.code || "").trim();

        if (!ACCESS_CODE) {
          throw new Error("כניסה עם קוד אינה מוגדרת בשרת");
        }
        if (!codeMatches(given)) {
          throw new Error("קוד כניסה שגוי");
        }

        return {
          id: "owner",
          email: OWNER_EMAIL || "owner@postwave.local",
          name: "Guy Rozenberg",
          role: "admin",
        };
      },
    }),
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

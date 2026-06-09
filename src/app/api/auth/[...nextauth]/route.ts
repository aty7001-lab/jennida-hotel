import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@hotel.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log("Login attempt for:", credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }
        
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });
          
          console.log("User found:", !!user);

          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          console.log("Password valid:", isPasswordValid);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            branchId: user.branchId
          };
        } catch (error) {
          console.error("Authorize Error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.branchId = user.branchId;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.branchId = token.branchId;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt" as const
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

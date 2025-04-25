import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "../../../../lib/mongodb";
import User from "../../../../models/User";

// Initialize MongoDB client for adapter
const clientPromise = (async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is not defined');
  
  const client = new MongoClient(uri);
  return client.connect();
})();

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // Allow linking accounts with the same email
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      // Allow linking accounts with the same email
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        await connectToDatabase();
        
        // Find user by email and provider, and explicitly select the password field
        const user = await User.findOne({ 
          email: credentials.email,
          authProviders: 'credentials'
        }).select("+password");
        
        if (!user) {
          return null;
        }
        
        // Check if password matches
        const isMatch = await user.comparePassword(credentials.password);
        
        if (!isMatch) {
          return null;
        }
        
        // Return user without password
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          authProviders: user.authProviders,
        };
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user ID and provider info to the session
      if (session?.user) {
        session.user.id = token.sub;
        // Add provider information to the session
        if (token.provider) {
          session.user.provider = token.provider;
        }
        // Add provider-specific name if available
        if (token.providerName) {
          session.user.providerName = token.providerName;
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      
      // Store provider information when signing in
      if (account) {
        token.provider = account.provider;
        
        // Store provider-specific name
        if (user?.name) {
          token.providerName = user.name;
        }
      }
      
      return token;
    },
    async signIn({ user, account, profile: _ }) {
      if (account) {
        try {
          // Connect to the database
          await connectToDatabase();
          
          // When using OAuth providers, the ID from the provider may not match MongoDB's ObjectId format
          // Instead of finding by ID, we should find by email which is more reliable across providers
          if (user.email) {
            // Find the user by email (with any provider)
            const dbUser = await User.findOne({ email: user.email });
            
            if (dbUser) {
              // For OAuth providers, we want to allow sign-in even if the email exists with another provider
              // This is the key part that fixes the OAuthAccountNotLinked error
              const provider = account.provider;
              
              // Add the provider to the user's authProviders array if not already present
              if (provider && !dbUser.authProviders.includes(provider)) {
                dbUser.authProviders.push(provider);
                await dbUser.save();
              }
              
              // Return true to allow sign-in
              return true;
            }
          }
        } catch (error) {
          console.error("Error updating auth providers:", error);
          // Continue sign-in process even if tracking fails
        }
      }
      
      // Allow all sign-ins to proceed
      return true;
    }
  },
  events: {
    createUser: async ({ user }) => {
      try {
        await connectToDatabase();
        
        // Check if authProviders exists and has values
        if (!user.authProviders || user.authProviders.length === 0) {
          // Find user by email which is more reliable than ID across providers
          if (user.email) {
            const dbUser = await User.findOne({ email: user.email });
            
            if (dbUser && !dbUser.authProviders?.length) {
              // Set the auth provider based on the account type
              dbUser.authProviders = ['oauth'];
              await dbUser.save();
            }
          }
        }
      } catch (error) {
        console.error("Error in createUser event:", error);
      }
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
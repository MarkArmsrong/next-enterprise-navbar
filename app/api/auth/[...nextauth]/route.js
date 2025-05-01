import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import mongoose from "mongoose"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import connectToDatabase from "../../../../lib/mongodb"
import User from "../../../../models/User"

// Initialize MongoDB client for adapter
const clientPromise = (async () => {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error("MONGODB_URI is not defined")

  const client = new MongoClient(uri)
  return client.connect()
})()

// Determine if we're in development or production
const isDevelopment = process.env.NODE_ENV === "development"

// Debug message about current environment
console.log(`NextAuth initializing in ${isDevelopment ? "DEVELOPMENT" : "PRODUCTION"} mode`)
console.log(`Using NEXTAUTH_URL: ${process.env.NEXTAUTH_URL}`)

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  debug: true, // Always enable debug for better error logs in production
  logger: {
    error: (code, metadata) => {
      console.error(`NextAuth Error [${code}]:`, metadata)
      // Log additional information for redirect_uri errors
      if (code === 'oauth_callback_error') {
        console.error('OAuth Callback Error Details:', {
          provider: metadata?.provider,
          error: metadata?.error,
          message: metadata?.message,
          stack: metadata?.stack,
          redirectUrl: process.env.NEXTAUTH_URL,
          callbackUrl: `${process.env.NEXTAUTH_URL}/api/auth/callback/${metadata?.provider || 'unknown'}`
        })
      }
    },
    warn: (code) => {
      console.warn(`NextAuth Warning [${code}]`)
    },
    debug: (code, metadata) => {
      console.log(`NextAuth Debug [${code}]:`, metadata)
    },
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await connectToDatabase()

        // Find user by email and provider, and explicitly select the password field
        const user = await User.findOne({
          email: credentials.email,
          authProviders: "credentials",
        }).select("+password")

        if (!user) {
          return null
        }

        // Check if password matches
        const isMatch = await user.comparePassword(credentials.password)

        if (!isMatch) {
          return null
        }

        // Return user without password
        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          image: user.image,
          authProviders: user.authProviders,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user ID and provider info to the session
      if (session?.user) {
        session.user.id = token.sub
        // Add provider information to the session
        if (token.provider) {
          session.user.provider = token.provider
        }
        // Add provider-specific name if available
        if (token.providerName) {
          session.user.providerName = token.providerName
        }
        // Always set the image to the provider-specific image if available
        if (token.providerImage) {
          session.user.image = token.providerImage
        } else {
          // fallback to default image if providerImage is not set
          session.user.image = session.user.image || null
        }
      }
      return session
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
      }

      // Store provider information when signing in
      if (account) {
        token.provider = account.provider

        // Store provider-specific name
        if (user?.name) {
          token.providerName = user.name
        }

        if (account.provider === "github") {
          if (user?.githubImage) {
            token.providerImage = user.githubImage
          } else if (user?.image) {
            token.providerImage = user.image
          }
        } else if (account.provider === "google") {
          if (user?.googleImage) {
            token.providerImage = user.googleImage
          } else if (user?.image) {
            token.providerImage = user.image
          }
        } else if (user?.image) {
          token.providerImage = user.image
        }

        // After initial sign-in, fetch the user from the database to get provider-specific data
        try {
          await connectToDatabase()
          const dbUser = await User.findOne({ email: user.email })

          if (dbUser) {
            // Store provider-specific images based on the current provider
            if (account.provider === "github") {
              if (dbUser.githubImage) {
                token.providerImage = dbUser.githubImage
              } else if (dbUser.image) {
                token.providerImage = dbUser.image
              }
            } else if (account.provider === "google") {
              if (dbUser.googleImage) {
                token.providerImage = dbUser.googleImage
              } else if (dbUser.image) {
                token.providerImage = dbUser.image
              }
            } else if (dbUser.image) {
              token.providerImage = dbUser.image
            }
          }
        } catch (error) {
          console.error("Error fetching user data for token:", error)
        }
      }

      return token
    },
    async signIn({ user, account, profile: _ }) {
      if (account) {
        try {
          // Connect to the database
          await connectToDatabase()

          if (user.email) {
            // Find the user by email
            const dbUser = await User.findOne({ email: user.email })

            if (dbUser) {
              const provider = account.provider

              // Track the provider and profile data
              let updateData = {}

              // Add the provider to the user's authProviders array if not already present
              if (provider && !dbUser.authProviders.includes(provider)) {
                updateData.authProviders = [...dbUser.authProviders, provider]
              }

              // Store provider-specific data in the database
              if (provider === "github" && user.image && !user.githubImage) {
                updateData.githubImage = user.image
              } else if (provider === "google" && user.image && !user.googleImage) {
                updateData.googleImage = user.image
              }

              // Apply updates if we have any
              if (Object.keys(updateData).length > 0) {
                await User.findByIdAndUpdate(dbUser._id, updateData)
              }

              return true
            }
          }
        } catch (error) {
          console.error("Error updating auth providers:", error)
        }
      }

      return true
    },
  },
  events: {
    createUser: async ({ user, account }) => {
      try {
        await connectToDatabase()

        // Find the newly created user
        const dbUser = await User.findOne({ email: user.email })

        if (dbUser) {
          // Update fields based on the account data
          const updates = {}

          // Set auth providers
          if (!dbUser.authProviders?.length) {
            if (account?.provider) {
              updates.authProviders = [account.provider]
            } else {
              updates.authProviders = ["oauth"]
            }
          }

          // Save provider-specific profile image
          if (user.image) {
            if (account?.provider === "github") {
              updates.githubImage = user.image
            } else if (account?.provider === "google") {
              updates.googleImage = user.image
            }
          }

          // Apply updates if we have any
          if (Object.keys(updates).length > 0) {
            await User.findByIdAndUpdate(dbUser._id, updates)
          }
        }
      } catch (error) {
        console.error("Error in createUser event:", error)
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
})

export { handler as GET, handler as POST }

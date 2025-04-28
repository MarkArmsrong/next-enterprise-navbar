import connectToDatabase from "../../../../lib/mongodb"
import User from "../../../../models/User"

export async function POST(request) {
  try {
    const { name, email, password } = await request.json()

    // Basic validation
    if (!name || !email || !password) {
      return new Response(JSON.stringify({ message: "Missing required fields" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ message: "Password must be at least 6 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Connect to database
    await connectToDatabase()

    // Check if user already exists with this email (any provider)
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return new Response(JSON.stringify({ message: "User with this email already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Create new user
    const newUser = await User.create({
      name,
      email,
      password, // Will be hashed via the mongoose pre-save hook
      authProviders: ["credentials"], // Mark this user as using credentials provider
    })

    // Return success but don't send the password
    const userWithoutPassword = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      createdAt: newUser.createdAt,
      authProviders: newUser.authProviders,
    }

    return new Response(JSON.stringify({ user: userWithoutPassword, message: "Registration successful" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Registration error:", error)
    return new Response(JSON.stringify({ message: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

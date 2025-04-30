"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { signIn } from "next-auth/react"
import { FormEvent, Suspense, useState } from "react"

function LoginContent() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get("error")

  let errorMessage = error
  // Prefer error from state, but if not present, use error from URL
  if (!errorMessage && urlError) {
    if (urlError === "CredentialsSignin") {
      errorMessage = "Invalid email or password. Please try again."
    } else if (urlError === "AccessDenied") {
      errorMessage = "Access denied. Please check your credentials or permissions."
    } else {
      errorMessage = "An unknown error occurred. Please try again."
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (isRegistering) {
      // Registration logic
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email, password }),
        })
        const data = (await res.json()) as { message?: string }

        if (!res.ok) {
          setError(data.message || "Registration failed")
          return // Do not attempt sign-in if registration failed
        }

        // After registration, log in automatically
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setError(result.error === "CredentialsSignin" ? "Invalid email or password. Please try again." : result.error)
          return
        }

        router.push("/")
      } catch (err) {
        setError((err as Error).message)
      }
    } else {
      // Login logic
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Invalid email or password. Please try again." : result.error)
        return
      }

      router.push("/")
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">{isRegistering ? "Create an Account" : "Sign In"}</h1>
          <p className="mt-2 text-sm text-gray-600">
            {isRegistering ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="font-medium text-indigo-600 transition duration-150 ease-in-out hover:text-indigo-500 focus:underline focus:outline-none"
            >
              {isRegistering ? "Sign In" : "Create one"}
            </button>
          </p>
        </div>

        <div className="space-y-4">
          {/* OAuth providers */}
          <div className="space-y-2">
            <button
              onClick={() => signIn("google", { callbackUrl: "/" })}
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            >
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path
                    fill="#4285F4"
                    d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                  />
                  <path
                    fill="#34A853"
                    d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                  />
                </g>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => signIn("github", { callbackUrl: "/" })}
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            >
              <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017C2 16.5 4.865 20.307 8.84 21.7C9.34 21.797 9.52 21.493 9.52 21.23C9.52 20.988 9.51 20.275 9.51 19.407C7 19.936 6.35 18.791 6.15 18.199C6.037 17.907 5.55 17.0057 5.1 16.775C4.74 16.593 4.2335 16.063 5.0935 16.0516C6.0 16.0516 6.56 16.8656 6.745 17.171C7.64 18.7296 8.976 18.241 9.56 17.978C9.649 17.277 9.9124 16.8016 10.2 16.5506C7.975 16.2996 5.84 15.4206 5.84 11.633C5.84 10.547 6.22 9.6516 6.77 8.9556C6.672 8.704 6.32 7.7756 6.87 6.335C6.87 6.335 7.7 6.072 9.52 7.428C10.3291 7.2047 11.1726 7.092 12.02 7.0946C12.869 7.0946 13.73 7.2047 14.53 7.428C16.34 6.0603 17.17 6.335 17.17 6.335C17.72 7.7756 17.37 8.704 17.27 8.9556C17.82 9.6516 18.2 10.535 18.2 11.633C18.2 15.4326 16.05 16.2996 13.82 16.5506C14.19 16.8666 14.51 17.471 14.51 18.409C14.51 19.7396 14.5 20.894 14.5 21.23C14.5 21.493 14.68 21.803 15.19 21.7C19.259 20.3065 21.9995 16.4378 22 12.017C22 6.484 17.52 2 12 2Z"
                ></path>
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Email/Password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isRegistering ? "new-password" : "current-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder={isRegistering ? "Create a password" : "Enter your password"}
              />
            </div>

            {errorMessage && <div className="rounded bg-red-50 p-3 text-sm text-red-600">{errorMessage}</div>}

            <div>
              <button
                type="submit"
                className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
              >
                {isRegistering ? "Create Account" : "Sign In"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-80px)] items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

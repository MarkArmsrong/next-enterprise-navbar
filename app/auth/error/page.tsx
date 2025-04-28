"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function ErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "An error occurred during authentication."

  // Handle different error types
  if (error === "Configuration") {
    errorMessage = "There is a problem with the server configuration."
  } else if (error === "AccessDenied") {
    errorMessage = "Access denied. You do not have permission to sign in."
  } else if (error === "Verification") {
    errorMessage = "The verification link has expired or has already been used."
  } else if (
    error === "OAuthSignin" ||
    error === "OAuthCallback" ||
    error === "OAuthCreateAccount" ||
    error === "EmailCreateAccount"
  ) {
    errorMessage = "There was an error during the OAuth authentication process."
  } else if (error === "EmailSignin") {
    errorMessage = "The email could not be sent or the email provider is not properly configured."
  } else if (error === "CredentialsSignin") {
    errorMessage = "Invalid sign in credentials. Please check your email and password."
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 text-center shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Authentication Error</h1>
          <div className="mt-6 text-red-600">{errorMessage}</div>
        </div>
        <div className="mt-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  )
}

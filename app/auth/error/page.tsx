"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense, useState } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")
  const [showDebugInfo, setShowDebugInfo] = useState(false)

  let errorMessage = "An error occurred during authentication."
  let errorDetails = errorDescription || "No additional error details available."

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
    if (error === "OAuthCallback") {
      errorMessage = "Error during OAuth callback. This might be due to a misconfigured redirect URI."
    }
  } else if (error === "EmailSignin") {
    errorMessage = "The email could not be sent or the email provider is not properly configured."
  } else if (error === "CredentialsSignin") {
    errorMessage = "Invalid sign in credentials. Please check your email and password."
  }

  // Extract OAuth-specific errors that might be passed in the URL
  const provider = searchParams.get("provider") || "Unknown"
  const callbackUrl = searchParams.get("callbackUrl") || "Not provided"

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 text-center shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Authentication Error</h1>
          <div className="mt-6 text-red-600">{errorMessage}</div>
          {errorDescription && (
            <div className="mt-2 text-sm text-gray-600">
              <p>{errorDescription}</p>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="mt-4 text-sm text-blue-600 underline"
        >
          {showDebugInfo ? "Hide" : "Show"} Debug Information
        </button>
        
        {showDebugInfo && (
          <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-4 text-left text-xs">
            <h3 className="font-bold">Debug Information:</h3>
            <ul className="mt-2 space-y-1">
              <li><span className="font-medium">Error Code:</span> {error || "None"}</li>
              <li><span className="font-medium">Provider:</span> {provider}</li>
              <li><span className="font-medium">Callback URL:</span> {callbackUrl}</li>
              <li><span className="font-medium">Error Details:</span> {errorDetails}</li>
              {/* Include all search params for debugging */}
              <li className="mt-2 pt-2 border-t border-gray-200">
                <details>
                  <summary className="cursor-pointer font-medium">All Parameters</summary>
                  <pre className="mt-2 overflow-auto max-h-40">
                    {Array.from(searchParams.entries()).map(([key, value]) => (
                      `${key}: ${value}\n`
                    ))}
                  </pre>
                </details>
              </li>
            </ul>
          </div>
        )}
        
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

export default function ErrorPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-80px)] items-center justify-center">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  )
}

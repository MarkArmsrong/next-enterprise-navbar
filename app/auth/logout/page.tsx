"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"

export default function LogoutPage() {
  useEffect(() => {
    // Perform sign out immediately when the page is accessed
    signOut({ callbackUrl: "/" })
  }, [])

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 text-center shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Logging out...</h1>
          <p className="mt-2 text-gray-600">You are being signed out.</p>
        </div>
      </div>
    </div>
  )
}

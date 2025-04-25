'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  let errorMessage = 'An error occurred during authentication.';
  
  // Handle different error types
  if (error === 'Configuration') {
    errorMessage = 'There is a problem with the server configuration.';
  } else if (error === 'AccessDenied') {
    errorMessage = 'Access denied. You do not have permission to sign in.';
  } else if (error === 'Verification') {
    errorMessage = 'The verification link has expired or has already been used.';
  } else if (error === 'OAuthSignin' || error === 'OAuthCallback' || error === 'OAuthCreateAccount' || error === 'EmailCreateAccount') {
    errorMessage = 'There was an error during the OAuth authentication process.';
  } else if (error === 'EmailSignin') {
    errorMessage = 'The email could not be sent or the email provider is not properly configured.';
  } else if (error === 'CredentialsSignin') {
    errorMessage = 'Invalid sign in credentials. Please check your email and password.';
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-80px)] bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md text-center">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Authentication Error</h1>
          <div className="mt-6 text-red-600">{errorMessage}</div>
        </div>
        <div className="mt-6">
          <Link 
            href="/auth/login" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
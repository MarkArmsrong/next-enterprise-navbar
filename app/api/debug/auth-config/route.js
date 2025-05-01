import { NextResponse } from 'next/server';

export async function GET() {
  // Collect environment variables related to authentication for debugging purposes
  const authConfig = {
    environment: process.env.NODE_ENV,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
    googleConfigured: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
    githubConfigured: !!process.env.GITHUB_ID && !!process.env.GITHUB_SECRET,
    callbackUrls: {
      google: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/google` : null,
      github: process.env.NEXTAUTH_URL ? `${process.env.NEXTAUTH_URL}/api/auth/callback/github` : null,
    },
    // Only show masked IDs and secrets for security
    googleClientId: process.env.GOOGLE_CLIENT_ID ? maskString(process.env.GOOGLE_CLIENT_ID) : null,
    githubClientId: process.env.GITHUB_ID ? maskString(process.env.GITHUB_ID) : null,
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    authConfig,
    headers: {
      host: headers().get('host'),
      referer: headers().get('referer'),
    }
  });
}

// Helper function to mask sensitive information
function maskString(str) {
  if (!str) return null;
  if (str.length <= 8) return '****';
  return str.substring(0, 4) + '****' + str.substring(str.length - 4);
}

function headers() {
  const headers = new Headers();
  
  // Try to capture headers if available in this environment
  try {
    if (typeof window !== 'undefined') {
      return window.headers;
    }
    
    // We're returning an empty Headers object as fallback
    return headers;
  } catch (e) {
    return headers;
  }
}
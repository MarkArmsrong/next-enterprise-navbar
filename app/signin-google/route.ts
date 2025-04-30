import { redirect } from 'next/navigation';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Get all search parameters from the incoming request
  const searchParams = request.nextUrl.searchParams;
  const queryString = searchParams.toString();
  
  // Construct the NextAuth callback URL with the original query parameters
  const redirectUrl = `/api/auth/callback/google${queryString ? `?${queryString}` : ''}`;
  
  // Redirect to the NextAuth callback URL
  return redirect(redirectUrl);
}
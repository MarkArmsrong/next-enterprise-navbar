/**
 * @jest-environment node
 */

// This is a basic test file to verify environment variables are set correctly
describe('NextAuth Environment Test', () => {
  it('should have environment variables set up', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.NEXTAUTH_SECRET).toBeDefined();
    expect(process.env.NEXTAUTH_URL).toBeDefined();
  });
});
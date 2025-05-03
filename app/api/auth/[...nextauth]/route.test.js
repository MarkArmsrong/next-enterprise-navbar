/**
 * @jest-environment node
 */

// Global mocks to store configurations
global.nextAuthConfig = undefined;
global.credentialsConfig = undefined;
global.githubConfig = undefined;
global.googleConfig = undefined;

// Simple mocks for all dependencies with virtual: true
jest.mock("@auth/mongodb-adapter", () => {
  return {
    MongoDBAdapter: jest.fn(() => "mocked-mongodb-adapter")
  };
}, { virtual: true });

jest.mock("mongodb", () => {
  return {
    MongoClient: jest.fn(() => ({
      connect: jest.fn(() => Promise.resolve("mocked-connection"))
    }))
  };
}, { virtual: true });

// Mock next-auth to capture config
jest.mock("next-auth", () => {
  const mockNextAuth = jest.fn(config => {
    global.nextAuthConfig = config;
    return { GET: "handler", POST: "handler" };
  });
  return mockNextAuth;
}, { virtual: true });

// Mock credentials provider to capture config
jest.mock("next-auth/providers/credentials", () => {
  const mockCredentialsProvider = jest.fn(config => {
    global.credentialsConfig = config;
    return "mocked-credentials-provider";
  });
  return mockCredentialsProvider;
}, { virtual: true });

// Mock GitHub provider to capture config
jest.mock("next-auth/providers/github", () => {
  const mockGitHubProvider = jest.fn(config => {
    global.githubConfig = config;
    return "mocked-github-provider";
  });
  return mockGitHubProvider;
}, { virtual: true });

// Mock Google provider to capture config
jest.mock("next-auth/providers/google", () => {
  const mockGoogleProvider = jest.fn(config => {
    global.googleConfig = config;
    return "mocked-google-provider";
  });
  return mockGoogleProvider;
}, { virtual: true });

// Mock database connection
jest.mock("../../../../lib/mongodb", () => {
  return jest.fn(() => Promise.resolve());
}, { virtual: true });

// Mock User model
jest.mock("../../../../models/User", () => {
  const mockUser = {
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(() => Promise.resolve({}))
  };
  // Create a mock valid user for testing
  const validUser = {
    _id: "user-id",
    email: "test@example.com",
    name: "Test User",
    image: "user-image.jpg",
    authProviders: ["credentials"],
    comparePassword: jest.fn(password => Promise.resolve(password === "password123"))
  };
  // Setup findOne implementations
  mockUser.findOne.mockImplementation(query => {
    if (query && query.email === "test@example.com") {
      if (query.authProviders === "credentials") {
        return { select: jest.fn().mockResolvedValue(validUser) };
      }
      return Promise.resolve({
        _id: "user-id",
        email: "test@example.com",
        authProviders: ["credentials"],
        _doc: { _id: "user-id", email: "test@example.com", authProviders: ["credentials"] }
      });
    } else if (query && query.email === "multi-provider@example.com") {
      return Promise.resolve({
        _id: "multi-user-id",
        email: "multi-provider@example.com",
        authProviders: ["google"],
        _doc: {
          _id: "multi-user-id",
          email: "multi-provider@example.com",
          authProviders: ["google"],
          googleImage: "https://google.com/avatar.jpg"
        }
      });
    } else if (query && query.email === "newuser@example.com") {
      return Promise.resolve({
        _id: "new-user-id",
        email: "newuser@example.com"
      });
    }
    // Default case (no user found)
    return { select: jest.fn().mockResolvedValue(null) };
  });
  return mockUser;
}, { virtual: true });

// Mock console methods to avoid test output clutter
const originalConsole = { log: console.log, error: console.error, warn: console.warn };
console.log = jest.fn();
console.error = jest.fn();
console.warn = jest.fn();

// Clean up after tests
afterAll(() => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
});

// Import the module once to trigger NextAuth initialization
beforeAll(async () => {
  try {
    await import("./route");
  } catch (error) {
    console.error("Error importing route:", error);
  }
});

describe('NextAuth Basic Test', () => {
  // Basic environmental test
  it('should have environment variables set up', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.NEXTAUTH_SECRET).toBeDefined();
  });
});

describe('NextAuth Configuration Tests', () => {
  it('should initialize NextAuth with correct configuration', () => {
    // Verify NextAuth was called with expected configuration
    expect(global.nextAuthConfig).toBeDefined();
    expect(global.nextAuthConfig.debug).toBeDefined();
    expect(global.nextAuthConfig.adapter).toBe("mocked-mongodb-adapter");
    expect(global.nextAuthConfig.session.strategy).toBe("jwt");
    expect(global.nextAuthConfig.session.maxAge).toBe(30 * 24 * 60 * 60);
    expect(global.nextAuthConfig.pages.signIn).toBe("/auth/login");
  });

  it('should configure OAuth providers correctly', () => {
    // Verify providers were configured correctly
    expect(global.googleConfig).toBeDefined();
    expect(global.googleConfig.clientId).toBeDefined();
    expect(global.googleConfig.allowDangerousEmailAccountLinking).toBe(true);
    
    expect(global.githubConfig).toBeDefined();
    expect(global.githubConfig.clientId).toBeDefined();
    expect(global.githubConfig.allowDangerousEmailAccountLinking).toBe(true);
    
    // Verify provider array in NextAuth config
    expect(global.nextAuthConfig.providers).toContain("mocked-google-provider");
    expect(global.nextAuthConfig.providers).toContain("mocked-github-provider");
    expect(global.nextAuthConfig.providers).toContain("mocked-credentials-provider");
  });

  it('should have credentials, JWT and session callbacks', () => {
    // Verify callback functions exist
    expect(global.credentialsConfig.authorize).toBeInstanceOf(Function);
    expect(global.nextAuthConfig.callbacks.jwt).toBeInstanceOf(Function);
    expect(global.nextAuthConfig.callbacks.session).toBeInstanceOf(Function);
    expect(global.nextAuthConfig.callbacks.signIn).toBeInstanceOf(Function);
  });
  
  // Test session enhancement
  it('should enhance session with user data', async () => {
    // Extract session callback
    const sessionCallback = global.nextAuthConfig.callbacks.session;
    
    // Test with mock data
    const result = await sessionCallback({
      session: { user: { name: "Test User" } },
      token: { 
        sub: "user-id",
        provider: "google",
        providerName: "Google User",
        providerImage: "google-image.jpg"
      }
    });
    
    // Verify session enhancement
    expect(result.user).toMatchObject({
      name: "Test User",
      id: "user-id",
      provider: "google",
      providerName: "Google User",
      image: "google-image.jpg"
    });
  });
  
  // Test JWT callback
  it('should enhance token with provider info', async () => {
    // Extract JWT callback
    const jwtCallback = global.nextAuthConfig.callbacks.jwt;
    
    // Test with mock data
    const result = await jwtCallback({
      token: {},
      user: { id: "user-123", name: "Test User" },
      account: { provider: "github" }
    });
    
    // Verify token enhancement
    expect(result).toMatchObject({
      provider: "github"
    });
  });
});

// Additional test suite for error handling
describe('NextAuth Error Handling', () => {
  it('should have a custom logger with error handling', () => {
    expect(global.nextAuthConfig.logger).toBeDefined();
    expect(global.nextAuthConfig.logger.error).toBeInstanceOf(Function);
    
    // Reset console.error mock to check calls
    console.error.mockClear();
    
    // Simulate an OAuth callback error
    global.nextAuthConfig.logger.error("oauth_callback_error", {
      provider: "google",
      error: "access_denied",
      message: "User denied access"
    });
    
    // Verify detailed error logging
    expect(console.error).toHaveBeenCalledWith(
      "NextAuth Error [oauth_callback_error]:",
      expect.any(Object)
    );
    
    // Verify provider-specific error handling
    expect(console.error).toHaveBeenCalledWith(
      "OAuth Callback Error Details:",
      expect.objectContaining({
        provider: "google",
        error: "access_denied"
      })
    );
  });
  
  it('should handle credentials validation errors', async () => {
    const authorizeFn = global.credentialsConfig.authorize;
    
    // Test with invalid credentials
    const result = await authorizeFn({
      email: "test@example.com",
      password: "wrong-password"
    });
    
    // Should return null for failed authentication
    expect(result).toBeNull();
  });
  
  it('should handle nonexistent user errors', async () => {
    const authorizeFn = global.credentialsConfig.authorize;
    
    // Test with nonexistent user
    const result = await authorizeFn({
      email: "nonexistent@example.com",
      password: "password123"
    });
    
    // Should return null for nonexistent user
    expect(result).toBeNull();
  });
});

// Test suite for multi-provider account linking
describe('NextAuth Multi-Provider Account Linking', () => {
  it('should link multiple providers to a user account', async () => {
    // Extract signIn callback
    const signInCallback = global.nextAuthConfig.callbacks.signIn;
    
    // Import User model correctly
    const mockUser = jest.requireMock("../../../../models/User");
    // Reset the mock to verify calls
    mockUser.findByIdAndUpdate.mockClear();
    
    // Test signIn callback with existing user and new provider
    await signInCallback({
      user: {
        email: "multi-provider@example.com",
        image: "https://github.com/avatar.jpg"
      },
      account: {
        provider: "github"
      }
    });
    
    // Verify user record was updated with the new provider
    expect(mockUser.findByIdAndUpdate).toHaveBeenCalledWith(
      "multi-user-id",
      expect.objectContaining({
        authProviders: ["google", "github"],
        githubImage: "https://github.com/avatar.jpg"
      })
    );
  });
  
  it('should use provider-specific profile images', async () => {
    // Extract session callback
    const sessionCallback = global.nextAuthConfig.callbacks.session;
    
    // Test provider-specific image (Google)
    const googleResult = await sessionCallback({
      session: { user: { name: "Test User" } },
      token: { 
        sub: "user-id",
        provider: "google",
        providerImage: "https://google.com/avatar.jpg"
      }
    });
    
    expect(googleResult.user.image).toBe("https://google.com/avatar.jpg");
    
    // Test provider-specific image (GitHub)
    const githubResult = await sessionCallback({
      session: { user: { name: "Test User" } },
      token: { 
        sub: "user-id",
        provider: "github",
        providerImage: "https://github.com/avatar.jpg"
      }
    });
    
    expect(githubResult.user.image).toBe("https://github.com/avatar.jpg");
  });
});

// Test suite for custom pages configuration
describe('NextAuth Custom Pages Configuration', () => {
  it('should configure custom authentication pages', () => {
    // Verify custom pages configuration
    expect(global.nextAuthConfig.pages).toEqual({
      signIn: "/auth/login",
      signOut: "/auth/logout",
      error: "/auth/error"
    });
  });
});

// Test suite for JWT-based client-side authentication
describe('NextAuth Client-Side Authentication', () => {
  it('should use JWT strategy for client-side authentication', () => {
    // Verify JWT session strategy
    expect(global.nextAuthConfig.session.strategy).toBe("jwt");
    expect(global.nextAuthConfig.session.maxAge).toBe(30 * 24 * 60 * 60); // 30 days
  });
  
  it('should make user and provider information available client-side', async () => {
    // Extract session callback
    const sessionCallback = global.nextAuthConfig.callbacks.session;
    
    // Test with mock data including provider info
    const result = await sessionCallback({
      session: { user: { name: "Test User" } },
      token: { 
        sub: "user-id",
        provider: "github",
        providerName: "GitHub User"
      }
    });
    
    // Verify client-side session contains provider info
    expect(result.user).toMatchObject({
      name: "Test User",
      id: "user-id",
      provider: "github",
      providerName: "GitHub User"
    });
  });
});
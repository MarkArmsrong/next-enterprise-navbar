// This file sets up environment variables for Jest tests
process.env.MONGODB_URI = "mongodb://localhost:27017/test-db"
process.env.NEXTAUTH_SECRET = "test-secret-key-for-jest"
process.env.NEXTAUTH_URL = "http://localhost:3000"
process.env.GITHUB_ID = "test-github-id"
process.env.GITHUB_SECRET = "test-github-secret"
process.env.GOOGLE_CLIENT_ID = "test-google-client-id"
process.env.GOOGLE_CLIENT_SECRET = "test-google-client-secret"

// Mock the T3 env module to avoid validation errors
jest.mock("../env.mjs", () => ({
  env: {
    MONGODB_URI: "mongodb://localhost:27017/test-db",
    NEXTAUTH_SECRET: "test-secret-key-for-jest",
    NEXTAUTH_URL: "http://localhost:3000",
    GITHUB_ID: "test-github-id",
    GITHUB_SECRET: "test-github-secret",
    GOOGLE_CLIENT_ID: "test-google-client-id",
    GOOGLE_CLIENT_SECRET: "test-google-client-secret",
    ANALYZE: false,
  },
}));
import { describe, it, expect, beforeAll } from "vitest";
import { makeJWT, validateJWT, hashPassword, checkPasswordHash } from "../src/auth";
import { UnauthorizedError } from "../src/errors";

describe("Password Hashing", () => {
  const password1 = "correctPassword123!";
  const password2 = "anotherPassword456!";
  let hash1: string;
  let hash2: string;

  beforeAll(async () => {
    hash1 = await hashPassword(password1);
    hash2 = await hashPassword(password2);
  });

  it("Returns true for the correct password", async () => {
    const result = await checkPasswordHash(hash1, password1);
    expect(result).toBe(true);
  });

  it("Returns false for the correct password", async () => {
    const result = await checkPasswordHash(hash1, password2);
    expect(result).toBe(false);
  });

  it("Returns false for incorrect hash.", async () => {
    const result = await checkPasswordHash(hash2, password1);
    expect(result).toBe(false);
  });

  it("Returns false for empty password", async () => {
    const result = await checkPasswordHash(hash1, "");
    expect(result).toBe(false);
  });
});

describe("JWT Functions", () => {
  const secret = "secret";
  const wrongSecret = "wrong_secret";
  const userID = "some-unique-user-id";
  let validToken: string;

  beforeAll(() => {
    validToken = makeJWT(userID, 3600, secret);
  });

  it("should validate a valid token", () => {
    const result = validateJWT(validToken, secret);
    expect(result).toBe(userID);
  });

  it("should throw an error for an invalid token string", () => {
    expect(() => validateJWT("invalid.token.string", secret))
      .toThrow(UnauthorizedError,);
  });

  it("should throw an error when the token is signed with a wrong secret", () => {
    expect(() => validateJWT(validToken, wrongSecret))
      .toThrow(UnauthorizedError);
  });
});
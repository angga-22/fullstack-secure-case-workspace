import { beforeEach, describe, expect, test, vi } from "vitest";
import * as authService from ".";
import * as userRepo from "../../repositories/userRepository";
import * as passwordUtils from "../../utils/password";
import * as authUtils from "../../utils/auth";

/**
 * Mocks
 */
vi.mock("../../repositories/userRepository", () => ({
  __esModule: true,
  findUserByEmail: vi.fn(),
  createUser: vi.fn(),
}));

vi.mock("../../utils/password", () => ({
  __esModule: true,
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

vi.mock("../../utils/auth", () => ({
  __esModule: true,
  createSessionToken: vi.fn(),
}));

describe("Auth Service Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * =========================
   * REGISTER
   * =========================
   */
  describe("register", () => {
    test("should create user when email is not taken", async () => {
      const input = {
        email: "test@example.com",
        password: "password123",
        firstName: "John",
        lastName: "Doe",
        role: "CLIENT",
      };

      (userRepo.findUserByEmail as any).mockResolvedValue(null);
      (passwordUtils.hashPassword as any).mockResolvedValue("hashed-password");

      const createdUser = {
        id: "user-1",
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
      };

      (userRepo.createUser as any).mockResolvedValue(createdUser);

      const result = await authService.register(input);

      expect(userRepo.findUserByEmail).toHaveBeenCalledWith(input.email);
      expect(passwordUtils.hashPassword).toHaveBeenCalledWith(input.password);
      expect(userRepo.createUser).toHaveBeenCalledWith({
        email: input.email,
        passwordHash: "hashed-password",
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
      });
      expect(result).toEqual(createdUser);
    });

    test("should throw error if email already exists", async () => {
      (userRepo.findUserByEmail as any).mockResolvedValue({
        id: "existing-user",
      });

      await expect(
        authService.register({
          email: "test@example.com",
        }),
      ).rejects.toThrow("Email already in use");

      expect(userRepo.createUser).not.toHaveBeenCalled();
    });
  });

  /**
   * =========================
   * LOGIN
   * =========================
   */
  describe("login", () => {
    test("should login successfully with valid credentials", async () => {
      const user = {
        id: "user-1",
        email: "test@example.com",
        passwordHash: "hashed-password",
        role: "CLIENT",
        firstName: "John",
        lastName: "Doe",
      };

      (userRepo.findUserByEmail as any).mockResolvedValue(user);
      (passwordUtils.comparePassword as any).mockResolvedValue(true);
      (authUtils.createSessionToken as any).mockResolvedValue("jwt-token");

      const result = await authService.login("test@example.com", "password123");

      expect(userRepo.findUserByEmail).toHaveBeenCalledWith("test@example.com");
      expect(passwordUtils.comparePassword).toHaveBeenCalledWith(
        "password123",
        user.passwordHash,
      );
      expect(authUtils.createSessionToken).toHaveBeenCalledWith(
        user.id,
        user.role,
      );

      expect(result).toEqual({
        token: "jwt-token",
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
        },
      });
    });

    test("should throw error if user does not exist", async () => {
      (userRepo.findUserByEmail as any).mockResolvedValue(null);

      await expect(
        authService.login("missing@example.com", "password"),
      ).rejects.toThrow("Invalid credentials");

      expect(passwordUtils.comparePassword).not.toHaveBeenCalled();
    });

    test("should throw error if password is invalid", async () => {
      const user = {
        id: "user-1",
        email: "test@example.com",
        passwordHash: "hashed-password",
      };

      (userRepo.findUserByEmail as any).mockResolvedValue(user);
      (passwordUtils.comparePassword as any).mockResolvedValue(false);

      await expect(
        authService.login("test@example.com", "wrong-password"),
      ).rejects.toThrow("Invalid credentials");

      expect(authUtils.createSessionToken).not.toHaveBeenCalled();
    });
  });
});

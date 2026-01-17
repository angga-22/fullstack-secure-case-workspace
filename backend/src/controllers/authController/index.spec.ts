import { beforeEach, describe, expect, test, vi } from "vitest";
import * as authController from ".";
import * as authService from "../../services/authService";
import { HTTP_STATUS } from "../../constants";
import type { Request, Response } from "express";

// mocks
vi.mock("../../services/authService", () => ({
  __esModule: true,
  register: vi.fn(),
  login: vi.fn(),
}));

// helpers
const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.clearCookie = vi.fn().mockReturnValue(res);
  return res;
};

const mockRequest = (overrides: Partial<Request> = {}): Request =>
  ({
    body: {},
    ip: "127.0.0.1",
    ...overrides,
  }) as Request;

describe("Auth Controller Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handleRegister", () => {
    test("it should register user with valid payload", async () => {
      const req = mockRequest({
        body: {
          email: "test@example.com",
          password: "password123",
          firstName: "John",
          lastName: "Doe",
          role: "CLIENT",
        },
      });

      const res = mockResponse();

      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        role: "CLIENT",
      };
      (authService.register as any).mockResolvedValue(mockUser);
      await authController.handleRegister(req, res);
      expect(authService.register).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          statusCode: 201,
          data: mockUser,
        }),
      );
    });

    test("it should fails when payload is invalid", async () => {
      const req = mockRequest({
        body: {
          email: "not-an-email",
          password: "123",
          firstName: "",
          lastName: "",
          role: "CLIENT",
        },
      });

      const res = mockResponse();

      await authController.handleRegister(req, res);

      expect(authService.register).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: 400,
        }),
      );
    });

    test("it should fails when authService throws wrror", async () => {
      const req = mockRequest({
        body: {
          email: "test@example.com",
          password: "password123",
          firstName: "John",
          lastName: "Doe",
          role: "CLIENT",
        },
      });

      const res = mockResponse();

      (authService.register as any).mockRejectedValue(
        new Error("Email already exists"),
      );

      await authController.handleRegister(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Email already exists",
        }),
      );
    });
  });
  describe("handle login", () => {
    test("it should logs in user and set auth cookie", async () => {
      const req = mockRequest({
        body: {
          email: "test@example.com",
          password: "password123",
        },
      });

      const res = mockResponse();

      const mockUser = {
        id: "user-1",
        email: "test@example.com",
        role: "CLIENT",
      };

      (authService.login as any).mockResolvedValue({
        token: "paseto-token",
        user: mockUser,
      });

      await authController.handleLogin(req, res);

      expect(authService.login).toHaveBeenCalledWith(
        "test@example.com",
        "password123",
      );

      expect(res.cookie).toHaveBeenCalledWith(
        "auth_token",
        "paseto-token",
        expect.objectContaining({
          httpOnly: true,
          sameSite: "strict",
        }),
      );

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: mockUser,
        }),
      );
    });
    test("it should fails login with invalid credentials", async () => {
      const req = mockRequest({
        body: {
          email: "test@example.com",
          password: "wrong-password",
        },
      });

      const res = mockResponse();

      (authService.login as any).mockRejectedValue(new Error("Invalid login"));

      await authController.handleLogin(req, res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.UNAUTHORIZED);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid email or password",
        }),
      );
    });
  });
  describe("handle logout", () => {
    test("clears auth cookie and returns success", async () => {
      const req = mockRequest();
      const res = mockResponse();

      await authController.handleLogout(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("auth_token");
      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message: "Logged out successfully",
        }),
      );
    });
  });
});

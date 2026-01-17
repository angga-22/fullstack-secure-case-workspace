import { Request, Response } from "express";
import * as authService from "@/services/authService";
import { z } from "zod";
import ResponseBuilder from "@/utils/ResponseBuilder";
import { HTTP_STATUS } from "@/constants";
import { logger } from "@/utils/logger";

// Validation Schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(["CLIENT", "LAWYER"]),
});

export const handleRegister = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const user = await authService.register(validatedData);

    logger.info(`Register user: ${user.id}`);

    return ResponseBuilder.send(
      res,
      HTTP_STATUS.CREATED,
      user,
      "User created successfully",
    );
  } catch (error: any) {
    logger.warn(`Failed to register user: ${error.message}`);

    return ResponseBuilder.send(
      res,
      HTTP_STATUS.BAD_REQUEST,
      null,
      error.message || "Registration failed",
    );
  }
};

export const handleLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { token, user } = await authService.login(email, password);

    logger.info(`SECURITY: User ${user.id} logged in from IP ${req.ip}`);

    // SECURITY: HttpOnly auth cookie
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return ResponseBuilder.send(res, HTTP_STATUS.OK, user, "Login successful");
  } catch (error: any) {
    logger.warn(
      `SECURITY: Failed login attempt for email ${req.body.email} from IP ${req.ip}`,
    );

    return ResponseBuilder.send(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      null,
      "Invalid email or password",
    );
  }
};

export const handleLogout = (_req: Request, res: Response) => {
  res.clearCookie("auth_token");

  return ResponseBuilder.send(
    res,
    HTTP_STATUS.OK,
    null,
    "Logged out successfully",
  );
};

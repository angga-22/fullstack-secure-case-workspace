import type { Request, Response, NextFunction } from "express";
import { verifySessionToken } from "@/utils/auth";
import { logger } from "@/utils/logger";
import ResponseBuilder from "@/utils/ResponseBuilder";
import { HTTP_STATUS } from "@/constants";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Read token from HttpOnly cookie
  const token = req.cookies?.["auth_token"];
  const userId = req.cookies?.["user_id"];
  if (!token) {
    logger.debug(`Auth failed: missing token (${req.method} ${req.path})`);
    return ResponseBuilder.send(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      null,
      "Unauthorized: No session found",
    );
  }
  try {
    // Verify PASETO (signature + claims)
    const payload = await verifySessionToken(token, userId);

    req.user = {
      id: payload.sub,
      role: payload.role,
    };

    return next();
  } catch (error) {
    logger.warn(
      `Auth failed: invalid session (${req.method} ${req.path})`,
      error,
    );

    // Defensive cleanup
    res.clearCookie("auth_token");

    return ResponseBuilder.send(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      null,
      "Unauthorized: Invalid or expired session",
    );
  }
};

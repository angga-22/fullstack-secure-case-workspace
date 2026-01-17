import { V4 } from "paseto";
import { createPrivateKey, createPublicKey } from "crypto";
import { PASETO_CONFIG } from "@/config/paseto";
import "dotenv/config";

const PRIVATE_KEY = createPrivateKey({
  key: process.env.PASETO_PRIVATE_KEY!.replace(/\\n/g, "\n"),
  format: "pem",
});

const PUBLIC_KEY = createPublicKey({
  key: process.env.PASETO_PUBLIC_KEY!.replace(/\\n/g, "\n"),
  format: "pem",
});
// one time generation
// const { privateKey, publicKey } = await V4.generateKey("public");

export interface SessionPayload {
  sub: string;
  role: "CLIENT" | "LAWYER";
  aud?: string;
  iss?: string;
  iat?: string;
  exp?: string;
}
/**
 * Create a PASETO v4 public token (SIGNED)
 */
export const createSessionToken = async (
  userId: string,
  role: "CLIENT" | "LAWYER",
): Promise<string> => {
  return V4.sign(
    {
      sub: userId,
      role,
    },
    PRIVATE_KEY,
    {
      audience: PASETO_CONFIG.audience,
      issuer: PASETO_CONFIG.issuer,
      subject: userId,
      expiresIn: "24 hours",
      iat: true,
    },
  );
};

/**
 * Verify a PASETO v4 public token
 */
export const verifySessionToken = async (
  token: string,
  userId: string,
): Promise<SessionPayload> => {
  try {
    return await V4.verify<SessionPayload>(token, PUBLIC_KEY, {
      audience: PASETO_CONFIG.audience,
      issuer: PASETO_CONFIG.issuer,
      subject: userId,
      clockTolerance: "30s",
    });
  } catch {
    throw new Error("Invalid or expired session");
  }
};

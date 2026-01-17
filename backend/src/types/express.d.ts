import "express";

declare global {
  namespace Express {
    interface User {
      id: string;
      role: "CLIENT" | "LAWYER";
    }

    interface Request {
      user?: User;
    }
  }
}

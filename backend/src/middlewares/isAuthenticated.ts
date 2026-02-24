import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

export interface DecodedToken extends JwtPayload {
  userId: string;
  role: string;
}

// Extend Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: string };
    }
  }
}

/**
 * Middleware to authenticate requests using JWT access token.
 * Optionally, you can pass allowed roles to restrict access.
 */
export function isAuthenticated(allowedRoles?: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    console.log("[Auth] Starting authentication middleware"); // Step 1

    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(" ")[1];
      if (!token) {
        console.log("[Auth] No token found"); // Step 3
        return res.status(401).json({
          success: false,
          code: "NO_TOKEN",
          message: "Access token missing",
        });
      }
     
      let decoded: DecodedToken;

      try {
        decoded = jwt.verify(token, env.PUBLIC_KEY, { algorithms: ["RS256"] }) as DecodedToken;
      } catch (err: any) {
        console.warn("[Auth] Invalid or expired token:", err.message); // Step 6
        return res.status(401).json({
          success: false,
          code: "INVALID_TOKEN",
          message: "Access token invalid or expired",
        });
      }

      // Attach user info to request
      req.user = { id: decoded.userId, role: decoded.role };
      
      // Check role-based access
      if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({
          success: false,
          code: "FORBIDDEN",
          message: "You do not have permission to access this resource",
        });
      }

      console.log("[Auth] Authentication passed, proceeding to next middleware"); // Step 9
      return next();
    } catch (err) {
      console.error("[Auth] Unexpected authentication error:", err); // Step 10
      return res.status(500).json({
        success: false,
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      });
    }
  };
}

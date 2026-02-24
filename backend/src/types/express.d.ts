// types/express.d.ts
import { Request } from "express";
import { JwtPayload } from './jwt';
declare module "express-serve-static-core" {
  interface Request {
    user?: {
      id: string;
      email?: string; // optional if you have it
      role: string;   // add role
    };
  }
  namespace Express {
    interface Request {
      user?: JwtPayload; // ✅ now includes id, email, role
    }
  }
}

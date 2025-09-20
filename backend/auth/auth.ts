import { Header, APIError } from "encore.dev/api";
import { authHandler } from "encore.dev/auth";
import { secret } from "encore.dev/config";
import * as jwt from "jsonwebtoken";

const jwtSecret = secret("JWTSecret");

interface AuthParams {
  authorization?: Header<"Authorization">;
}

export interface AuthData {
  userID: string;
  email: string;
  role: string;
}

export const auth = authHandler<AuthParams, AuthData>(
  async (params) => {
    const token = params.authorization?.replace("Bearer ", "");
    if (!token) {
      throw APIError.unauthenticated("Missing authorization token");
    }

    try {
      const decoded = jwt.verify(token, jwtSecret()) as any;
      return {
        userID: decoded.userId.toString(),
        email: decoded.email,
        role: decoded.role,
      };
    } catch (err) {
      throw APIError.unauthenticated("Invalid token", err as Error);
    }
  }
);

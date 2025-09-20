import { api, APIError } from "encore.dev/api";
import * as bcrypt from "bcryptjs";
import db from "../db";

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "admin" | "visitor";
  department?: string;
  employeeId?: string;
  phone?: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Registers a new user account.
export const register = api<RegisterRequest, RegisterResponse>(
  { expose: true, method: "POST", path: "/auth/register" },
  async (req) => {
    // Check if user already exists
    const existingUser = await db.queryRow`
      SELECT id FROM users WHERE email = ${req.email}
    `;

    if (existingUser) {
      throw APIError.alreadyExists("User with this email already exists");
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(req.password, saltRounds);

    // Insert new user
    const user = await db.queryRow<{
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      role: string;
    }>`
      INSERT INTO users (email, password_hash, first_name, last_name, role, department, employee_id, phone)
      VALUES (${req.email}, ${passwordHash}, ${req.firstName}, ${req.lastName}, ${req.role}, ${req.department}, ${req.employeeId}, ${req.phone})
      RETURNING id, email, first_name, last_name, role
    `;

    if (!user) {
      throw APIError.internal("Failed to create user");
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
    };
  }
);

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { User } from "../../features/users/user.model";
import { UserStatus } from "../types/enums";

// Use the global Express.Request type extended in permission.middleware.ts
// No need to define AuthRequest separately

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new AppError("No token provided", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      email: string;
      role: string;
    };

    // Check if user exists and is not suspended/inactive
    const user = await User.findById(decoded.userId);

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    if (user.status === UserStatus.SUSPENDED) {
      return next(
        new AppError(
          "Your account has been suspended. Please contact support.",
          403
        )
      );
    }

    if (user.status === UserStatus.INACTIVE) {
      return next(
        new AppError("Your account is inactive. Please contact support.", 403)
      );
    }

    req.user = decoded;
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("Invalid token", 401));
    } else {
      return next(error);
    }
  }
};

export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError("Insufficient permissions", 403);
    }

    next();
  };
};

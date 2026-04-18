import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};







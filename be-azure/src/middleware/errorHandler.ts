import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/index.js';

const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction): void => {
  console.error(err);

  if (err.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({ message: '이미 존재하는 이메일입니다.' });
    return;
  }

  if (err.name === 'SequelizeValidationError') {
    res.status(400).json({ message: err.message });
    return;
  }

  res.status(err.status || 500).json({ message: err.message || '서버 오류가 발생했습니다.' });
};

export default errorHandler;

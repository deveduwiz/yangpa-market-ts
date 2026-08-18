import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import { JwtPayload } from '../types/index.js';

const authorization = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ message: '토큰이 없습니다.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    req.email = decoded.email;
    next();
  } catch (error) {
    res.status(403).json({ message: '유효하지 않은 토큰입니다.' });
  }
};

export default authorization;

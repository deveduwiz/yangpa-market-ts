import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import config from '../config/config.js';
import { SignUpDto, SignInDto, AppError, httpError } from '../types/index.js';
import * as saleService from './sale.service.js';

interface SignUpResponse {
  id: number;
  name: string;
  email: string;
}

export const signUp = async ({ email, name, password }: SignUpDto): Promise<SignUpResponse> => {
  const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);
  const user = await User.create({ email, name, password: hashedPassword });
  return { id: user.id, name: user.name, email: user.email };
};

export const signIn = async ({ email, password }: SignInDto): Promise<string> => {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    const error: AppError = new Error('존재하지 않는 이메일입니다.');
    error.status = 404;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error: AppError = new Error('비밀번호가 일치하지 않습니다.');
    error.status = 401;
    throw error;
  }

  const token = jwt.sign({ email: user.email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'],
  });

  return token;
};

export interface MeResponse {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  /** 마이 화면에서 바로 보여줄 카운트 */
  salesCount: number;
  favoritesCount: number;
}

/** 토큰에는 email 밖에 없어서, 이름·가입일을 보여주려면 이 엔드포인트가 필요하다. */
export const getMe = async (email: string): Promise<MeResponse> => {
  const user = await User.findOne({ where: { email } });
  if (!user) throw httpError('회원을 찾을 수 없습니다.', 404);

  const counts = await saleService.countByEmail(email);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    salesCount: counts.sales,
    favoritesCount: counts.favorites,
  };
};

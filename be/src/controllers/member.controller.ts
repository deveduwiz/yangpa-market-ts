import { Request, Response, NextFunction } from 'express';
import * as memberService from '../services/member.service.js';

export const signUp = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, name, password } = req.body;
    const member = await memberService.signUp({ email, name, password });
    res.status(201).json({
      success: true,
      member,
      message: '회원가입이 완료되었습니다.',
    });
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const token = await memberService.signIn({ email, password });
    res.status(200).json({
      success: true,
      token,
      message: '로그인에 성공했습니다.',
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const member = await memberService.getMe(req.email!);
    res.status(200).json({ success: true, member, message: '내 정보 조회성공' });
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getImage = (req: Request<{ filename: string }>, res: Response, next: NextFunction): void => {
  try {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../files', filename);
    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
};

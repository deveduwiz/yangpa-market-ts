import { Request, Response, NextFunction } from 'express';
import { getAzureBlobUrl } from '../services/azure-blob.service.js';

export const getImage = (req: Request<{ filename: string }>, res: Response, next: NextFunction): void => {
  try {
    const { filename } = req.params;
    const blobUrl = getAzureBlobUrl(filename);
    res.redirect(blobUrl);
  } catch (error) {
    next(error);
  }
};

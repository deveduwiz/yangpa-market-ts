import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { uploadToAzure } from '../services/azure-blob.service.js';

const storage = multer.memoryStorage();

const multerUpload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const uploadToAzureMiddleware = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    multerUpload.single(fieldName)(req, res, async (err) => {
      if (err) {
        return next(err);
      }

      if (!req.file) {
        return next();
      }

      try {
        const ext = path.extname(req.file.originalname);
        const basename = path.basename(req.file.originalname, ext);
        const blobName = `${basename}_${Date.now()}${ext}`;

        await uploadToAzure(req.file.buffer, blobName, req.file.mimetype);

        req.file.filename = blobName;
        next();
      } catch (error) {
        next(error);
      }
    });
  };
};

const upload = {
  single: (fieldName: string) => uploadToAzureMiddleware(fieldName),
};

export default upload;

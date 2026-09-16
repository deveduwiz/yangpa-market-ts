import { Router } from 'express';
import path from 'path';
import { getBlobStream } from '../services/azure-blob.service.js';

const router = Router();

/**
 * GET /image/:filename — Azure Blob Storage 에서 이미지를 스트리밍한다.
 *
 * sale.photo 에는 blob 이름만 저장돼 있고(업로드는 middleware/upload.ts),
 * 실제 바이트는 여기서 컨테이너를 거쳐 내려준다.
 * 컨테이너를 private 으로 둬도 동작하며, 스토리지 계정을 외부에 노출하지 않는다.
 * 인증은 걸지 않는다 — 프론트의 <img> 태그가 토큰 없이 직접 호출한다.
 */
router.get('/:filename', async (req, res, next) => {
  try {
    // 컨테이너 밖으로 나가는 경로를 막는다 ("../" 등)
    const blobName = path.basename(req.params.filename);

    const blob = await getBlobStream(blobName);
    // 지역 변수로 받아 strict 모드에서 narrowing 이 확실히 유지되게 한다
    const stream = blob?.readableStreamBody;
    if (!blob || !stream) {
      res.status(404).json({ message: '이미지를 찾을 수 없습니다.' });
      return;
    }

    res.setHeader('Content-Type', blob.contentType ?? 'application/octet-stream');
    if (blob.contentLength != null) {
      res.setHeader('Content-Length', String(blob.contentLength));
    }
    if (blob.etag) {
      res.setHeader('ETag', blob.etag);
    }
    // blob 이름에 타임스탬프가 붙어 사실상 불변이므로 영구 캐시가 안전하다
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');

    stream.on('error', next);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
});

export default router;

import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import config from '../config/config.js';

let containerClient: ContainerClient | null = null;

const getContainerClient = (): ContainerClient => {
  if (!containerClient) {
    if (!config.azure.connectionString) {
      // 이 값이 비면 fromConnectionString 이 알아보기 힘든 에러를 던진다.
      throw new Error(
        'AZURE_STORAGE_CONNECTION_STRING 이 설정되지 않았습니다. ' +
          'App Service > 설정 > 환경 변수 에 등록하세요.',
      );
    }
    const blobServiceClient = BlobServiceClient.fromConnectionString(config.azure.connectionString);
    containerClient = blobServiceClient.getContainerClient(config.azure.containerName);
  }
  return containerClient;
};

export const uploadToAzure = async (
  buffer: Buffer,
  blobName: string,
  contentType: string
): Promise<string> => {
  const client = getContainerClient();
  const blockBlobClient = client.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });

  return blobName;
};

export const getAzureBlobUrl = (blobName: string): string => {
  const client = getContainerClient();
  const blockBlobClient = client.getBlockBlobClient(blobName);
  return blockBlobClient.url;
};

/**
 * 이미지 서빙용. 전체를 메모리에 올리지 않고 스트림과 메타데이터를 그대로 넘긴다.
 * blob 이 없으면 null 을 반환한다 (404 로 구분하기 위해).
 */
/**
 * 프론트가 Blob 에서 직접 받을 수 있도록 공개 URL 을 만든다.
 * 설정이 없거나 실패해도 목록 조회 전체가 깨지지 않도록 null 을 반환한다.
 */
export const tryGetBlobUrl = (blobName: string): string | null => {
  if (!blobName) return null;
  try {
    return getAzureBlobUrl(blobName);
  } catch {
    return null;
  }
};

export const getBlobStream = async (blobName: string) => {
  const client = getContainerClient();
  const blockBlobClient = client.getBlockBlobClient(blobName);

  if (!(await blockBlobClient.exists())) {
    return null;
  }
  return blockBlobClient.download(0);
};

export const downloadFromAzure = async (blobName: string): Promise<Buffer> => {
  const client = getContainerClient();
  const blockBlobClient = client.getBlockBlobClient(blobName);
  const downloadResponse = await blockBlobClient.download(0);

  const chunks: Buffer[] = [];
  for await (const chunk of downloadResponse.readableStreamBody as NodeJS.ReadableStream) {
    chunks.push(Buffer.from(chunk as Buffer));
  }
  return Buffer.concat(chunks);
};

export const deleteFromAzure = async (blobName: string): Promise<void> => {
  const client = getContainerClient();
  const blockBlobClient = client.getBlockBlobClient(blobName);
  await blockBlobClient.deleteIfExists();
};

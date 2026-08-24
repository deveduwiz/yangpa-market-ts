import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
import config from '../config/config.js';

let containerClient: ContainerClient | null = null;

const getContainerClient = (): ContainerClient => {
  if (!containerClient) {
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

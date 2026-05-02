import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

const postMediaDirectory = join(process.cwd(), 'uploads', 'post-media');

function ensurePostMediaDirectory() {
  if (!existsSync(postMediaDirectory)) {
    mkdirSync(postMediaDirectory, { recursive: true });
  }
}

export const postMediaUploadOptions = {
  storage: diskStorage({
    destination: (_req, _file, callback) => {
      ensurePostMediaDirectory();
      callback(null, postMediaDirectory);
    },
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname || '')}`);
    },
  }),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (
      !file.mimetype.startsWith('image/') &&
      !file.mimetype.startsWith('video/')
    ) {
      callback(
        new BadRequestException(
          'Only image or video uploads are supported for posts',
        ),
        false,
      );
      return;
    }

    callback(null, true);
  },
};

export function toPostMediaPath(file?: Express.Multer.File) {
  return file ? `/uploads/post-media/${file.filename}` : undefined;
}

export function buildPostMediaPayload(files?: Express.Multer.File[]) {
  if (!files || files.length === 0) {
    return {
      mediaUrls: undefined,
      mediaKind: undefined,
    };
  }

  const imageFiles = files.filter((file) => file.mimetype.startsWith('image/'));
  const videoFiles = files.filter((file) => file.mimetype.startsWith('video/'));

  if (imageFiles.length > 0 && videoFiles.length > 0) {
    throw new BadRequestException(
      'A post can contain either images or a single video, not both',
    );
  }

  if (videoFiles.length > 1) {
    throw new BadRequestException('Only one video can be uploaded per post');
  }

  return {
    mediaUrls: files.map((file) => `/uploads/post-media/${file.filename}`),
    mediaKind: videoFiles.length === 1 ? 'VIDEO' : 'IMAGE',
  } as const;
}

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
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(
        new BadRequestException('Only image uploads are supported for posts'),
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

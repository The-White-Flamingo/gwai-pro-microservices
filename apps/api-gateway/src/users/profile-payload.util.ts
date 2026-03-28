import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

const profilePicturesDirectory = join(
  process.cwd(),
  'uploads',
  'profile-pictures',
);

function ensureProfilePicturesDirectory() {
  if (!existsSync(profilePicturesDirectory)) {
    mkdirSync(profilePicturesDirectory, { recursive: true });
  }
}

export const profilePictureUploadOptions = {
  storage: diskStorage({
    destination: (_req, _file, callback) => {
      ensureProfilePicturesDirectory();
      callback(null, profilePicturesDirectory);
    },
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname || '')}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (
    _req: any,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(
        new BadRequestException(
          'Only image files are allowed for profile pictures',
        ),
        false,
      );
      return;
    }

    callback(null, true);
  },
};

export function toProfilePicturePath(file?: Express.Multer.File) {
  return file ? `/uploads/profile-pictures/${file.filename}` : undefined;
}

export function normalizeStringArrayField(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return undefined;
    }

    if (trimmedValue.startsWith('[')) {
      try {
        const parsedValue = JSON.parse(trimmedValue);
        if (Array.isArray(parsedValue)) {
          return parsedValue
            .map(String)
            .map((item) => item.trim())
            .filter(Boolean);
        }
      } catch {
        throw new BadRequestException('Array fields must be valid JSON arrays');
      }
    }

    return trimmedValue.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return undefined;
}

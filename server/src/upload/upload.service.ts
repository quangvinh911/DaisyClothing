import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class UploadService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || join(__dirname, '..', '..', 'uploads');
    this.ensureUploadDir();
  }

  private ensureUploadDir() {
    const subDirs = ['images', 'posts', 'products', 'avatars'];
    for (const dir of subDirs) {
      const fullPath = join(this.uploadDir, dir);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath, { recursive: true });
      }
    }
  }

  getFilePath(filename: string, subfolder: string = 'images'): string {
    return `/uploads/${subfolder}/${filename}`;
  }

  getUploadDir(subfolder: string = 'images'): string {
    return join(this.uploadDir, subfolder);
  }
}

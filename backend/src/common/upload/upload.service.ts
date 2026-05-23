import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiOptions,
} from 'cloudinary';
import { Readable } from 'stream';
import { UPLOAD_CONSTANTS, IMAGE_MIME_TYPES } from './upload.constants';

export interface UploadResult {
  url: string;
  publicId: string;
  originalName: string; // Tên file gốc từ client
  mimeType: string; // MIME type gốc
  format: string; // Extension từ Cloudinary (ảnh) hoặc MIME type (raw)
  bytes: number;
  isImage: boolean;
}

@Injectable()
export class UploadService {
  constructor(private readonly config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.config.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload ảnh đại diện — tự động resize 400x400, convert webp
   */
  async uploadAvatar(file: Express.Multer.File): Promise<UploadResult> {
    const { MAX_SIZE_BYTES, ALLOWED_MIME_TYPES, FOLDER, TRANSFORM } =
      UPLOAD_CONSTANTS.AVATAR;

    this.validateFile(file, ALLOWED_MIME_TYPES, MAX_SIZE_BYTES, 'ảnh đại diện');

    const result = await this.streamUpload(file.buffer, {
      folder: FOLDER,
      transformation: [TRANSFORM],
      resource_type: 'image',
    });

    return this.toUploadResult(result, file.mimetype, file.originalname);
  }

  /**
   * Upload file đính kèm (ảnh hoặc document)
   */
  async uploadAttachment(file: Express.Multer.File): Promise<UploadResult> {
    const { MAX_SIZE_BYTES, ALLOWED_MIME_TYPES, FOLDER } =
      UPLOAD_CONSTANTS.ATTACHMENT;

    this.validateFile(
      file,
      ALLOWED_MIME_TYPES,
      MAX_SIZE_BYTES,
      'file đính kèm',
    );

    const isImage = IMAGE_MIME_TYPES.has(file.mimetype);

    const result = await this.streamUpload(file.buffer, {
      folder: FOLDER,
      resource_type: isImage ? 'image' : 'raw',
    });

    return this.toUploadResult(result, file.mimetype, file.originalname);
  }

  /**
   * Xóa file khỏi Cloudinary
   */
  async deleteFile(
    publicId: string,
    resourceType: 'image' | 'raw' = 'image',
  ): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
      });
    } catch {
      // Không throw — tránh block flow chính nếu file đã bị xóa trên Cloudinary
    }
  }

  // ─── Private helpers ────────────────────────────────────────────────────────

  private validateFile(
    file: Express.Multer.File,
    allowedMimes: readonly string[],
    maxBytes: number,
    label: string,
  ): void {
    if (!file) {
      throw new BadRequestException(`Vui lòng cung cấp ${label}.`);
    }
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Định dạng ${label} không được hỗ trợ: ${file.mimetype}.`,
      );
    }
    if (file.size > maxBytes) {
      const maxMb = maxBytes / 1024 / 1024;
      throw new BadRequestException(
        `Kích thước ${label} vượt quá giới hạn ${maxMb}MB.`,
      );
    }
  }

  private streamUpload(
    buffer: Buffer,
    options: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error || !result) {
            reject(
              new InternalServerErrorException(
                'Upload thất bại. Vui lòng thử lại.',
              ),
            );
            return;
          }
          resolve(result);
        },
      );

      const readable = Readable.from(buffer);
      readable.pipe(uploadStream);
    });
  }

  private toUploadResult(
    result: UploadApiResponse,
    mimetype: string,
    originalName: string,
  ): UploadResult {
    const isImage = IMAGE_MIME_TYPES.has(mimetype);
    return {
      url: result.secure_url, // URL gốc, không chỉnh sửa
      publicId: result.public_id,
      originalName,
      mimeType: mimetype,
      format: result.format || mimetype,
      bytes: result.bytes,
      isImage,
    };
  }
}

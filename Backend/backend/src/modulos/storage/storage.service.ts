import { Injectable, InternalServerErrorException } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { v2 as cloudinary } from 'cloudinary';

export interface StorageResult {
  relativePath: string;
  filename: string;
}

@Injectable()
export class StorageService {
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    // 1. Configurar Cloudinary si las credenciales están presentes
    if (this.isCloudinaryConfigured()) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }

    // 2. Asegurar que exista el directorio local como respaldo
    this.ensureUploadDirectoryExists();
  }

  private isCloudinaryConfigured(): boolean {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

    const isPlaceholder = (val?: string) =>
      !val ||
      val.startsWith('tu_') ||
      val.includes('placeholder') ||
      val.length === 0;

    if (isPlaceholder(cloudName) || isPlaceholder(apiKey) || isPlaceholder(apiSecret)) {
      return false;
    }

    return true;
  }

  private async ensureUploadDirectoryExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Procesa un buffer de imagen con Sharp convirtiéndolo a WebP (80% calidad)
   * y lo almacena en Cloudinary o localmente según la configuración.
   *
   * @param fileBuffer Buffer del archivo subido
   * @param subFolder Subcarpeta lógica (ej. 'gastos', 'reportes')
   */
  async processAndSaveImage(
    fileBuffer: Buffer,
    subFolder: string,
  ): Promise<StorageResult> {
    try {
      const date = new Date();
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const filename = `${uuidv4()}.webp`;

      // 1. Procesamiento obligatorio con Sharp (Regla 02: WebP al 80% de calidad)
      const optimizedBuffer = await sharp(fileBuffer)
        .webp({ quality: 80 })
        .toBuffer();

      // 2. Si Cloudinary está configurado, subir directamente a la nube
      if (this.isCloudinaryConfigured()) {
        const uploadResult = await this.uploadToCloudinary(
          optimizedBuffer,
          `softel/${subFolder}/${year}/${month}`,
          filename.replace('.webp', ''),
        );

        return {
          relativePath: uploadResult.secure_url,
          filename,
        };
      }

      // 3. Almacenamiento local en disco (fallback o entorno local)
      const targetFolder = path.join(this.uploadDir, subFolder, year, month);
      try {
        await fs.access(targetFolder);
      } catch {
        await fs.mkdir(targetFolder, { recursive: true });
      }

      const absolutePath = path.join(targetFolder, filename);
      await fs.writeFile(absolutePath, optimizedBuffer);

      const relativePath = `/${subFolder}/${year}/${month}/${filename}`;
      return {
        relativePath,
        filename,
      };
    } catch (error) {
      console.error('Error al procesar/guardar imagen en StorageService:', error);
      throw new InternalServerErrorException(
        'Error al procesar y guardar la imagen (StorageService)',
      );
    }
  }

  /**
   * Sube un buffer en memoria a Cloudinary usando Streams.
   */
  private uploadToCloudinary(
    buffer: Buffer,
    folder: string,
    publicId: string,
  ): Promise<any> {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
      api_key: process.env.CLOUDINARY_API_KEY?.trim(),
      api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
      secure: true,
    });

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: publicId,
          resource_type: 'image',
          format: 'webp',
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        },
      );
      stream.end(buffer);
    });
  }
}


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

      const entorno =
        process.env.ENTORNO?.toLowerCase() === 'produccion'
          ? 'produccion'
          : 'desarrollo';

      // 2. Si Cloudinary está configurado, subir a su respectiva carpeta según entorno
      if (this.isCloudinaryConfigured()) {
        const baseFolder =
          process.env.CLOUDINARY_CARPETA_BASE?.trim() || `softel/${entorno}`;
        const folder = `${baseFolder}/${subFolder}/${year}/${month}`;

        console.log(`[StorageService] Subiendo imagen a Cloudinary en carpeta: ${folder}`);
        const uploadResult = await this.uploadToCloudinary(
          optimizedBuffer,
          folder,
          filename.replace('.webp', ''),
        );
        console.log(`[StorageService] Imagen subida exitosamente a Cloudinary: ${uploadResult.secure_url}`);

        return {
          relativePath: uploadResult.secure_url,
          filename,
        };
      }

      // 3. Almacenamiento local en disco (separado también por entorno)
      const targetFolder = path.join(
        this.uploadDir,
        entorno,
        subFolder,
        year,
        month,
      );
      try {
        await fs.access(targetFolder);
      } catch {
        await fs.mkdir(targetFolder, { recursive: true });
      }

      const absolutePath = path.join(targetFolder, filename);
      await fs.writeFile(absolutePath, optimizedBuffer);

      const relativePath = `/${entorno}/${subFolder}/${year}/${month}/${filename}`;
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

  /**
   * Extrae el publicId de una URL completa de Cloudinary.
   * Maneja URLs con y sin versión/transformaciones.
   * Ej: "https://res.cloudinary.com/b0v3fds2/image/upload/v1741549112/pruebas/gastos/2026/09/uuid.webp"
   * -> "pruebas/gastos/2026/09/uuid"
   */
  extractPublicIdFromCloudinaryUrl(url: string): string | null {
    try {
      if (!url || !url.includes('cloudinary.com')) return null;

      const uploadIndex = url.indexOf('/image/upload/');
      if (uploadIndex === -1) return null;

      let pathAfterUpload = url.substring(uploadIndex + '/image/upload/'.length);

      // Quitar versión (ej: 'v1741549112/')
      const versionMatch = pathAfterUpload.match(/(?:^|\/)(v\d+)\//);
      if (versionMatch) {
        const vIndex = pathAfterUpload.indexOf(versionMatch[0]);
        pathAfterUpload = pathAfterUpload.substring(vIndex + versionMatch[0].length);
      }

      // Quitar extensión final (.webp, .jpg, etc.)
      const lastDotIndex = pathAfterUpload.lastIndexOf('.');
      if (lastDotIndex !== -1) {
        pathAfterUpload = pathAfterUpload.substring(0, lastDotIndex);
      }

      return pathAfterUpload;
    } catch (error) {
      console.error('[StorageService] Error al extraer publicId de Cloudinary:', error);
      return null;
    }
  }

  /**
   * Elimina un archivo físico en Cloudinary o en disco local según corresponda.
   *
   * @param fileUrlOrPath URL absoluta de Cloudinary o ruta relativa local
   * @returns boolean indicando si la operación fue exitosa
   */
  async deleteFile(fileUrlOrPath: string): Promise<boolean> {
    if (!fileUrlOrPath) return false;

    // 1. Si es Cloudinary y está configurado
    if (this.isCloudinaryConfigured() && fileUrlOrPath.includes('cloudinary.com')) {
      const publicId = this.extractPublicIdFromCloudinaryUrl(fileUrlOrPath);
      if (!publicId) {
        console.warn(`[StorageService] No se pudo extraer publicId para eliminar: ${fileUrlOrPath}`);
        return false;
      }

      try {
        console.log(`[StorageService] Eliminando comprobante previo de Cloudinary -> publicId: ${publicId}`);
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
          api_key: process.env.CLOUDINARY_API_KEY?.trim(),
          api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
          secure: true,
        });

        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: 'image',
          invalidate: true,
        });

        console.log(`[StorageService] Resultado eliminación Cloudinary (${publicId}):`, result);
        return result.result === 'ok';
      } catch (error) {
        console.error(`[StorageService] Error al eliminar comprobante en Cloudinary (${publicId}):`, error);
        return false;
      }
    }

    // 2. Si es almacenamiento local en disco
    try {
      const localCleanPath = fileUrlOrPath.startsWith('/')
        ? fileUrlOrPath.slice(1)
        : fileUrlOrPath;
      const fullPath = path.join(this.uploadDir, localCleanPath);
      await fs.unlink(fullPath);
      console.log(`[StorageService] Archivo local eliminado exitosamente: ${fullPath}`);
      return true;
    } catch (error: any) {
      if (error?.code !== 'ENOENT') {
        console.warn(`[StorageService] No se pudo eliminar archivo local (${fileUrlOrPath}):`, error?.message);
      }
      return false;
    }
  }
}


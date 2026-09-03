import { Injectable, InternalServerErrorException } from '@nestjs/common';
import sharp from 'sharp';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface StorageResult {
  relativePath: string;
  filename: string;
}

@Injectable()
export class StorageService {
  // En producción, esto debería venir de ConfigService
  private readonly uploadDir = path.join(process.cwd(), 'uploads');

  constructor() {
    this.ensureUploadDirectoryExists();
  }

  private async ensureUploadDirectoryExists() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Procesa un buffer de imagen, lo convierte a WebP (80% calidad)
   * y lo guarda en el sistema de archivos local.
   *
   * @param fileBuffer Buffer del archivo subido
   * @param subFolder Subcarpeta lógica (ej. 'gastos', 'reportes')
   */
  async processAndSaveImage(
    fileBuffer: Buffer,
    subFolder: string,
  ): Promise<StorageResult> {
    try {
      // Crear ruta de destino: uploads/{subFolder}/YYYY/MM
      const date = new Date();
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      
      const targetFolder = path.join(this.uploadDir, subFolder, year, month);
      
      try {
        await fs.access(targetFolder);
      } catch {
        await fs.mkdir(targetFolder, { recursive: true });
      }

      // Generar nombre inmutable
      const filename = `${uuidv4()}.webp`;
      const absolutePath = path.join(targetFolder, filename);
      
      // La ruta relativa que guardamos en BD
      const relativePath = `/${subFolder}/${year}/${month}/${filename}`;

      // Procesar y guardar con Sharp
      await sharp(fileBuffer)
        .webp({ quality: 80 })
        .toFile(absolutePath);

      return {
        relativePath,
        filename,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Error al procesar y guardar la imagen (StorageService)',
      );
    }
  }
}

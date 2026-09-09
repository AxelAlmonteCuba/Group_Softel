import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Public } from '../../common/decorators/public.decorator';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  async checkHealth() {
    const startTime = Date.now();
    let dbConnected = false;
    let dbLatencyMs = 0;
    const dbName = process.env.DB_NOMBRE ?? 'unknown';

    try {
      await this.dataSource.query('SELECT 1');
      dbLatencyMs = Date.now() - startTime;
      dbConnected = true;
    } catch {
      dbConnected = false;
    }

    const memoryUsage = process.memoryUsage();
    const uptimeSeconds = Math.floor(process.uptime());
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = uptimeSeconds % 60;
    const uptimeFormatted = `${hours}h ${minutes}m ${seconds}s`;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
    const isCloudinaryActive = Boolean(
      cloudName &&
        apiKey &&
        apiSecret &&
        !cloudName.startsWith('tu_') &&
        !cloudName.includes('placeholder'),
    );

    const healthData = {
      estado: dbConnected ? 'OK' : 'ERROR',
      fecha_hora: new Date().toISOString(),
      tiempo_activo: uptimeFormatted,
      uptime_segundos: uptimeSeconds,
      base_de_datos: {
        conectado: dbConnected,
        nombre_bd: dbName,
        latencia_ms: dbLatencyMs,
      },
      almacenamiento: {
        proveedor: process.env.STORAGE_PROVIDER ?? 'local',
        cloudinary_activo: isCloudinaryActive,
        carpeta_destino:
          process.env.CLOUDINARY_CARPETA_BASE?.trim() ||
          `softel/${process.env.ENTORNO?.toLowerCase() === 'produccion' ? 'produccion' : 'desarrollo'}`,
      },
      sistema: {
        memoria_ram_mb: {
          rss: Math.round((memoryUsage.rss / 1024 / 1024) * 100) / 100,
          heap_total: Math.round((memoryUsage.heapTotal / 1024 / 1024) * 100) / 100,
          heap_usado: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 100) / 100,
        },
        entorno: process.env.ENTORNO ?? 'desarrollo',
        version_api: '0.0.1',
        node_version: process.version,
      },
    };

    if (!dbConnected) {
      throw new ServiceUnavailableException(healthData);
    }

    return healthData;
  }
}

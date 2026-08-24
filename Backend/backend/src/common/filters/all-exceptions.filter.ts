import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtro global de excepciones.
 *
 * Captura TODOS los errores (HTTP y no HTTP) y los normaliza
 * en un formato homogéneo de respuesta JSON (Regla 04 §3):
 *
 * {
 *   "exito": false,
 *   "codigo_estado": 400,
 *   "mensaje": "...",
 *   "errores": ["campo_x es inválido"],
 *   "fecha_hora": "2026-08-24T..."
 * }
 *
 * En entorno 'produccion' se ocultan los stack traces y la ruta.
 * En 'desarrollo' se incluye la ruta del endpoint para facilitar depuración.
 *
 * Se registra globalmente en main.ts con app.useGlobalFilters().
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Determinar código de estado HTTP
    const esHttpException = exception instanceof HttpException;
    const codigoEstado = esHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    // Extraer mensaje y errores de validación (ValidationPipe emite arrays)
    const respuestaRaw = esHttpException ? exception.getResponse() : null;
    let mensaje = 'Error interno del servidor';
    let errores: string[] = [];

    if (typeof respuestaRaw === 'string') {
      mensaje = respuestaRaw;
    } else if (typeof respuestaRaw === 'object' && respuestaRaw !== null) {
      const raw = respuestaRaw as Record<string, unknown>;

      if (Array.isArray(raw['message'])) {
        // ValidationPipe devuelve un array con los errores por campo
        errores = raw['message'] as string[];
        mensaje = 'Error de validación en los campos enviados';
      } else if (typeof raw['message'] === 'string') {
        mensaje = raw['message'];
      }
    }

    const esProduccion = process.env.ENTORNO === 'produccion';

    response.status(codigoEstado).json({
      exito: false,
      codigo_estado: codigoEstado,
      mensaje,
      errores,
      fecha_hora: new Date().toISOString(),
      // Solo en desarrollo — facilita la depuración sin exponer rutas en prod
      ...(!esProduccion && { ruta: request.url }),
    });
  }
}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  // Lista de orígenes permitidos desde .env (separados por coma)
  // Ejemplo: CORS_ORIGINS=http://localhost:8081,http://localhost:3001
  const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : '*';

  const app = await NestFactory.create(AppModule);

  // CORS — permite que el frontend web y la app móvil consuman la API.
  // En desarrollo: acepta cualquier origen ('*').
  // En producción: solo los orígenes listados en CORS_ORIGINS del .env.
  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Prefijo global: todos los endpoints quedan bajo /api/v1/
  app.setGlobalPrefix('api/v1');

  // Filtro global de excepciones — normaliza TODOS los errores al formato
  // { exito, codigo_estado, mensaje, errores, fecha_hora }
  app.useGlobalFilters(new AllExceptionsFilter());

  // ValidationPipe global — valida y transforma DTOs en todos los endpoints
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // ignora campos no declarados en el DTO
      forbidNonWhitelisted: true,   // error 400 si llegan campos extra
      transform: true,              // convierte tipos automáticamente
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const puerto = process.env.PUERTO ?? 3000;
  await app.listen(puerto);
}
bootstrap();

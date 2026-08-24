import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todos los endpoints: /api/v1/
  app.setGlobalPrefix('api/v1');

  // ValidationPipe global: valida y transforma todos los DTOs entrantes.
  // - whitelist: elimina campos no declarados en el DTO
  // - forbidNonWhitelisted: lanza error si llegan campos no permitidos
  // - transform: convierte los tipos automáticamente (ej. string → number)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const puerto = process.env.PUERTO ?? 3000;
  await app.listen(puerto);
}
bootstrap();

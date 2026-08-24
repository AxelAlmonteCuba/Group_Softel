import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

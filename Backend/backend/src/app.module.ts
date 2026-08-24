import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modulos/users/users.module';
import { AuthModule } from './modulos/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    // ConfigModule carga el .env y lo expone globalmente en toda la app
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeOrmModule.forRootAsync espera a ConfigModule antes de conectar a MySQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USUARIO'),
        password: config.get<string>('DB_CLAVE'),
        database: config.get<string>('DB_NOMBRE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get<string>('DB_SINCRONIZAR') === 'true',
        logging: config.get<string>('DB_LOGGING') === 'true',
      }),
    }),

    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,

    // APP_GUARD registra los guards GLOBALMENTE para todos los endpoints.
    // Se necesita registrar así (no en main.ts) porque estos guards
    // usan Reflector (inyección de dependencias), que requiere el contexto de NestJS.
    //
    // Orden importa: JwtAuthGuard primero (autenticación), RolesGuard segundo (autorización).
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}

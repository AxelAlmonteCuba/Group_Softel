import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modulos/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // ConfigModule carga el archivo .env y lo hace disponible en toda la app
    // isGlobal: true evita tener que importarlo en cada módulo
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeOrmModule.forRootAsync espera a que ConfigModule cargue el .env
    // antes de intentar conectarse a la base de datos
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
        // synchronize SIEMPRE false — los cambios de esquema van por migraciones
        synchronize: config.get<string>('DB_SINCRONIZAR') === 'true',
        logging: config.get<string>('DB_LOGGING') === 'true',
      }),
    }),

    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

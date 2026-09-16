import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule { }

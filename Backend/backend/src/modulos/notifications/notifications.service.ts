import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private expo = new Expo();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Envia notificación push masiva a todos los usuarios que tengan el rol dado y un token válido.
   */
  async notifyRole(role: string, title: string, body: string, data?: Record<string, unknown>) {
    const users = await this.userRepository.find({
      where: { rol: role },
    });

    const tokens = users
      .map((u) => u.pushToken)
      .filter((token) => token && Expo.isExpoPushToken(token)) as string[];

    if (tokens.length === 0) {
      this.logger.debug(`No hay tokens válidos para enviar a rol ${role}.`);
      return;
    }

    const messages: ExpoPushMessage[] = tokens.map((pushToken) => ({
      to: pushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
    }));

    const chunks = this.expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
        this.logger.log(
          `Enviado chunk de notificaciones a ${chunk.length} dispositivos.`,
        );
      } catch (error) {
        this.logger.error(`Error enviando notificación Push: ${error}`);
      }
    }
  }

  // ==========================================
  // LISTENERS DE EVENTOS DE CAJA CHICA
  // ==========================================

  @OnEvent('pettycash.requested')
  async handlePettyCashRequested(payload: {
    encargadoName: string;
    amount: number;
  }) {
    await this.notifyRole(
      'ADMINISTRADOR',
      'Nueva Solicitud de Caja Chica',
      `${payload.encargadoName} ha solicitado una caja por S/ ${payload.amount}.`,
      { screen: 'PettyCash' },
    );
  }

  @OnEvent('pettycash.review_pending')
  async handlePettyCashReviewPending(payload: { managerName: string }) {
    await this.notifyRole(
      'ADMINISTRADOR',
      'Caja Chica lista para Revisión',
      `La caja de ${payload.managerName} ha sido enviada para su auditoría y liquidación final.`,
      { screen: 'PettyCash' },
    );
  }

  @OnEvent('expense.created')
  async handleExpenseCreated(payload: { userName: string; amount: number }) {
    await this.notifyRole(
      'ADMINISTRADOR',
      'Nuevo Gasto Operativo',
      `${payload.userName} registró un gasto de S/ ${payload.amount}.`,
      { screen: 'PettyCash' },
    );
  }
}

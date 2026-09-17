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

  /**
   * Envia notificación push a un usuario específico por su ID.
   */
  async notifyUser(userId: string, title: string, body: string, data?: Record<string, unknown>) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user?.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
      this.logger.debug(`Usuario ${userId} sin token push válido. Omitido.`);
      return;
    }

    const message: ExpoPushMessage = {
      to: user.pushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
    };

    try {
      await this.expo.sendPushNotificationsAsync([message]);
      this.logger.log(
        `Notificación enviada a ${user.nombres} ${user.apellidos}.`,
      );
    } catch (error) {
      this.logger.error(`Error enviando notificación Push: ${error}`);
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

  @OnEvent('pettycash.statusChanged', { async: true })
  async handlePettyCashStatusChanged(payload: {
    userId: string;
    status: string;
  }) {
    let title = 'Actualización de Caja Chica';
    let body = `El estado de tu caja chica ha cambiado a ${payload.status}.`;

    switch (payload.status) {
      case 'APROBADA':
        title = '✅ Solicitud Aprobada';
        body = 'Tu solicitud de caja chica ha sido aprobada por Administración.';
        break;
      case 'RECHAZADA':
        title = '❌ Solicitud Rechazada';
        body = 'Tu solicitud de caja chica no fue aprobada.';
        break;
      case 'ABIERTA':
        title = '💰 Fondos Entregados';
        body = 'El fondo ha sido entregado. Ya puedes registrar gastos en tu caja chica.';
        break;
      case 'EN_REVISION':
        title = '🔍 Caja en Revisión';
        body = 'Tu caja chica está siendo auditada por Administración.';
        break;
      case 'CERRADA':
        title = '🔒 Caja Cerrada';
        body = 'Tu caja chica ha sido cerrada. Los saldos se han congelado para liquidación.';
        break;
    }

    await this.notifyUser(payload.userId, title, body, { screen: 'PettyCash' });
  }

  @OnEvent('pettycash.user_liquidated', { async: true })
  async handleUserLiquidated(payload: {
    userId: string;
    cajasLiquidadas: number;
    reembolsosLiquidados: number;
    cajaBalance: number;
    directBalance: number;
    netBalance: number;
  }) {
    const user = await this.userRepository.findOne({
      where: { id: payload.userId },
    });

    if (!user?.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
      this.logger.debug(
        `Usuario ${payload.userId} sin token push válido. Omitido.`,
      );
      return;
    }

    let bodyMessage: string;
    if (payload.netBalance > 0) {
      bodyMessage = `La empresa te reembolsará S/ ${payload.netBalance.toFixed(2)}.`;
    } else if (payload.netBalance < 0) {
      bodyMessage = `Debes devolver S/ ${Math.abs(payload.netBalance).toFixed(2)} a la empresa.`;
    } else {
      bodyMessage = `Cuentas cuadradas, sin saldo pendiente.`;
    }

    const message: ExpoPushMessage = {
      to: user.pushToken,
      sound: 'default',
      title: '✅ Cuenta Liquidada',
      body: bodyMessage,
      data: { screen: 'PettyCash' },
    };

    try {
      await this.expo.sendPushNotificationsAsync([message]);
      this.logger.log(
        `Notificación de liquidación enviada a ${user.nombres} ${user.apellidos}.`,
      );
    } catch (error) {
      this.logger.error(`Error enviando notificación de liquidación: ${error}`);
    }
  }

}

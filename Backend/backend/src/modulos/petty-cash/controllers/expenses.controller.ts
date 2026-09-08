import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExpensesService } from '../services/expenses.service';
import { StorageService } from '../../storage/storage.service';
import { CreateExpenseDto } from '../dtos/create-expense.dto';
import { EvaluateExpenseDto } from '../dtos/evaluate-expense.dto';
import { UpdateExpenseDto } from '../dtos/update-expense.dto';
import { Roles } from '../../../common/decorators/roles.decorator';
import { GetUser } from '../../../common/decorators/get-user.decorator';

@Controller('gastos')
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly storageService: StorageService,
  ) { }

  @Post()
  @Roles('ADMINISTRADOR', 'CONTADOR', 'SUPERVISOR', 'TRABAJADOR')
  @UseInterceptors(FileInterceptor('receipt'))
  async registerExpense(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateExpenseDto,
    @GetUser('id') userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('El comprobante (imagen) es obligatorio.');
    }

    // 1. Delegar el guardado y compresión a WebP al StorageService
    const storageResult = await this.storageService.processAndSaveImage(
      file.buffer,
      'gastos',
    );

    // 2. Registrar el gasto en la Base de Datos usando la ruta relativa devuelta
    return await this.expensesService.registerExpense(
      dto,
      userId,
      storageResult.relativePath,
    );
  }

  @Patch(':id/evaluar')
  @Roles('ADMINISTRADOR')
  async evaluateExpense(
    @Param('id') expenseId: string,
    @Body() dto: EvaluateExpenseDto,
    @GetUser('id') adminUserId: string,
  ) {
    return await this.expensesService.evaluateExpense(expenseId, dto, adminUserId);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'CONTADOR', 'SUPERVISOR', 'TRABAJADOR')
  @UseInterceptors(FileInterceptor('receipt'))
  async updateExpense(
    @Param('id') expenseId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: UpdateExpenseDto,
    @GetUser('id') userId: string,
  ) {
    let relativePath: string | undefined;

    // Si se subió un nuevo comprobante, procesarlo
    if (file) {
      const storageResult = await this.storageService.processAndSaveImage(
        file.buffer,
        'gastos',
      );
      relativePath = storageResult.relativePath;
    }

    return await this.expensesService.updateExpense(
      expenseId,
      dto,
      userId,
      relativePath,
    );
  }

  @Get('caja/:cajaId')
  @Roles('ADMINISTRADOR', 'CONTADOR', 'SUPERVISOR', 'TRABAJADOR')
  async getExpensesByPettyCash(@Param('cajaId') cajaId: string) {
    return await this.expensesService.getExpensesByPettyCash(cajaId);
  }

  @Get('pendientes')
  @Roles('ADMINISTRADOR')
  async getPendingExpenses() {
    return await this.expensesService.getPendingExpenses();
  }

  @Get('reembolsos-directos/usuarios-con-deuda')
  @Roles('ADMINISTRADOR', 'CONTADOR')
  async getUsersWithPendingReimbursements() {
    return await this.expensesService.getUsersWithPendingReimbursements();
  }

  @Get('reembolsos-directos/pendientes/:usuarioId')
  @Roles('ADMINISTRADOR', 'CONTADOR', 'SUPERVISOR', 'TRABAJADOR')
  async getPendingDirectReimbursements(@Param('usuarioId') usuarioId: string) {
    return await this.expensesService.getPendingDirectReimbursementsByUser(usuarioId);
  }

  @Patch(':id/reembolsar')
  @Roles('ADMINISTRADOR', 'CONTADOR')
  async markAsReimbursed(@Param('id') expenseId: string) {
    return await this.expensesService.markAsReimbursed(expenseId);
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExpenseCategory } from './entities/expense-category.entity';
import { PettyCash } from './entities/petty-cash.entity';
import { Expense } from './entities/expense.entity';
import { PettyCashService } from './services/petty-cash.service';
import { ExpensesService } from './services/expenses.service';
import { PettyCashController } from './controllers/petty-cash.controller';
import { ExpensesController } from './controllers/expenses.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ExpenseCategory, PettyCash, Expense]),
    // TODO: Importar StorageModule cuando esté disponible
  ],
  controllers: [PettyCashController, ExpensesController],
  providers: [PettyCashService, ExpensesService],
})
export class PettyCashModule {}

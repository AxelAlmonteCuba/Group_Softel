import { Controller } from '@nestjs/common';
import { ExpensesService } from '../services/expenses.service';

@Controller('gastos')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}
}

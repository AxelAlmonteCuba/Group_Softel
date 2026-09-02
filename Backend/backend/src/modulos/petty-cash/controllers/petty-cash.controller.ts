import { Controller } from '@nestjs/common';
import { PettyCashService } from '../services/petty-cash.service';

@Controller('cajas-chicas')
export class PettyCashController {
  constructor(private readonly pettyCashService: PettyCashService) {}
}

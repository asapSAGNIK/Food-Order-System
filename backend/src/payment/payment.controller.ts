import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, Country } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('payment-methods')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Roles(Role.ADMIN) // Requirement: update payment method is Admin only. 
  @Get()             // Let's restrict viewing all to Admin as well, since Managers/Members don't need it.
  findAll(@CurrentUser() user: any) {
    return this.paymentService.findAll(user.role, user.country);
  }

  @Roles(Role.ADMIN)
  @Get(':country')
  findByCountry(@Param('country') country: Country) {
    return this.paymentService.findByCountry(country);
  }

  @Roles(Role.ADMIN)
  @Patch(':country')
  update(@Param('country') country: Country, @Body() updateData: any, @CurrentUser() user: any) {
    return this.paymentService.update(country, updateData, user.id);
  }
}

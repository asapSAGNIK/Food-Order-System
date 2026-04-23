import { Controller, Get, Post, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  @Post()
  createDraft(@Body('restaurantId') restaurantId: number, @CurrentUser() user: any) {
    return this.ordersService.createDraft(user.id, +restaurantId, user.role, user.country);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.ordersService.findAll(user.id, user.role, user.country);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.findOne(+id, user.id, user.role, user.country);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  @Post(':id/items')
  addItem(
    @Param('id') orderId: string, 
    @Body('menuItemId') menuItemId: number, 
    @Body('quantity') quantity: number,
    @CurrentUser() user: any
  ) {
    return this.ordersService.addItem(+orderId, +menuItemId, +quantity, user.id, user.role, user.country);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  @Delete(':id/items/:itemId')
  removeItem(@Param('id') orderId: string, @Param('itemId') itemId: string, @CurrentUser() user: any) {
    return this.ordersService.removeItem(+orderId, +itemId, user.id, user.role, user.country);
  }

  // --- Manager and Admin Only Routes --- //
  
  @Roles(Role.ADMIN, Role.MANAGER)
  @Post(':id/place')
  placeOrder(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.placeOrder(+id, user.id, user.role, user.country);
  }

  @Roles(Role.ADMIN, Role.MANAGER)
  @Post(':id/cancel')
  cancelOrder(@Param('id') id: string, @CurrentUser() user: any) {
    return this.ordersService.cancelOrder(+id, user.id, user.role, user.country);
  }
}

import { Controller, Get, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('restaurants')
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.restaurantsService.findAll(user.role, user.country);
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const restaurant = await this.restaurantsService.findOne(+id, user.role, user.country);
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found or access denied in your country context');
    }
    return restaurant;
  }

  @Roles(Role.ADMIN, Role.MANAGER, Role.MEMBER)
  @Get(':id/menu')
  async getMenu(@Param('id') id: string, @CurrentUser() user: any) {
    const menu = await this.restaurantsService.getMenu(+id, user.role, user.country);
    if (!menu) {
      throw new NotFoundException('Restaurant not found or access denied in your country context');
    }
    return menu;
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Country, Role } from '@prisma/client';

@Injectable()
export class RestaurantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userRole: Role, userCountry: Country) {
    // If admin, see all. Else, see only restaurants from their country.
    const whereClause = userRole === Role.ADMIN ? {} : { country: userCountry };
    return this.prisma.restaurant.findMany({
      where: whereClause,
    });
  }

  async findOne(id: number, userRole: Role, userCountry: Country) {
    const whereClause = userRole === Role.ADMIN ? { id } : { id, country: userCountry };
    return this.prisma.restaurant.findFirst({
      where: whereClause,
      include: { menuItems: true },
    });
  }

  async getMenu(id: number, userRole: Role, userCountry: Country) {
    // Re-use logic to ensure they have access to the restaurant first
    const restaurant = await this.findOne(id, userRole, userCountry);
    if (!restaurant) {
      return null;
    }
    return this.prisma.menuItem.findMany({
      where: { restaurantId: id },
    });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Country, Role } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async findAll(userRole: Role, userCountry: Country) {
    const whereClause = userRole === Role.ADMIN ? {} : { country: userCountry };
    return this.prisma.paymentMethod.findMany({
      where: whereClause,
    });
  }

  async findByCountry(country: Country) {
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { country },
    });
    if (!paymentMethod) throw new NotFoundException(`No payment method for ${country}`);
    return paymentMethod;
  }

  async update(country: Country, data: any, adminId: number) {
    const existing = await this.findByCountry(country);
    return this.prisma.paymentMethod.update({
      where: { id: existing.id },
      data: {
        ...data,
        updatedBy: adminId,
      },
    });
  }
}

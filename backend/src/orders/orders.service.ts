import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Country, Role, OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  private async calculateTotal(orderId: number) {
    const items = await this.prisma.orderItem.findMany({ where: { orderId } });
    const total = items.reduce((acc, item) => acc + (Number(item.unitPrice) * item.quantity), 0);
    await this.prisma.order.update({
      where: { id: orderId },
      data: { totalAmount: total }
    });
  }

  async createDraft(userId: number, restaurantId: number, userRole: Role, userCountry: Country) {
    // Verify restaurant exists and is in scope
    const restaurant = await this.prisma.restaurant.findUnique({ where: { id: restaurantId } });
    if (!restaurant) throw new NotFoundException('Restaurant not found');
    if (userRole !== Role.ADMIN && restaurant.country !== userCountry) {
      throw new ForbiddenException('Cannot order from a restaurant outside your country');
    }

    return this.prisma.order.create({
      data: {
        userId,
        restaurantId,
        status: OrderStatus.DRAFT,
      }
    });
  }

  async findAll(userId: number, userRole: Role, userCountry: Country) {
    const whereClause: any = {};
    if (userRole === Role.MEMBER) {
      whereClause.userId = userId; // Members only see their own orders
    } else if (userRole === Role.MANAGER) {
      whereClause.restaurant = { country: userCountry }; // Managers see all orders in their country
    }
    // Admins see all orders (no where clause overrides)

    return this.prisma.order.findMany({
      where: whereClause,
      include: { items: true, restaurant: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: number, userId: number, userRole: Role, userCountry: Country) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { menuItem: true } }, restaurant: true }
    });

    if (!order) throw new NotFoundException('Order not found');

    if (userRole === Role.MEMBER && order.userId !== userId) {
      throw new ForbiddenException('Access denied to this order');
    }
    if (userRole === Role.MANAGER && order.restaurant.country !== userCountry) {
      throw new ForbiddenException('Order belongs to another country');
    }

    return order;
  }

  async addItem(orderId: number, menuItemId: number, quantity: number, userId: number, userRole: Role, userCountry: Country) {
    const order = await this.findOne(orderId, userId, userRole, userCountry);
    if (order.status !== OrderStatus.DRAFT) throw new BadRequestException('Can only modify DRAFT orders');

    const menuItem = await this.prisma.menuItem.findUnique({ where: { id: menuItemId } });
    if (!menuItem) throw new NotFoundException('Menu item not found');

    const orderItem = await this.prisma.orderItem.create({
      data: {
        orderId,
        menuItemId,
        quantity,
        unitPrice: menuItem.price,
      }
    });

    await this.calculateTotal(orderId);
    return orderItem;
  }

  async removeItem(orderId: number, itemId: number, userId: number, userRole: Role, userCountry: Country) {
    const order = await this.findOne(orderId, userId, userRole, userCountry);
    if (order.status !== OrderStatus.DRAFT) throw new BadRequestException('Can only modify DRAFT orders');

    await this.prisma.orderItem.delete({ where: { id: itemId } });
    await this.calculateTotal(orderId);
    return { success: true };
  }

  async placeOrder(id: number, userId: number, userRole: Role, userCountry: Country) {
    const order = await this.findOne(id, userId, userRole, userCountry);
    if (order.status !== OrderStatus.DRAFT) throw new BadRequestException('Order is not in DRAFT status');

    // Simulate Payment logic here if needed (check if payment method exists)
    const paymentMethod = await this.prisma.paymentMethod.findFirst({
      where: { country: order.restaurant.country }
    });

    if (!paymentMethod) {
      throw new BadRequestException('No payment method registered for this country. Contact Admin.');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.PLACED }
    });
  }

  async cancelOrder(id: number, userId: number, userRole: Role, userCountry: Country) {
    const order = await this.findOne(id, userId, userRole, userCountry);
    if (order.status === OrderStatus.CANCELLED) throw new BadRequestException('Order already cancelled');

    return this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED }
    });
  }
}

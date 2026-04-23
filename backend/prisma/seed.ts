import { PrismaClient, Role, Country } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  // 1. Clear existing data (optional, but good for fresh seeds)
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.user.deleteMany();

  // 2. Hash default password
  const password = await bcrypt.hash('password123', 10);

  // 3. Create Users based on assignment requirements
  const admin = await prisma.user.create({
    data: { name: 'Nick Fury', email: 'nick@slooze.com', password, role: Role.ADMIN, country: Country.GLOBAL }
  });

  const managerIndia = await prisma.user.create({
    data: { name: 'Captain Marvel', email: 'marvel@slooze.com', password, role: Role.MANAGER, country: Country.INDIA }
  });

  const managerAmerica = await prisma.user.create({
    data: { name: 'Captain America', email: 'america@slooze.com', password, role: Role.MANAGER, country: Country.AMERICA }
  });

  const memberIndia1 = await prisma.user.create({
    data: { name: 'Thanos', email: 'thanos@slooze.com', password, role: Role.MEMBER, country: Country.INDIA }
  });

  const memberIndia2 = await prisma.user.create({
    data: { name: 'Thor', email: 'thor@slooze.com', password, role: Role.MEMBER, country: Country.INDIA }
  });

  const memberAmerica = await prisma.user.create({
    data: { name: 'Travis', email: 'travis@slooze.com', password, role: Role.MEMBER, country: Country.AMERICA }
  });

  // 4. Create Restaurants
  const taj = await prisma.restaurant.create({
    data: { name: 'Taj Mahal Delights', cuisine: 'Indian', country: Country.INDIA }
  });

  const punjab_grill = await prisma.restaurant.create({
    data: { name: 'Punjab Grill', cuisine: 'North Indian', country: Country.INDIA }
  });

  const liberty_burgers = await prisma.restaurant.create({
    data: { name: 'Liberty Burgers', cuisine: 'American', country: Country.AMERICA }
  });

  const nyc_pizza = await prisma.restaurant.create({
    data: { name: 'NYC Pizza Co.', cuisine: 'Italian-American', country: Country.AMERICA }
  });

  // 5. Create Menu Items
  await prisma.menuItem.createMany({
    data: [
      { restaurantId: taj.id, name: 'Chicken Tikka Masala', price: 12.99, category: 'Main' },
      { restaurantId: taj.id, name: 'Garlic Naan', price: 3.99, category: 'Sides' },
      { restaurantId: punjab_grill.id, name: 'Butter Chicken', price: 14.50, category: 'Main' },
      { restaurantId: punjab_grill.id, name: 'Samosa Chaat', price: 7.99, category: 'Appetizer' },
      { restaurantId: liberty_burgers.id, name: 'Classic Smash Burger', price: 10.99, category: 'Main' },
      { restaurantId: liberty_burgers.id, name: 'Freedom Fries', price: 4.50, category: 'Sides' },
      { restaurantId: nyc_pizza.id, name: 'Pepperoni Slice', price: 5.00, category: 'Main' },
      { restaurantId: nyc_pizza.id, name: 'Garlic Knots', price: 6.50, category: 'Sides' },
    ]
  });

  // 6. Create Initial Payment Methods for each country
  await prisma.paymentMethod.createMany({
    data: [
      { country: Country.INDIA, cardholderName: 'Nick Fury Org', lastFourDigits: '1234', expiryMonth: 12, expiryYear: 28, cardType: 'Visa', updatedBy: admin.id },
      { country: Country.AMERICA, cardholderName: 'Nick Fury Org', lastFourDigits: '9876', expiryMonth: 10, expiryYear: 27, cardType: 'Mastercard', updatedBy: admin.id },
    ]
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

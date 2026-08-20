import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const business = await prisma.business.create({
    data: { name: "Kijani Kiosk", address: "Nairobi, Kenya", phone: "+254700000000", email: "info@example.com" },
  });

  const mainBranch = await prisma.branch.create({
    data: { businessId: business.id, name: "Kijani Kiosk", location: "Main Branch" },
  });

  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    throw new Error("Set SEED_ADMIN_PASSWORD in your .env before seeding.");
  }

  await prisma.user.create({
    data: {
      name: "Brandon Maina",
      email: process.env.SEED_ADMIN_EMAIL || "admin@example.com",
      passwordHash: await bcrypt.hash(adminPassword, 10),
      role: "SUPER_ADMIN",
      branchId: mainBranch.id,
    },
  });

  const category = await prisma.category.create({ data: { name: "Groceries" } });

  await prisma.product.createMany({
    data: [
      { name: "Coca Cola 330ml", sku: "SKU-1001", costPrice: 80, sellingPrice: 120, stock: 84, minStock: 20, categoryId: category.id, branchId: mainBranch.id },
      { name: "White Bread", sku: "SKU-1002", costPrice: 45, sellingPrice: 65, stock: 40, minStock: 15, categoryId: category.id, branchId: mainBranch.id },
      { name: "Fresh Milk 500ml", sku: "SKU-1003", costPrice: 50, sellingPrice: 70, stock: 8, minStock: 20, categoryId: category.id, branchId: mainBranch.id },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

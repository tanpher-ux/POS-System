import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, AuthedRequest } from "../middleware/auth.js";

export const salesRouter = Router();

const checkoutSchema = z.object({
  branchId: z.string(),
  customerId: z.string().optional(),
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().positive() })).min(1),
  discount: z.number().nonnegative().default(0),
  taxRate: z.number().nonnegative().default(16),
  payment: z.object({
    method: z.enum(["CASH", "MPESA", "CARD", "BANK", "OTHER"]),
    amount: z.number().positive(),
    reference: z.string().optional(),
    phoneNumber: z.string().optional(),
  }),
});

// Creates the order, order items, payment, and decrements stock atomically.
// This is the single source of truth for "checkout" — mirrors the client
// POS flow in client/src/App.jsx (completeSale).
salesRouter.post("/", requireAuth, async (req: AuthedRequest, res) => {
  const parsed = checkoutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid checkout payload", errors: parsed.error.flatten() });
  const { branchId, customerId, items, discount, taxRate, payment } = parsed.data;

  const products = await prisma.product.findMany({ where: { id: { in: items.map((i) => i.productId) } } });
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
    if (product.stock < item.qty) return res.status(409).json({ message: `Not enough stock for ${product.name}` });
  }

  const subtotal = items.reduce((sum, i) => {
    const product = products.find((p) => p.id === i.productId)!;
    return sum + Number(product.sellingPrice) * i.qty;
  }, 0);
  const taxable = Math.max(subtotal - discount, 0);
  const tax = taxable * (taxRate / 100);
  const total = taxable + tax;

  const now = new Date();
  const receiptNumber = `REC-${now.toISOString().slice(0, 10).replace(/-/g, "")}-${Math.floor(Math.random() * 90000 + 10000)}`;
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        receiptNumber,
        branchId,
        customerId,
        cashierId: req.user!.id,
        subtotal,
        discount,
        tax,
        total,
        status: "COMPLETED",
        items: {
          create: items.map((i) => {
            const product = products.find((p) => p.id === i.productId)!;
            return {
              productId: i.productId,
              qty: i.qty,
              unitPrice: product.sellingPrice,
              total: Number(product.sellingPrice) * i.qty,
            };
          }),
        },
        payments: { create: [payment] },
      },
      include: { items: true, payments: true },
    });

    for (const item of items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.qty } } });
      await tx.inventoryMovement.create({
        data: { productId: item.productId, type: "Sale", quantity: -item.qty, userId: req.user!.id },
      });
    }

    return created;
  });

  res.status(201).json(order);
});

salesRouter.get("/", requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    include: { items: true, payments: true, customer: true, cashier: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(orders);
});

salesRouter.get("/:id", requireAuth, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: { items: { include: { product: true } }, payments: true, customer: true, cashier: true },
  });
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

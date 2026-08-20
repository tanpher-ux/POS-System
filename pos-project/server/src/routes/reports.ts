import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const reportsRouter = Router();

reportsRouter.get("/sales", requireAuth, async (req, res) => {
  const { from, to } = req.query;
  const orders = await prisma.order.findMany({
    where: {
      status: "COMPLETED",
      createdAt: {
        gte: from ? new Date(String(from)) : undefined,
        lte: to ? new Date(String(to)) : undefined,
      },
    },
  });
  const gross = orders.reduce((s, o) => s + Number(o.subtotal), 0);
  const discounts = orders.reduce((s, o) => s + Number(o.discount), 0);
  const tax = orders.reduce((s, o) => s + Number(o.tax), 0);
  const net = orders.reduce((s, o) => s + Number(o.total), 0);
  res.json({ transactions: orders.length, gross, discounts, tax, net, average: orders.length ? net / orders.length : 0 });
});

reportsRouter.get("/profit", requireAuth, requireRole("ADMIN", "SUPER_ADMIN", "MANAGER"), async (_req, res) => {
  const orders = await prisma.order.findMany({ where: { status: "COMPLETED" }, include: { items: { include: { product: true } } } });
  const expenses = await prisma.expense.findMany();

  const revenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const cogs = orders.reduce(
    (s, o) => s + o.items.reduce((s2, it) => s2 + Number(it.product.costPrice) * it.qty, 0),
    0
  );
  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - totalExpenses;

  res.json({ revenue, cogs, grossProfit, expenses: totalExpenses, netProfit });
});

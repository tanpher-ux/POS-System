import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole, AuthedRequest } from "../middleware/auth.js";

export const inventoryRouter = Router();

inventoryRouter.get("/", requireAuth, async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { stock: "asc" } });
  res.json(products);
});

const adjustSchema = z.object({
  productId: z.string(),
  newQuantity: z.number().int().nonnegative(),
  reason: z.string().min(1),
  notes: z.string().optional(),
});

inventoryRouter.post(
  "/adjust",
  requireAuth,
  requireRole("ADMIN", "SUPER_ADMIN", "STOCK_MANAGER", "MANAGER"),
  async (req: AuthedRequest, res) => {
    const parsed = adjustSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid adjustment payload" });
    const { productId, newQuantity, reason, notes } = parsed.data;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const delta = newQuantity - product.stock;

    const [updated] = await prisma.$transaction([
      prisma.product.update({ where: { id: productId }, data: { stock: newQuantity } }),
      prisma.inventoryMovement.create({
        data: { productId, type: "Adjustment", quantity: delta, reason: `${reason}${notes ? ` — ${notes}` : ""}`, userId: req.user!.id },
      }),
      prisma.auditLog.create({
        data: { userId: req.user!.id, action: "Stock adjustment", details: `${product.name}: ${product.stock} → ${newQuantity} (${reason})` },
      }),
    ]);

    res.json(updated);
  }
);

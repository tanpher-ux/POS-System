import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const productsRouter = Router();

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().optional(),
  costPrice: z.number().nonnegative(),
  sellingPrice: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative().default(0),
  unit: z.string().default("pcs"),
  categoryId: z.string().optional(),
  supplierId: z.string().optional(),
  branchId: z.string().optional(),
});

productsRouter.get("/", requireAuth, async (req, res) => {
  const { search } = req.query;
  const products = await prisma.product.findMany({
    where: search
      ? { OR: [{ name: { contains: String(search), mode: "insensitive" } }, { sku: { contains: String(search), mode: "insensitive" } }] }
      : undefined,
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(products);
});

productsRouter.post("/", requireAuth, requireRole("ADMIN", "SUPER_ADMIN", "STOCK_MANAGER"), async (req, res) => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid product data", errors: parsed.error.flatten() });
  const product = await prisma.product.create({ data: parsed.data });
  res.status(201).json(product);
});

productsRouter.put("/:id", requireAuth, requireRole("ADMIN", "SUPER_ADMIN", "STOCK_MANAGER"), async (req, res) => {
  const parsed = productSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid product data" });
  const product = await prisma.product.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(product);
});

productsRouter.delete("/:id", requireAuth, requireRole("ADMIN", "SUPER_ADMIN"), async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

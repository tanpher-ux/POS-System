import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

export const customersRouter = Router();

const customerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  type: z.string().default("Regular"),
});

customersRouter.get("/", requireAuth, async (_req, res) => {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: "desc" } });
  res.json(customers);
});

customersRouter.post("/", requireAuth, async (req, res) => {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: "Invalid customer data" });
  const customer = await prisma.customer.create({ data: parsed.data });
  res.status(201).json(customer);
});

customersRouter.get("/:id", requireAuth, async (req, res) => {
  const customer = await prisma.customer.findUnique({
    where: { id: req.params.id },
    include: { orders: { orderBy: { createdAt: "desc" }, take: 20 } },
  });
  if (!customer) return res.status(404).json({ message: "Customer not found" });
  res.json(customer);
});

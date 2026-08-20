import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import { authRouter } from "./routes/auth.js";
import { productsRouter } from "./routes/products.js";
import { salesRouter } from "./routes/sales.js";
import { customersRouter } from "./routes/customers.js";
import { inventoryRouter } from "./routes/inventory.js";
import { reportsRouter } from "./routes/reports.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Basic protection against brute-forcing auth endpoints.
app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { message: "Too many attempts, try again later" } })
);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/sales", salesRouter);
app.use("/api/orders", salesRouter); // alias, per spec's /api/orders naming
app.use("/api/customers", customersRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/reports", reportsRouter);

// Central error handler — never leak stack traces to the client.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.publicMessage || "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`POS API listening on http://localhost:${PORT}`);
});

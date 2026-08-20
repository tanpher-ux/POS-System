import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutGrid, ShoppingCart, Package, Boxes, Users, ClipboardList, Truck,
  Wallet, UserCog, BarChart3, Building2, Settings, Search, Bell, ChevronDown,
  Plus, Minus, Trash2, X, Check, Printer, Download, Mail, CreditCard,
  Smartphone, Banknote, Landmark, TrendingUp, TrendingDown, AlertTriangle,
  LogOut, Menu, Store, Filter, Edit2, Eye, ArrowUpRight, ArrowDownRight,
  Loader2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

/* ---------------------------------------------------------------------
   DEMO / SEED DATA
--------------------------------------------------------------------- */

const CATEGORIES = ["Beverages", "Bakery", "Dairy", "Groceries", "Household", "Other"];

const SEED_PRODUCTS = [
  { id: "p1", name: "Coca Cola 330ml", sku: "SKU-1001", barcode: "6001full1", category: "Beverages", cost: 80, price: 120, stock: 84, minStock: 20, unit: "pcs", image: "🥤" },
  { id: "p2", name: "White Bread", sku: "SKU-1002", barcode: "6001full2", category: "Bakery", cost: 45, price: 65, stock: 40, minStock: 15, unit: "pcs", image: "🍞" },
  { id: "p3", name: "Fresh Milk 500ml", sku: "SKU-1003", barcode: "6001full3", category: "Dairy", cost: 50, price: 70, stock: 8, minStock: 20, unit: "pcs", image: "🥛" },
  { id: "p4", name: "Eggs Tray", sku: "SKU-1004", barcode: "6001full4", category: "Groceries", cost: 320, price: 420, stock: 25, minStock: 10, unit: "trays", image: "🥚" },
  { id: "p5", name: "Sugar 1kg", sku: "SKU-1005", barcode: "6001full5", category: "Groceries", cost: 140, price: 180, stock: 60, minStock: 15, unit: "pcs", image: "🧂" },
  { id: "p6", name: "Unga Maize Flour 2kg", sku: "SKU-1006", barcode: "6001full6", category: "Groceries", cost: 180, price: 230, stock: 55, minStock: 15, unit: "pcs", image: "🌽" },
  { id: "p7", name: "Cooking Oil 1L", sku: "SKU-1007", barcode: "6001full7", category: "Groceries", cost: 260, price: 320, stock: 30, minStock: 10, unit: "pcs", image: "🛢️" },
  { id: "p8", name: "Bottled Water 500ml", sku: "SKU-1008", barcode: "6001full8", category: "Beverages", cost: 30, price: 50, stock: 120, minStock: 30, unit: "pcs", image: "💧" },
  { id: "p9", name: "Soap Bar", sku: "SKU-1009", barcode: "6001full9", category: "Household", cost: 40, price: 60, stock: 5, minStock: 20, unit: "pcs", image: "🧼" },
  { id: "p10", name: "Rice 2kg", sku: "SKU-1010", barcode: "6001full10", category: "Groceries", cost: 220, price: 290, stock: 45, minStock: 15, unit: "pcs", image: "🍚" },
];

const SEED_CUSTOMERS = [
  { id: "c0", name: "Walk-in Customer", phone: "", email: "", type: "Walk-in", createdAt: Date.now() },
  { id: "c1", name: "Mary Wanjiku", phone: "0712345678", email: "mary@example.com", type: "Regular", createdAt: Date.now() },
  { id: "c2", name: "John Kamau", phone: "0722334455", email: "john@example.com", type: "Regular", createdAt: Date.now() },
  { id: "c3", name: "Grace Mwangi", phone: "0733445566", email: "grace@example.com", type: "Wholesale", createdAt: Date.now() },
  { id: "c4", name: "Peter Otieno", phone: "0744556677", email: "peter@example.com", type: "Regular", createdAt: Date.now() },
];

const SEED_EMPLOYEES = [
  { id: "u1", name: "Brandon Maina", email: "admin@example.com", phone: "0700000000", role: "Super Admin", branch: "Main Branch", status: "Active" },
  { id: "u2", name: "Alice Njeri", email: "alice@example.com", phone: "0700000001", role: "Cashier", branch: "Main Branch", status: "Active" },
  { id: "u3", name: "Kevin Otieno", email: "kevin@example.com", phone: "0700000002", role: "Manager", branch: "Westlands Branch", status: "Active" },
];

const BRANCHES = [
  { id: "b1", name: "Kijani Kiosk", location: "Main Branch" },
  { id: "b2", name: "Kijani Kiosk", location: "Westlands Branch" },
];

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "mpesa", label: "M-Pesa", icon: Smartphone },
  { id: "card", label: "Card", icon: CreditCard },
  { id: "bank", label: "Bank", icon: Landmark },
];

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "pos", label: "POS / New Sale", icon: ShoppingCart },
  { id: "sales", label: "Sales", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "inventory", label: "Inventory", icon: Boxes },
  { id: "customers", label: "Customers", icon: Users },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "suppliers", label: "Suppliers", icon: Truck },
  { id: "expenses", label: "Expenses", icon: Wallet },
  { id: "employees", label: "Employees", icon: UserCog },
  { id: "reports", label: "Reports", icon: BarChart3 },
  { id: "branches", label: "Branches", icon: Building2 },
  { id: "settings", label: "Settings", icon: Settings },
];

const CURRENCY = "KES";
const TAX_RATE = 0.16;

/* ---------------------------------------------------------------------
   STORAGE HELPERS  (window.storage acts as our "database")
--------------------------------------------------------------------- */

async function loadCollection(key, seed) {
  try {
    const res = await window.storage.get(key, false);
    if (res && res.value) return JSON.parse(res.value);
    await window.storage.set(key, JSON.stringify(seed), false);
    return seed;
  } catch (e) {
    try {
      await window.storage.set(key, JSON.stringify(seed), false);
    } catch (_) {}
    return seed;
  }
}

async function saveCollection(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value), false);
  } catch (e) {
    console.error("save failed", key, e);
  }
}

/* ---------------------------------------------------------------------
   UTIL
--------------------------------------------------------------------- */

function money(n) {
  const v = Number.isFinite(n) ? n : 0;
  return `${CURRENCY} ${v.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function shortDate(ts) {
  return new Date(ts).toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

function timeStr(ts) {
  return new Date(ts).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" });
}

function genId(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.floor(Math.random() * 9000 + 1000)}`;
}

function genReceiptNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `REC-${ymd}-${String(Math.floor(Math.random() * 90000 + 10000))}`;
}

const dayName = (ts) => new Date(ts).toLocaleDateString("en-KE", { weekday: "short" });

/* ---------------------------------------------------------------------
   TOASTS
--------------------------------------------------------------------- */

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((type, message) => {
    const id = genId("t");
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);
  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));
  return { toasts, push, remove };
}

function ToastHost({ toasts, remove }) {
  const styles = {
    success: { bg: "#F0FDF4", border: "#16A34A", color: "#166534", Icon: Check },
    error: { bg: "#FEF2F2", border: "#DC2626", color: "#991B1B", Icon: X },
    warning: { bg: "#FFFBEB", border: "#F59E0B", color: "#92400E", Icon: AlertTriangle },
    info: { bg: "#EFF6FF", border: "#2563EB", color: "#1E40AF", Icon: Bell },
  };
  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 200, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => {
        const s = styles[t.type] || styles.info;
        const Icon = s.Icon;
        return (
          <div key={t.id} style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color, padding: "10px 14px", borderRadius: 10, minWidth: 260, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", fontSize: 13.5, fontWeight: 500 }}>
            <Icon size={16} />
            <span style={{ flex: 1 }}>{t.message}</span>
            <button onClick={() => remove(t.id)} style={{ background: "none", border: "none", cursor: "pointer", color: s.color, opacity: 0.6, display: "flex" }}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------------
   PRIMITIVES
--------------------------------------------------------------------- */

function Badge({ children, tone = "default" }) {
  const tones = {
    default: { bg: "#F1F5F9", color: "#475569" },
    success: { bg: "#DCFCE7", color: "#166534" },
    warning: { bg: "#FEF3C7", color: "#92400E" },
    danger: { bg: "#FEE2E2", color: "#991B1B" },
    info: { bg: "#DBEAFE", color: "#1E40AF" },
  };
  const s = tones[tone] || tones.default;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 999, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}

function Card({ children, style, ...props }) {
  return (
    <div
      style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 14, boxShadow: "0 1px 2px rgba(15,23,42,0.04)", ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

function Btn({ children, variant = "primary", size = "md", style, ...props }) {
  const variants = {
    primary: { background: "#2563EB", color: "#fff", border: "1px solid #2563EB" },
    secondary: { background: "#fff", color: "#0F172A", border: "1px solid #E2E8F0" },
    danger: { background: "#DC2626", color: "#fff", border: "1px solid #DC2626" },
    success: { background: "#16A34A", color: "#fff", border: "1px solid #16A34A" },
    ghost: { background: "transparent", color: "#475569", border: "1px solid transparent" },
  };
  const sizes = { sm: { padding: "6px 12px", fontSize: 13 }, md: { padding: "9px 16px", fontSize: 14 }, lg: { padding: "12px 20px", fontSize: 15 } };
  return (
    <button
      style={{
        ...variants[variant], ...sizes[size],
        borderRadius: 10, fontWeight: 600, cursor: "pointer", display: "inline-flex",
        alignItems: "center", justifyContent: "center", gap: 6, transition: "all .15s",
        opacity: props.disabled ? 0.5 : 1, ...style,
      }}
      onMouseEnter={(e) => { if (!props.disabled) e.currentTarget.style.filter = "brightness(0.95)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
      {...props}
    >
      {children}
    </button>
  );
}

function Input({ label, style, ...props }) {
  return (
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155" }}>
      {label && <div style={{ marginBottom: 6 }}>{label}</div>}
      <input
        style={{
          width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid #E2E8F0",
          fontSize: 14, outline: "none", color: "#0F172A", boxSizing: "border-box", ...style,
        }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "#2563EB")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "#E2E8F0")}
        {...props}
      />
    </label>
  );
}

function Select({ label, children, style, ...props }) {
  return (
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#334155" }}>
      {label && <div style={{ marginBottom: 6 }}>{label}</div>}
      <select
        style={{
          width: "100%", padding: "9px 12px", borderRadius: 9, border: "1px solid #E2E8F0",
          fontSize: 14, outline: "none", color: "#0F172A", background: "#fff", boxSizing: "border-box", ...style,
        }}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: width, maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid #E2E8F0" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0F172A" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "#F1F5F9", border: "none", borderRadius: 8, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748B" }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

function ConfirmDialog({ title, message, onConfirm, onCancel, danger = true }) {
  return (
    <Modal title={title} onClose={onCancel} width={380}>
      <p style={{ fontSize: 14, color: "#475569", marginTop: 0 }}>{message}</p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
        <Btn variant={danger ? "danger" : "primary"} onClick={onConfirm}>Confirm</Btn>
      </div>
    </Modal>
  );
}

function EmptyState({ icon: Icon, title, message, actionLabel, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748B" }}>
      <div style={{ width: 56, height: 56, borderRadius: 16, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Icon size={26} color="#2563EB" />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, marginBottom: 18 }}>{message}</div>
      {actionLabel && (
        <Btn onClick={onAction} style={{ margin: "0 auto" }}>
          <Plus size={16} /> {actionLabel}
        </Btn>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Completed: "success", Paid: "success", Active: "success",
    Pending: "warning", "Low Stock": "warning",
    Refunded: "danger", Cancelled: "danger", "Out of Stock": "danger", Inactive: "danger",
    "In Stock": "info",
  };
  return <Badge tone={map[status] || "default"}>{status}</Badge>;
}

function Skeleton({ h = 16, w = "100%" }) {
  return <div style={{ height: h, width: w, background: "linear-gradient(90deg,#F1F5F9,#E2E8F0,#F1F5F9)", backgroundSize: "200% 100%", borderRadius: 6, animation: "shimmer 1.3s infinite" }} />;
}

/* ---------------------------------------------------------------------
   APP STATE / DATA CONTEXT (simple prop drilling for clarity)
--------------------------------------------------------------------- */

export default function App() {
  const { toasts, push, remove } = useToasts();

  const [booted, setBooted] = useState(false);
  const [user, setUser] = useState(null); // logged in user
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [branch, setBranch] = useState(BRANCHES[0]);

  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [orders, setOrders] = useState([]); // completed sales/orders
  const [expenses, setExpenses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [settings, setSettings] = useState({
    businessName: "Kijani Kiosk",
    address: "Nairobi, Kenya",
    phone: "+254 700 000 000",
    email: "info@example.com",
    currency: "KES",
    taxRate: 16,
    timezone: "Africa/Nairobi",
  });

  // boot: load everything from storage
  useEffect(() => {
    (async () => {
      const [p, c, e, o, ex, sup, st] = await Promise.all([
        loadCollection("products", SEED_PRODUCTS),
        loadCollection("customers", SEED_CUSTOMERS),
        loadCollection("employees", SEED_EMPLOYEES),
        loadCollection("orders", []),
        loadCollection("expenses", []),
        loadCollection("suppliers", [
          { id: "s1", name: "Nairobi Distributors Ltd", contact: "James Mwangi", phone: "0711223344", email: "sales@nairobidist.co.ke", products: 24, totalPurchases: 145000, balance: 12000 },
          { id: "s2", name: "Coastal Wholesalers", contact: "Fatuma Ali", phone: "0722556677", email: "info@coastalw.co.ke", products: 15, totalPurchases: 88000, balance: 0 },
        ]),
        loadCollection("settings", null),
      ]);
      setProducts(p); setCustomers(c); setEmployees(e); setOrders(o); setExpenses(ex); setSuppliers(sup);
      if (st) setSettings(st);
      setBooted(true);
    })();
  }, []);

  useEffect(() => { if (booted) saveCollection("products", products); }, [products, booted]);
  useEffect(() => { if (booted) saveCollection("customers", customers); }, [customers, booted]);
  useEffect(() => { if (booted) saveCollection("employees", employees); }, [employees, booted]);
  useEffect(() => { if (booted) saveCollection("orders", orders); }, [orders, booted]);
  useEffect(() => { if (booted) saveCollection("expenses", expenses); }, [expenses, booted]);
  useEffect(() => { if (booted) saveCollection("suppliers", suppliers); }, [suppliers, booted]);
  useEffect(() => { if (booted) saveCollection("settings", settings); }, [settings, booted]);

  if (!booted) {
    return (
      <div style={{ minHeight: 500, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, 'Segoe UI', sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, color: "#64748B" }}>
          <Loader2 className="spin" size={28} />
          <span style={{ fontSize: 14 }}>Loading POS system…</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ fontFamily: "Inter, 'Segoe UI', sans-serif" }}>
        <GlobalStyle />
        <LoginScreen employees={employees} onLogin={(u) => { setUser(u); push("success", `Welcome back, ${u.name.split(" ")[0]}`); }} />
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, 'Segoe UI', sans-serif", background: "#F8FAFC", minHeight: 600, borderRadius: 12, overflow: "hidden", border: "1px solid #E2E8F0" }}>
      <GlobalStyle />
      <ToastHost toasts={toasts} remove={remove} />
      <div style={{ display: "flex", minHeight: 600 }}>
        <Sidebar page={page} setPage={setPage} open={sidebarOpen} branch={branch} setBranch={setBranch} user={user} onLogout={() => setUser(null)} />
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <Topbar page={page} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} products={products} orders={orders} customers={customers} settings={settings} setPage={setPage} />
          <div style={{ padding: 20, flex: 1, overflow: "auto" }}>
            {page === "dashboard" && <Dashboard orders={orders} products={products} customers={customers} expenses={expenses} settings={settings} />}
            {page === "pos" && <POS products={products} setProducts={setProducts} customers={customers} setCustomers={setCustomers} orders={orders} setOrders={setOrders} user={user} branch={branch} settings={settings} push={push} />}
            {page === "sales" && <SalesPage orders={orders} />}
            {page === "products" && <ProductsPage products={products} setProducts={setProducts} push={push} />}
            {page === "inventory" && <InventoryPage products={products} setProducts={setProducts} push={push} />}
            {page === "customers" && <CustomersPage customers={customers} setCustomers={setCustomers} orders={orders} push={push} />}
            {page === "orders" && <OrdersPage orders={orders} setOrders={setOrders} products={products} setProducts={setProducts} push={push} />}
            {page === "suppliers" && <SuppliersPage suppliers={suppliers} setSuppliers={setSuppliers} push={push} />}
            {page === "expenses" && <ExpensesPage expenses={expenses} setExpenses={setExpenses} user={user} push={push} />}
            {page === "employees" && <EmployeesPage employees={employees} setEmployees={setEmployees} push={push} />}
            {page === "reports" && <ReportsPage orders={orders} products={products} expenses={expenses} customers={customers} employees={employees} />}
            {page === "branches" && <BranchesPage />}
            {page === "settings" && <SettingsPage settings={settings} setSettings={setSettings} push={push} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      .spin { animation: spin 1s linear infinite; }
      @keyframes spin { to { transform: rotate(360deg); } }
      * { box-sizing: border-box; }
      table { border-collapse: collapse; width: 100%; }
      th { text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .03em; color: #64748B; padding: 10px 14px; border-bottom: 1px solid #E2E8F0; }
      td { padding: 12px 14px; font-size: 13.5px; color: #0F172A; border-bottom: 1px solid #F1F5F9; }
      tbody tr:hover { background: #F8FAFC; }
      ::placeholder { color: #94A3B8; }
      @media print {
        body * { visibility: hidden; }
        #print-area, #print-area * { visibility: visible; }
        #print-area { position: absolute; left: 0; top: 0; width: 100%; }
      }
    `}</style>
  );
}

/* ---------------------------------------------------------------------
   LOGIN
--------------------------------------------------------------------- */

function LoginScreen({ employees, onLogin }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const match = employees.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!match) { setError("No account found with that email."); return; }
    if (!password) { setError("Enter your password."); return; }
    setError("");
    onLogin(match);
  };

  return (
    <div style={{ display: "flex", minHeight: 600, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ flex: 1, background: "#0F2747", color: "#fff", padding: 48, display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 300 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Store size={22} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.5 }}>POS SYSTEM</span>
        </div>
        <h1 style={{ fontSize: 32, lineHeight: 1.25, fontWeight: 700, margin: "0 0 14px" }}>Secure Business Management</h1>
        <p style={{ color: "#93A5C4", fontSize: 15, lineHeight: 1.6, maxWidth: 380 }}>
          Run sales, inventory, customers and reporting for your shop from one dashboard — built for Kenyan businesses with KES and M-Pesa support.
        </p>
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
          {["Real-time sales dashboard", "Fast POS checkout with M-Pesa", "Inventory & low-stock alerts"].map((t) => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "#C7D4EA" }}>
              <div style={{ width: 20, height: 20, borderRadius: 999, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={12} />
              </div>
              {t}
            </div>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 32, minWidth: 320 }}>
        <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 340 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", margin: "0 0 4px" }}>Welcome back</h2>
          <p style={{ color: "#64748B", fontSize: 13.5, margin: "0 0 24px" }}>Sign in to your POS dashboard</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input label="Email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Input label="Password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          {error && <div style={{ marginTop: 10, fontSize: 13, color: "#DC2626" }}>{error}</div>}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "16px 0" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#475569" }}>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 13, color: "#2563EB", textDecoration: "none" }}>Forgot password?</a>
          </div>

          <Btn type="submit" style={{ width: "100%" }} size="lg">Log in</Btn>

          <div style={{ marginTop: 18, padding: 12, background: "#F8FAFC", borderRadius: 10, fontSize: 12.5, color: "#64748B" }}>
            Demo accounts: <strong>admin@example.com</strong>, <strong>alice@example.com</strong>, <strong>kevin@example.com</strong> — any password.
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   SIDEBAR + TOPBAR
--------------------------------------------------------------------- */

function Sidebar({ page, setPage, open, branch, setBranch, user, onLogout }) {
  const [branchMenu, setBranchMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  return (
    <div style={{ width: open ? 240 : 0, transition: "width .2s", background: "#0F2747", color: "#fff", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
      <div style={{ padding: "20px 18px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Store size={18} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.3, whiteSpace: "nowrap" }}>POS SYSTEM</span>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 12px" }}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", marginBottom: 2,
                borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
                background: active ? "#2563EB" : "transparent", color: active ? "#fff" : "#AEC0DC",
                fontSize: 13.5, fontWeight: active ? 600 : 500, whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ position: "relative" }}>
          <button onClick={() => setBranchMenu((v) => !v)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "#fff", marginBottom: 8 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🏪</div>
            <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{branch.name}</div>
              <div style={{ fontSize: 11, color: "#93A5C4" }}>{branch.location}</div>
            </div>
            <ChevronDown size={14} />
          </button>
          {branchMenu && (
            <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: 4, background: "#132E52", borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
              {BRANCHES.map((b) => (
                <button key={b.id} onClick={() => { setBranch(b); setBranchMenu(false); }} style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "none", color: "#fff", textAlign: "left", cursor: "pointer", fontSize: 12.5 }}>
                  {b.name} — {b.location}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ position: "relative" }}>
          <button onClick={() => setUserMenu((v) => !v)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: 6, borderRadius: 10, background: "transparent", border: "none", cursor: "pointer", color: "#fff" }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12.5, flexShrink: 0 }}>
              {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div style={{ textAlign: "left", flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
              <div style={{ fontSize: 11, color: "#93A5C4" }}>{user.role}</div>
            </div>
          </button>
          {userMenu && (
            <div style={{ position: "absolute", bottom: "100%", left: 0, right: 0, marginBottom: 4, background: "#132E52", borderRadius: 10, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}>
              <button onClick={onLogout} style={{ width: "100%", padding: "10px 12px", background: "transparent", border: "none", color: "#F87171", textAlign: "left", cursor: "pointer", fontSize: 12.5, display: "flex", alignItems: "center", gap: 8 }}>
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Topbar({ page, sidebarOpen, setSidebarOpen, products, orders, customers, settings, setPage }) {
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const title = NAV_ITEMS.find((n) => n.id === page)?.label || "Dashboard";

  const results = useMemo(() => {
    if (!query.trim()) return { products: [], orders: [], customers: [] };
    const q = query.toLowerCase();
    return {
      products: products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)).slice(0, 4),
      orders: orders.filter((o) => o.receiptNumber?.toLowerCase().includes(q)).slice(0, 4),
      customers: customers.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 4),
    };
  }, [query, products, orders, customers]);

  const lowStock = products.filter((p) => p.stock <= p.minStock);

  return (
    <div style={{ height: 60, borderBottom: "1px solid #E2E8F0", background: "#fff", display: "flex", alignItems: "center", padding: "0 20px", gap: 16, flexShrink: 0 }}>
      <button onClick={() => setSidebarOpen((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", display: "flex" }}>
        <Menu size={20} />
      </button>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", margin: 0, whiteSpace: "nowrap" }}>{title}</h2>

      <div style={{ flex: 1, position: "relative", maxWidth: 380 }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: 10, color: "#94A3B8" }} />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowResults(true); }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 150)}
          placeholder="Search products, orders, customers…"
          style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: 9, border: "1px solid #E2E8F0", fontSize: 13.5, outline: "none", background: "#F8FAFC" }}
        />
        {showResults && query.trim() && (
          <div style={{ position: "absolute", top: "110%", left: 0, right: 0, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.1)", zIndex: 50, maxHeight: 320, overflow: "auto" }}>
            {results.products.length === 0 && results.orders.length === 0 && results.customers.length === 0 && (
              <div style={{ padding: 16, fontSize: 13, color: "#64748B" }}>No results found.</div>
            )}
            {results.products.length > 0 && (
              <div>
                <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Products</div>
                {results.products.map((p) => (
                  <div key={p.id} style={{ padding: "8px 12px", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                    <span>{p.name}</span><span style={{ color: "#64748B" }}>{money(p.price)}</span>
                  </div>
                ))}
              </div>
            )}
            {results.customers.length > 0 && (
              <div>
                <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Customers</div>
                {results.customers.map((c) => (
                  <div key={c.id} style={{ padding: "8px 12px", fontSize: 13 }}>{c.name}</div>
                ))}
              </div>
            )}
            {results.orders.length > 0 && (
              <div>
                <div style={{ padding: "8px 12px", fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase" }}>Orders</div>
                {results.orders.map((o) => (
                  <div key={o.id} style={{ padding: "8px 12px", fontSize: 13, display: "flex", justifyContent: "space-between" }}>
                    <span>{o.receiptNumber}</span><span style={{ color: "#64748B" }}>{money(o.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ position: "relative" }}>
        <button onClick={() => setShowNotif((v) => !v)} style={{ background: "none", border: "none", cursor: "pointer", color: "#64748B", position: "relative", display: "flex" }}>
          <Bell size={19} />
          {lowStock.length > 0 && (
            <span style={{ position: "absolute", top: -4, right: -4, background: "#DC2626", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, minWidth: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {lowStock.length}
            </span>
          )}
        </button>
        {showNotif && (
          <div style={{ position: "absolute", top: "130%", right: 0, width: 300, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.12)", zIndex: 50, overflow: "hidden" }}>
            <div style={{ padding: 12, fontWeight: 700, fontSize: 13, borderBottom: "1px solid #F1F5F9" }}>Notifications</div>
            <div style={{ maxHeight: 260, overflow: "auto" }}>
              {lowStock.length === 0 && <div style={{ padding: 16, fontSize: 13, color: "#64748B" }}>You're all caught up.</div>}
              {lowStock.map((p) => (
                <div key={p.id} style={{ padding: 12, borderBottom: "1px solid #F8FAFC", fontSize: 12.5 }}>
                  <div style={{ fontWeight: 700, color: "#92400E", display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={13} /> Low stock</div>
                  <div style={{ color: "#475569", marginTop: 2 }}>{p.name} has only {p.stock} units remaining.</div>
                </div>
              ))}
            </div>
            <button onClick={() => { setPage("inventory"); setShowNotif(false); }} style={{ width: "100%", padding: 10, background: "#F8FAFC", border: "none", fontSize: 12.5, fontWeight: 600, color: "#2563EB", cursor: "pointer" }}>
              View inventory
            </button>
          </div>
        )}
      </div>

      <div style={{ fontSize: 12.5, color: "#64748B", whiteSpace: "nowrap" }}>{new Date().toLocaleDateString("en-KE", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}</div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   KPI helpers
--------------------------------------------------------------------- */

function KpiCard({ label, value, delta, icon: Icon, tone }) {
  const positive = delta >= 0;
  const tones = { blue: "#2563EB", green: "#16A34A", amber: "#F59E0B", purple: "#7C3AED" };
  return (
    <Card style={{ padding: 18, flex: 1, minWidth: 180 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: "#64748B", fontWeight: 600 }}>{label}</span>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${tones[tone]}1A`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={17} color={tones[tone]} />
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>{value}</div>
      {delta !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6, fontSize: 12.5, fontWeight: 600, color: positive ? "#16A34A" : "#DC2626" }}>
          {positive ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
          {Math.abs(delta).toFixed(1)}% from last period
        </div>
      )}
    </Card>
  );
}

/* ---------------------------------------------------------------------
   DASHBOARD
--------------------------------------------------------------------- */

function Dashboard({ orders, products, customers, expenses, settings }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const completedOrders = orders.filter((o) => o.status === "Completed");
  const todayOrders = completedOrders.filter((o) => o.createdAt >= today.getTime());
  const totalSalesToday = todayOrders.reduce((s, o) => s + o.total, 0);
  const totalSalesAll = completedOrders.reduce((s, o) => s + o.total, 0);

  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const dayOrders = completedOrders.filter((o) => o.createdAt >= d.getTime() && o.createdAt < next.getTime());
      days.push({ day: dayName(d.getTime()), revenue: dayOrders.reduce((s, o) => s + o.total, 0), orders: dayOrders.length });
    }
    return days;
  }, [completedOrders]);

  const topProducts = useMemo(() => {
    const map = {};
    completedOrders.forEach((o) => o.items.forEach((it) => {
      if (!map[it.productId]) map[it.productId] = { name: it.name, sku: it.sku, sold: 0, revenue: 0 };
      map[it.productId].sold += it.qty;
      map[it.productId].revenue += it.qty * it.price;
    }));
    return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [completedOrders]);

  const paymentBreakdown = useMemo(() => {
    const map = {};
    completedOrders.forEach((o) => { map[o.paymentMethod] = (map[o.paymentMethod] || 0) + o.total; });
    const colors = { cash: "#16A34A", mpesa: "#2563EB", card: "#F59E0B", bank: "#7C3AED", other: "#94A3B8" };
    return Object.entries(map).map(([k, v]) => ({ name: k === "mpesa" ? "M-Pesa" : k[0].toUpperCase() + k.slice(1), value: v, color: colors[k] || "#94A3B8" }));
  }, [completedOrders]);

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const cogs = completedOrders.reduce((s, o) => s + o.items.reduce((s2, it) => {
    const p = products.find((pp) => pp.id === it.productId);
    return s2 + (p ? p.cost * it.qty : 0);
  }, 0), 0);
  const netProfit = totalSalesAll - cogs - totalExpenses;

  return (
    <div>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <KpiCard label="Total Sales Today" value={money(totalSalesToday)} delta={12.5} icon={Wallet} tone="blue" />
        <KpiCard label="Total Orders" value={todayOrders.length} delta={8.3} icon={ClipboardList} tone="green" />
        <KpiCard label="Total Products" value={products.length} delta={5.2} icon={Package} tone="amber" />
        <KpiCard label="Total Customers" value={customers.length} delta={10.1} icon={Users} tone="purple" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Sales overview</h3>
            <span style={{ fontSize: 12, color: "#64748B" }}>Last 7 days</span>
          </div>
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={last7}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563EB" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#2563EB" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={70} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => money(v)} contentStyle={{ borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13 }} />
              <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Payment methods</h3>
          {paymentBreakdown.length === 0 ? (
            <div style={{ color: "#94A3B8", fontSize: 13, padding: "40px 0", textAlign: "center" }}>No payments recorded yet.</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie data={paymentBreakdown} dataKey="value" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {paymentBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => money(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                {paymentBreakdown.map((p) => (
                  <div key={p.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 999, background: p.color }} />{p.name}</span>
                    <span style={{ fontWeight: 600 }}>{money(p.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16 }}>
        <Card style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Top selling products</h3>
          {topProducts.length === 0 ? (
            <EmptyState icon={Package} title="No sales yet" message="Top products will appear once you make sales." />
          ) : (
            <table>
              <thead><tr><th>Product</th><th>SKU</th><th>Units sold</th><th>Revenue</th></tr></thead>
              <tbody>
                {topProducts.map((p) => (
                  <tr key={p.sku}><td>{p.name}</td><td style={{ color: "#64748B" }}>{p.sku}</td><td>{p.sold}</td><td style={{ fontWeight: 600 }}>{money(p.revenue)}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Profitability</h3>
          {[
            ["Revenue", totalSalesAll, "#0F172A"],
            ["COGS", -cogs, "#DC2626"],
            ["Expenses", -totalExpenses, "#DC2626"],
          ].map(([label, val, color]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span style={{ color: "#64748B" }}>{label}</span>
              <span style={{ fontWeight: 600, color }}>{val < 0 ? `-${money(Math.abs(val))}` : money(val)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", marginTop: 4 }}>
            <span style={{ fontWeight: 700 }}>Net Profit</span>
            <span style={{ fontWeight: 800, color: netProfit >= 0 ? "#16A34A" : "#DC2626" }}>{money(netProfit)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   POS / NEW SALE
--------------------------------------------------------------------- */

function POS({ products, setProducts, customers, setCustomers, orders, setOrders, user, branch, settings, push }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]); // {productId, name, sku, price, qty, discount}
  const [customerId, setCustomerId] = useState("c0");
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);
  const [orderDiscount, setOrderDiscount] = useState(0);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.toLowerCase().includes(q);
    const matchesCat = category === "All" || p.category === category;
    return matchesQ && matchesCat;
  });

  const addToCart = (p) => {
    if (p.stock <= 0) { push("warning", `${p.name} is out of stock`); return; }
    setCart((c) => {
      const existing = c.find((i) => i.productId === p.id);
      if (existing) {
        if (existing.qty >= p.stock) { push("warning", "Not enough stock"); return c; }
        return c.map((i) => i.productId === p.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...c, { productId: p.id, name: p.name, sku: p.sku, price: p.price, qty: 1, discount: 0, stock: p.stock, image: p.image }];
    });
  };

  const changeQty = (id, delta) => {
    setCart((c) => c.map((i) => {
      if (i.productId !== id) return i;
      const newQty = i.qty + delta;
      if (newQty < 1) return i;
      if (newQty > i.stock) { push("warning", "Not enough stock"); return i; }
      return { ...i, qty: newQty };
    }));
  };

  const removeItem = (id) => setCart((c) => c.filter((i) => i.productId !== id));
  const clearCart = () => { setCart([]); setOrderDiscount(0); };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const discountTotal = Number(orderDiscount) || 0;
  const taxable = Math.max(subtotal - discountTotal, 0);
  const tax = taxable * (settings.taxRate / 100);
  const grandTotal = taxable + tax;

  const completeSale = (payment) => {
    const order = {
      id: genId("ord"),
      receiptNumber: genReceiptNumber(),
      orderNumber: `ORD-${1000 + orders.length + 1}`,
      customerId,
      customerName: customers.find((c) => c.id === customerId)?.name || "Walk-in Customer",
      cashier: user.name,
      branch: branch.location,
      items: cart.map((i) => ({ productId: i.productId, name: i.name, sku: i.sku, price: i.price, qty: i.qty })),
      subtotal, discount: discountTotal, tax, total: grandTotal,
      paymentMethod: payment.method,
      paymentRef: payment.ref || "",
      amountPaid: payment.amountPaid,
      change: payment.change || 0,
      status: "Completed",
      createdAt: Date.now(),
    };

    setProducts((prev) => prev.map((p) => {
      const item = cart.find((i) => i.productId === p.id);
      return item ? { ...p, stock: p.stock - item.qty } : p;
    }));
    setOrders((prev) => [order, ...prev]);
    setCheckoutOpen(false);
    setSuccessOrder(order);
    setCart([]);
    setOrderDiscount(0);
    push("success", "Payment successful — receipt generated");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 16, height: "100%" }}>
      {/* LEFT: product browser */}
      <div>
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <Search size={15} style={{ position: "absolute", left: 12, top: 11, color: "#94A3B8" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, SKU or barcode…" style={{ width: "100%", padding: "10px 12px 10px 34px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13.5, outline: "none" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          {["All", ...CATEGORIES].map((c) => (
            <button key={c} onClick={() => setCategory(c)} style={{ padding: "6px 14px", borderRadius: 999, border: "1px solid " + (category === c ? "#2563EB" : "#E2E8F0"), background: category === c ? "#2563EB" : "#fff", color: category === c ? "#fff" : "#475569", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, maxHeight: 520, overflow: "auto", paddingRight: 4 }}>
          {filtered.map((p) => (
            <Card key={p.id} onClick={() => addToCart(p)} style={{ padding: 12, cursor: "pointer", opacity: p.stock <= 0 ? 0.5 : 1 }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#2563EB"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "#E2E8F0"}>
              <div style={{ fontSize: 30, textAlign: "center", padding: "8px 0", background: "#F8FAFC", borderRadius: 10, marginBottom: 8 }}>{p.image}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", marginBottom: 2, lineHeight: 1.3 }}>{p.name}</div>
              <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 6 }}>{p.sku}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, fontSize: 13.5, color: "#2563EB" }}>{money(p.price)}</span>
                <span style={{ fontSize: 11, color: p.stock <= p.minStock ? "#DC2626" : "#94A3B8" }}>{p.stock} left</span>
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#94A3B8" }}>No products match your search.</div>}
        </div>
      </div>

      {/* RIGHT: cart */}
      <Card style={{ padding: 16, display: "flex", flexDirection: "column", height: "fit-content", position: "sticky", top: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>Cart ({cart.length})</h3>
          {cart.length > 0 && <button onClick={clearCart} style={{ background: "none", border: "none", color: "#DC2626", fontSize: 12.5, cursor: "pointer", fontWeight: 600 }}>Clear cart</button>}
        </div>

        <Select label="Customer" value={customerId} onChange={(e) => setCustomerId(e.target.value)} style={{ marginBottom: 12 }}>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>

        <div style={{ maxHeight: 260, overflow: "auto", marginBottom: 12 }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px 0", color: "#94A3B8", fontSize: 13 }}>Cart is empty. Tap a product to add it.</div>
          ) : (
            cart.map((i) => (
              <div key={i.productId} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ fontSize: 20 }}>{i.image}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{i.name}</div>
                  <div style={{ fontSize: 11.5, color: "#64748B" }}>{money(i.price)} × {i.qty} = {money(i.price * i.qty)}</div>
                </div>
                <button onClick={() => changeQty(i.productId, -1)} style={{ width: 22, height: 22, borderRadius: 6, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={12} /></button>
                <span style={{ fontSize: 12.5, fontWeight: 700, minWidth: 16, textAlign: "center" }}>{i.qty}</span>
                <button onClick={() => changeQty(i.productId, 1)} style={{ width: 22, height: 22, borderRadius: 6, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Plus size={12} /></button>
                <button onClick={() => removeItem(i.productId)} style={{ background: "none", border: "none", cursor: "pointer", color: "#DC2626", display: "flex" }}><Trash2 size={14} /></button>
              </div>
            ))
          )}
        </div>

        <div style={{ marginBottom: 10 }}>
          <Input label="Order discount (KES)" type="number" min={0} value={orderDiscount} onChange={(e) => setOrderDiscount(Math.max(0, Number(e.target.value)))} />
        </div>

        <div style={{ borderTop: "1px solid #E2E8F0", paddingTop: 10, display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748B" }}>Subtotal</span><span>{money(subtotal)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748B" }}>Discount</span><span>-{money(discountTotal)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ color: "#64748B" }}>VAT ({settings.taxRate}%)</span><span>{money(tax)}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, fontSize: 16, marginTop: 4 }}><span>Total</span><span>{money(grandTotal)}</span></div>
        </div>

        <Btn size="lg" style={{ marginTop: 14 }} disabled={cart.length === 0} onClick={() => setCheckoutOpen(true)}>
          Checkout <span style={{ opacity: 0.8, fontWeight: 500 }}>(F4)</span>
        </Btn>
      </Card>

      {checkoutOpen && (
        <CheckoutModal
          total={grandTotal}
          onClose={() => setCheckoutOpen(false)}
          onComplete={completeSale}
        />
      )}

      {successOrder && (
        <ReceiptSuccessModal order={successOrder} settings={settings} onClose={() => setSuccessOrder(null)} />
      )}
    </div>
  );
}

function CheckoutModal({ total, onClose, onComplete }) {
  const [method, setMethod] = useState("cash");
  const [received, setReceived] = useState("");
  const [phone, setPhone] = useState("");
  const [processing, setProcessing] = useState(false);

  const receivedNum = Number(received) || 0;
  const change = method === "cash" ? Math.max(receivedNum - total, 0) : 0;
  const canPay = method === "cash" ? receivedNum >= total : method === "mpesa" ? phone.trim().length >= 9 : true;

  const handlePay = () => {
    if (!canPay) return;
    setProcessing(true);
    setTimeout(() => {
      onComplete({
        method,
        amountPaid: method === "cash" ? receivedNum : total,
        change,
        ref: method === "mpesa" ? "QK" + Math.random().toString(36).slice(2, 10).toUpperCase() : method === "card" ? "CARD-" + Math.floor(Math.random() * 900000 + 100000) : "",
      });
      setProcessing(false);
    }, 700);
  };

  return (
    <Modal title="Checkout" onClose={onClose} width={420}>
      <div style={{ textAlign: "center", padding: "10px 0 18px" }}>
        <div style={{ fontSize: 13, color: "#64748B" }}>Amount due</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: "#0F172A" }}>{money(total)}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        {PAYMENT_METHODS.map((m) => {
          const Icon = m.icon;
          const active = method === m.id;
          return (
            <button key={m.id} onClick={() => setMethod(m.id)} style={{ padding: "12px 10px", borderRadius: 10, border: "1px solid " + (active ? "#2563EB" : "#E2E8F0"), background: active ? "#EFF6FF" : "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <Icon size={18} color={active ? "#2563EB" : "#64748B"} />
              <span style={{ fontSize: 12.5, fontWeight: 600, color: active ? "#2563EB" : "#475569" }}>{m.label}</span>
            </button>
          );
        })}
      </div>

      {method === "cash" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Input label="Amount received" type="number" placeholder="0.00" value={received} onChange={(e) => setReceived(e.target.value)} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "8px 12px", background: "#F8FAFC", borderRadius: 8 }}>
            <span style={{ color: "#64748B" }}>Change</span><span style={{ fontWeight: 700 }}>{money(change)}</span>
          </div>
        </div>
      )}
      {method === "mpesa" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Input label="M-Pesa phone number" placeholder="0712 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <div style={{ fontSize: 12.5, color: "#64748B", background: "#F8FAFC", padding: "8px 12px", borderRadius: 8 }}>
            An STK push prompt would be sent to this number. This demo simulates a successful payment.
          </div>
        </div>
      )}
      {(method === "card" || method === "bank") && (
        <div style={{ fontSize: 12.5, color: "#64748B", background: "#F8FAFC", padding: "10px 12px", borderRadius: 8 }}>
          Confirm the {method === "card" ? "card" : "bank transfer"} payment of {money(total)} has been received.
        </div>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
        <Btn variant="secondary" style={{ flex: 1 }} onClick={onClose}>Cancel</Btn>
        <Btn style={{ flex: 1 }} disabled={!canPay || processing} onClick={handlePay}>
          {processing ? <Loader2 size={16} className="spin" /> : "Confirm payment"}
        </Btn>
      </div>
    </Modal>
  );
}

function ReceiptSuccessModal({ order, settings, onClose }) {
  return (
    <Modal title="" onClose={onClose} width={400}>
      <div style={{ textAlign: "center", marginBottom: 12 }}>
        <div style={{ width: 56, height: 56, borderRadius: 999, background: "#DCFCE7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px" }}>
          <Check size={28} color="#16A34A" />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700 }}>Payment successful</div>
        <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{money(order.total)}</div>
      </div>
      <ReceiptView order={order} settings={settings} compact />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 16 }}>
        <Btn variant="secondary" onClick={() => window.print()}><Printer size={15} /> Print</Btn>
        <Btn variant="secondary" onClick={() => alert("PDF generation would download the receipt as a PDF.")}><Download size={15} /> Download PDF</Btn>
        <Btn variant="secondary" onClick={() => alert("Receipt would be emailed to the customer.")}><Mail size={15} /> Email</Btn>
        <Btn onClick={onClose}>New sale</Btn>
      </div>
    </Modal>
  );
}

function ReceiptView({ order, settings, compact }) {
  return (
    <div id="print-area" style={{ background: "#F8FAFC", border: "1px dashed #E2E8F0", borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 12.5 }}>
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 14 }}>{settings.businessName.toUpperCase()}</div>
        <div style={{ color: "#64748B" }}>{settings.address}</div>
        <div style={{ color: "#64748B" }}>{settings.phone}</div>
      </div>
      <div style={{ borderTop: "1px dashed #CBD5E1", borderBottom: "1px dashed #CBD5E1", padding: "6px 0", margin: "8px 0" }}>
        <div>Receipt: {order.receiptNumber}</div>
        <div>Order: {order.orderNumber}</div>
        <div>Date: {shortDate(order.createdAt)} {timeStr(order.createdAt)}</div>
        <div>Cashier: {order.cashier}</div>
        <div>Customer: {order.customerName}</div>
      </div>
      {!compact && (
        <div style={{ marginBottom: 8 }}>
          {order.items.map((it) => (
            <div key={it.productId} style={{ marginBottom: 4 }}>
              <div>{it.name}</div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>{it.qty} × {it.price.toFixed(2)}</span><span>{(it.qty * it.price).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div style={{ borderTop: "1px dashed #CBD5E1", paddingTop: 6 }}>
        <Row a="Subtotal" b={order.subtotal} />
        {order.discount > 0 && <Row a="Discount" b={-order.discount} />}
        <Row a="VAT" b={order.tax} />
        <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, marginTop: 4 }}><span>TOTAL</span><span>{order.total.toFixed(2)}</span></div>
      </div>
      <div style={{ borderTop: "1px dashed #CBD5E1", marginTop: 8, paddingTop: 6 }}>
        <div>Payment: {order.paymentMethod === "mpesa" ? "M-Pesa" : order.paymentMethod[0].toUpperCase() + order.paymentMethod.slice(1)}</div>
        {order.paymentRef && <div>Ref: {order.paymentRef}</div>}
        {order.paymentMethod === "cash" && <><div>Received: {order.amountPaid.toFixed(2)}</div><div>Change: {order.change.toFixed(2)}</div></>}
      </div>
      <div style={{ textAlign: "center", marginTop: 10, color: "#64748B" }}>Thank you for shopping with us!</div>
    </div>
  );
}

function Row({ a, b }) {
  return <div style={{ display: "flex", justifyContent: "space-between" }}><span>{a}</span><span>{b < 0 ? "-" : ""}{Math.abs(b).toFixed(2)}</span></div>;
}

/* ---------------------------------------------------------------------
   PRODUCTS
--------------------------------------------------------------------- */

function ProductsPage({ products, setProducts, push }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // {mode:'add'|'edit', product}
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase()));

  const save = (data) => {
    if (modal.mode === "add") {
      setProducts((p) => [{ ...data, id: genId("p") }, ...p]);
      push("success", "Product added successfully");
    } else {
      setProducts((p) => p.map((x) => x.id === data.id ? data : x));
      push("success", "Product updated");
    }
    setModal(null);
  };

  const remove = () => {
    setProducts((p) => p.filter((x) => x.id !== deleteTarget.id));
    push("success", "Product deleted");
    setDeleteTarget(null);
  };

  return (
    <div>
      <TableToolbar search={search} setSearch={setSearch} placeholder="Search products…" onAdd={() => setModal({ mode: "add" })} addLabel="Add product" />
      <Card style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <EmptyState icon={Package} title="No products yet" message="Add your first product to start managing inventory." actionLabel="Add product" onAction={() => setModal({ mode: "add" })} />
        ) : (
          <table>
            <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Cost</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 18 }}>{p.image}</span>{p.name}</td>
                  <td style={{ color: "#64748B" }}>{p.sku}</td>
                  <td>{p.category}</td>
                  <td>{money(p.cost)}</td>
                  <td style={{ fontWeight: 600 }}>{money(p.price)}</td>
                  <td>{p.stock}</td>
                  <td><StatusBadge status={p.stock <= 0 ? "Out of Stock" : p.stock <= p.minStock ? "Low Stock" : "In Stock"} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <IconBtn onClick={() => setModal({ mode: "edit", product: p })}><Edit2 size={13} /></IconBtn>
                      <IconBtn danger onClick={() => setDeleteTarget(p)}><Trash2 size={13} /></IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {modal && <ProductModal mode={modal.mode} product={modal.product} onClose={() => setModal(null)} onSave={save} />}
      {deleteTarget && <ConfirmDialog title="Delete product?" message={`"${deleteTarget.name}" will be permanently removed. This action cannot be undone.`} onConfirm={remove} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}

function IconBtn({ children, danger, ...props }) {
  return (
    <button {...props} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: danger ? "#DC2626" : "#475569" }}>
      {children}
    </button>
  );
}

function TableToolbar({ search, setSearch, placeholder, onAdd, addLabel, extra }) {
  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap", alignItems: "center" }}>
      <div style={{ flex: 1, minWidth: 220, position: "relative" }}>
        <Search size={15} style={{ position: "absolute", left: 12, top: 11, color: "#94A3B8" }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={placeholder} style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 10, border: "1px solid #E2E8F0", fontSize: 13.5, outline: "none" }} />
      </div>
      {extra}
      {onAdd && <Btn onClick={onAdd}><Plus size={15} /> {addLabel}</Btn>}
    </div>
  );
}

function ProductModal({ mode, product, onClose, onSave }) {
  const [form, setForm] = useState(product || { name: "", sku: "", barcode: "", category: CATEGORIES[0], cost: "", price: "", stock: "", minStock: "", unit: "pcs", image: "📦" });
  const [error, setError] = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) return setError("Product name is required.");
    if (!form.sku.trim()) return setError("SKU is required.");
    if (Number(form.price) < 0 || Number(form.cost) < 0) return setError("Prices cannot be negative.");
    if (Number(form.stock) < 0) return setError("Stock cannot be negative.");
    setError("");
    onSave({ ...form, cost: Number(form.cost) || 0, price: Number(form.price) || 0, stock: Number(form.stock) || 0, minStock: Number(form.minStock) || 0 });
  };

  return (
    <Modal title={mode === "add" ? "Add product" : "Edit product"} onClose={onClose} width={480}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ gridColumn: "1/-1" }}><Input label="Product name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Coca Cola 330ml" /></div>
        <Input label="SKU" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="SKU-1001" />
        <Input label="Barcode" value={form.barcode} onChange={(e) => set("barcode", e.target.value)} placeholder="Optional" />
        <Select label="Category" value={form.category} onChange={(e) => set("category", e.target.value)}>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Input label="Unit" value={form.unit} onChange={(e) => set("unit", e.target.value)} placeholder="pcs" />
        <Input label="Cost price (KES)" type="number" value={form.cost} onChange={(e) => set("cost", e.target.value)} />
        <Input label="Selling price (KES)" type="number" value={form.price} onChange={(e) => set("price", e.target.value)} />
        <Input label="Stock quantity" type="number" value={form.stock} onChange={(e) => set("stock", e.target.value)} />
        <Input label="Minimum stock" type="number" value={form.minStock} onChange={(e) => set("minStock", e.target.value)} />
      </div>
      {error && <div style={{ color: "#DC2626", fontSize: 13, marginTop: 10 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit}>{mode === "add" ? "Add product" : "Save changes"}</Btn>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   INVENTORY
--------------------------------------------------------------------- */

function InventoryPage({ products, setProducts, push }) {
  const [restock, setRestock] = useState(null);
  const lowStock = products.filter((p) => p.stock <= p.minStock);
  const outOfStock = products.filter((p) => p.stock <= 0);
  const stockValue = products.reduce((s, p) => s + p.cost * p.stock, 0);

  const doRestock = (qty) => {
    setProducts((prev) => prev.map((p) => p.id === restock.id ? { ...p, stock: p.stock + qty } : p));
    push("success", `${restock.name} restocked with ${qty} units`);
    setRestock(null);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <KpiCard label="Total Stock Value" value={money(stockValue)} icon={Boxes} tone="blue" />
        <KpiCard label="Low Stock Items" value={lowStock.length} icon={AlertTriangle} tone="amber" />
        <KpiCard label="Out of Stock" value={outOfStock.length} icon={AlertTriangle} tone="purple" />
      </div>

      <Card style={{ padding: 18, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Low stock alerts</h3>
        {lowStock.length === 0 ? (
          <div style={{ color: "#64748B", fontSize: 13.5, padding: "16px 0" }}>All products are sufficiently stocked.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {lowStock.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#FFFBEB", borderRadius: 10, border: "1px solid #FDE68A" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#92400E" }}>Current stock: {p.stock} · Minimum: {p.minStock}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <StatusBadge status={p.stock <= 0 ? "Out of Stock" : "Low Stock"} />
                  <Btn size="sm" onClick={() => setRestock(p)}>Restock</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card style={{ overflow: "hidden" }}>
        <table>
          <thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Min stock</th><th>Stock value</th><th>Status</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td><td style={{ color: "#64748B" }}>{p.sku}</td><td>{p.stock}</td><td>{p.minStock}</td><td>{money(p.cost * p.stock)}</td>
                <td><StatusBadge status={p.stock <= 0 ? "Out of Stock" : p.stock <= p.minStock ? "Low Stock" : "In Stock"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {restock && <RestockModal product={restock} onClose={() => setRestock(null)} onSave={doRestock} />}
    </div>
  );
}

function RestockModal({ product, onClose, onSave }) {
  const [qty, setQty] = useState(20);
  return (
    <Modal title={`Restock ${product.name}`} onClose={onClose} width={360}>
      <Input label="Quantity to add" type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value)))} />
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={() => onSave(qty)}>Confirm restock</Btn>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   CUSTOMERS
--------------------------------------------------------------------- */

function CustomersPage({ customers, setCustomers, orders, push }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewing, setViewing] = useState(null);

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const spend = (id) => orders.filter((o) => o.customerId === id && o.status === "Completed").reduce((s, o) => s + o.total, 0);

  const save = (data) => {
    if (modal.mode === "add") { setCustomers((c) => [{ ...data, id: genId("c"), createdAt: Date.now() }, ...c]); push("success", "Customer added successfully"); }
    else { setCustomers((c) => c.map((x) => x.id === data.id ? data : x)); push("success", "Customer updated"); }
    setModal(null);
  };
  const remove = () => { setCustomers((c) => c.filter((x) => x.id !== deleteTarget.id)); push("success", "Customer deleted"); setDeleteTarget(null); };

  return (
    <div>
      <TableToolbar search={search} setSearch={setSearch} placeholder="Search customers…" onAdd={() => setModal({ mode: "add" })} addLabel="Add customer" />
      <Card style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <EmptyState icon={Users} title="No customers yet" message="Add your first customer to start tracking purchases." actionLabel="Add customer" onAction={() => setModal({ mode: "add" })} />
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Phone</th><th>Type</th><th>Total spend</th><th></th></tr></thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td style={{ cursor: "pointer", fontWeight: 600 }} onClick={() => setViewing(c)}>{c.name}</td>
                  <td style={{ color: "#64748B" }}>{c.phone || "—"}</td>
                  <td><Badge>{c.type}</Badge></td>
                  <td style={{ fontWeight: 600 }}>{money(spend(c.id))}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <IconBtn onClick={() => setViewing(c)}><Eye size={13} /></IconBtn>
                      {c.id !== "c0" && <>
                        <IconBtn onClick={() => setModal({ mode: "edit", customer: c })}><Edit2 size={13} /></IconBtn>
                        <IconBtn danger onClick={() => setDeleteTarget(c)}><Trash2 size={13} /></IconBtn>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {modal && <CustomerModal mode={modal.mode} customer={modal.customer} onClose={() => setModal(null)} onSave={save} />}
      {deleteTarget && <ConfirmDialog title="Delete customer?" message={`"${deleteTarget.name}" will be permanently removed.`} onConfirm={remove} onCancel={() => setDeleteTarget(null)} />}
      {viewing && (
        <Modal title="Customer profile" onClose={() => setViewing(null)} width={440}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 999, background: "#EFF6FF", color: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
              {viewing.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </div>
            <div><div style={{ fontWeight: 700 }}>{viewing.name}</div><div style={{ fontSize: 12.5, color: "#64748B" }}>{viewing.phone || "No phone"} · {viewing.email || "No email"}</div></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Card style={{ padding: 12 }}><div style={{ fontSize: 12, color: "#64748B" }}>Total spend</div><div style={{ fontWeight: 700, fontSize: 16 }}>{money(spend(viewing.id))}</div></Card>
            <Card style={{ padding: 12 }}><div style={{ fontSize: 12, color: "#64748B" }}>Orders</div><div style={{ fontWeight: 700, fontSize: 16 }}>{orders.filter((o) => o.customerId === viewing.id).length}</div></Card>
          </div>
          <h4 style={{ fontSize: 13, marginTop: 16 }}>Recent orders</h4>
          {orders.filter((o) => o.customerId === viewing.id).slice(0, 5).map((o) => (
            <div key={o.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "6px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span>{o.receiptNumber}</span><span>{money(o.total)}</span>
            </div>
          ))}
          {orders.filter((o) => o.customerId === viewing.id).length === 0 && <div style={{ fontSize: 12.5, color: "#94A3B8" }}>No orders yet.</div>}
        </Modal>
      )}
    </div>
  );
}

function CustomerModal({ mode, customer, onClose, onSave }) {
  const [form, setForm] = useState(customer || { name: "", phone: "", email: "", type: "Regular" });
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = () => {
    if (!form.name.trim()) return setError("Customer name is required.");
    if (form.phone && !/^[0-9+\s-]{7,15}$/.test(form.phone)) return setError("Enter a valid phone number.");
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email address.");
    setError("");
    onSave(form);
  };

  return (
    <Modal title={mode === "add" ? "Add customer" : "Edit customer"} onClose={onClose} width={420}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input label="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <Input label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0712 345 678" />
        <Input label="Email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@example.com" />
        <Select label="Customer type" value={form.type} onChange={(e) => set("type", e.target.value)}>
          {["Regular", "Wholesale", "VIP"].map((t) => <option key={t}>{t}</option>)}
        </Select>
      </div>
      {error && <div style={{ color: "#DC2626", fontSize: 13, marginTop: 10 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit}>{mode === "add" ? "Add customer" : "Save changes"}</Btn>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   ORDERS
--------------------------------------------------------------------- */

function OrdersPage({ orders, setOrders, products, setProducts, push }) {
  const [tab, setTab] = useState("All");
  const [viewing, setViewing] = useState(null);
  const [refunding, setRefunding] = useState(null);

  const tabs = ["All", "Completed", "Pending", "Cancelled", "Refunded"];
  const filtered = tab === "All" ? orders : orders.filter((o) => o.status === tab);

  const doRefund = (order, reason) => {
    setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: "Refunded", refundReason: reason } : o));
    setProducts((prev) => prev.map((p) => {
      const item = order.items.find((i) => i.productId === p.id);
      return item ? { ...p, stock: p.stock + item.qty } : p;
    }));
    push("success", `Refund processed for ${order.receiptNumber}`);
    setRefunding(null);
    setViewing(null);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "7px 16px", borderRadius: 999, border: "1px solid " + (tab === t ? "#2563EB" : "#E2E8F0"), background: tab === t ? "#2563EB" : "#fff", color: tab === t ? "#fff" : "#475569", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {t}
          </button>
        ))}
      </div>
      <Card style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <EmptyState icon={ClipboardList} title="No orders" message="Orders will appear here after completed sales." />
        ) : (
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Cashier</th><th>Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td style={{ fontWeight: 600 }}>{o.orderNumber}</td>
                  <td>{o.customerName}</td>
                  <td>{o.items.reduce((s, i) => s + i.qty, 0)} items</td>
                  <td style={{ fontWeight: 600 }}>{money(o.total)}</td>
                  <td>{o.paymentMethod === "mpesa" ? "M-Pesa" : o.paymentMethod[0].toUpperCase() + o.paymentMethod.slice(1)}</td>
                  <td>{o.cashier}</td>
                  <td style={{ color: "#64748B" }}>{shortDate(o.createdAt)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td><IconBtn onClick={() => setViewing(o)}><Eye size={13} /></IconBtn></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {viewing && (
        <Modal title={`Order ${viewing.orderNumber}`} onClose={() => setViewing(null)} width={460}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <StatusBadge status={viewing.status} />
            <span style={{ fontSize: 12.5, color: "#64748B" }}>{shortDate(viewing.createdAt)} · {timeStr(viewing.createdAt)}</span>
          </div>
          {viewing.items.map((it) => (
            <div key={it.productId} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span>{it.name} × {it.qty}</span><span>{money(it.qty * it.price)}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 13 }}>
            <Row a="Subtotal" b={viewing.subtotal} />
            <Row a="Discount" b={-viewing.discount} />
            <Row a="VAT" b={viewing.tax} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, marginTop: 4 }}><span>Total</span><span>{money(viewing.total)}</span></div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
            <Btn variant="secondary" style={{ flex: 1 }} onClick={() => window.print()}><Printer size={14} /> Print</Btn>
            {viewing.status === "Completed" && <Btn variant="danger" style={{ flex: 1 }} onClick={() => setRefunding(viewing)}>Refund</Btn>}
          </div>
        </Modal>
      )}

      {refunding && <RefundModal order={refunding} onClose={() => setRefunding(null)} onConfirm={doRefund} />}
    </div>
  );
}

function RefundModal({ order, onClose, onConfirm }) {
  const [reason, setReason] = useState("Customer return");
  return (
    <Modal title="Process refund" onClose={onClose} width={380}>
      <p style={{ fontSize: 13.5, color: "#475569" }}>Refund the full amount of <strong>{money(order.total)}</strong> for {order.receiptNumber}? Inventory will be restored.</p>
      <Select label="Refund reason" value={reason} onChange={(e) => setReason(e.target.value)}>
        {["Customer return", "Wrong item", "Damaged product", "Duplicate charge", "Other"].map((r) => <option key={r}>{r}</option>)}
      </Select>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn variant="danger" onClick={() => onConfirm(order, reason)}>Confirm refund</Btn>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   SALES ANALYTICS
--------------------------------------------------------------------- */

function SalesPage({ orders }) {
  const completed = orders.filter((o) => o.status === "Completed");
  const gross = completed.reduce((s, o) => s + o.subtotal, 0);
  const discounts = completed.reduce((s, o) => s + o.discount, 0);
  const tax = completed.reduce((s, o) => s + o.tax, 0);
  const net = completed.reduce((s, o) => s + o.total, 0);
  const avg = completed.length ? net / completed.length : 0;
  const refunds = orders.filter((o) => o.status === "Refunded").reduce((s, o) => s + o.total, 0);

  const byDay = useMemo(() => {
    const map = {};
    completed.forEach((o) => {
      const key = shortDate(o.createdAt);
      map[key] = (map[key] || 0) + o.total;
    });
    return Object.entries(map).slice(-10).map(([date, revenue]) => ({ date, revenue }));
  }, [completed]);

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
        <KpiCard label="Gross Sales" value={money(gross)} icon={TrendingUp} tone="blue" />
        <KpiCard label="Net Sales" value={money(net)} icon={Wallet} tone="green" />
        <KpiCard label="Discounts" value={money(discounts)} icon={TrendingDown} tone="amber" />
        <KpiCard label="Avg. Transaction" value={money(avg)} icon={BarChart3} tone="purple" />
      </div>
      <Card style={{ padding: 18, marginBottom: 16 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Revenue trend</h3>
        {byDay.length === 0 ? <EmptyState icon={BarChart3} title="No sales data" message="Sales trends appear once orders are completed." /> : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byDay}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => money(v)} />
              <Bar dataKey="revenue" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
      <Card style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}><span>Tax collected</span><strong>{money(tax)}</strong></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "8px 0", borderBottom: "1px solid #F1F5F9" }}><span>Transactions</span><strong>{completed.length}</strong></div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "8px 0" }}><span>Refunds</span><strong style={{ color: "#DC2626" }}>{money(refunds)}</strong></div>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------
   SUPPLIERS
--------------------------------------------------------------------- */

function SuppliersPage({ suppliers, setSuppliers, push }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const filtered = suppliers.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const save = (data) => {
    if (modal.mode === "add") { setSuppliers((s) => [{ ...data, id: genId("s"), products: 0, totalPurchases: 0, balance: 0 }, ...s]); push("success", "Supplier added successfully"); }
    else { setSuppliers((s) => s.map((x) => x.id === data.id ? data : x)); push("success", "Supplier updated"); }
    setModal(null);
  };
  const remove = () => { setSuppliers((s) => s.filter((x) => x.id !== deleteTarget.id)); push("success", "Supplier deleted"); setDeleteTarget(null); };

  return (
    <div>
      <TableToolbar search={search} setSearch={setSearch} placeholder="Search suppliers…" onAdd={() => setModal({ mode: "add" })} addLabel="Add supplier" />
      <Card style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <EmptyState icon={Truck} title="No suppliers yet" message="Add a supplier to start tracking purchases." actionLabel="Add supplier" onAction={() => setModal({ mode: "add" })} />
        ) : (
          <table>
            <thead><tr><th>Supplier</th><th>Contact</th><th>Phone</th><th>Total purchases</th><th>Balance</th><th></th></tr></thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td><td>{s.contact}</td><td style={{ color: "#64748B" }}>{s.phone}</td>
                  <td>{money(s.totalPurchases)}</td><td style={{ color: s.balance > 0 ? "#DC2626" : "#16A34A" }}>{money(s.balance)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <IconBtn onClick={() => setModal({ mode: "edit", supplier: s })}><Edit2 size={13} /></IconBtn>
                      <IconBtn danger onClick={() => setDeleteTarget(s)}><Trash2 size={13} /></IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {modal && <SupplierModal mode={modal.mode} supplier={modal.supplier} onClose={() => setModal(null)} onSave={save} />}
      {deleteTarget && <ConfirmDialog title="Delete supplier?" message={`"${deleteTarget.name}" will be permanently removed.`} onConfirm={remove} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}

function SupplierModal({ mode, supplier, onClose, onSave }) {
  const [form, setForm] = useState(supplier || { name: "", contact: "", phone: "", email: "" });
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.name.trim()) return setError("Supplier name is required.");
    setError("");
    onSave(form);
  };
  return (
    <Modal title={mode === "add" ? "Add supplier" : "Edit supplier"} onClose={onClose} width={420}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input label="Supplier name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <Input label="Contact person" value={form.contact} onChange={(e) => set("contact", e.target.value)} />
        <Input label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        <Input label="Email" value={form.email} onChange={(e) => set("email", e.target.value)} />
      </div>
      {error && <div style={{ color: "#DC2626", fontSize: 13, marginTop: 10 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit}>{mode === "add" ? "Add supplier" : "Save changes"}</Btn>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   EXPENSES
--------------------------------------------------------------------- */

const EXPENSE_CATEGORIES = ["Rent", "Electricity", "Water", "Internet", "Transport", "Salaries", "Supplies", "Maintenance", "Marketing", "Other"];

function ExpensesPage({ expenses, setExpenses, user, push }) {
  const [modal, setModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const save = (data) => {
    setExpenses((e) => [{ ...data, id: genId("exp"), addedBy: user.name, createdAt: Date.now() }, ...e]);
    push("success", "Expense recorded");
    setModal(false);
  };
  const remove = () => { setExpenses((e) => e.filter((x) => x.id !== deleteTarget.id)); push("success", "Expense deleted"); setDeleteTarget(null); };

  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <KpiCard label="Total Expenses" value={money(total)} icon={Wallet} tone="amber" />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <Btn onClick={() => setModal(true)}><Plus size={15} /> Add expense</Btn>
      </div>
      <Card style={{ overflow: "hidden" }}>
        {expenses.length === 0 ? (
          <EmptyState icon={Wallet} title="No expenses recorded" message="Track rent, salaries, and other business costs here." actionLabel="Add expense" onAction={() => setModal(true)} />
        ) : (
          <table>
            <thead><tr><th>Title</th><th>Category</th><th>Amount</th><th>Payment</th><th>Added by</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>{e.title}</td><td><Badge>{e.category}</Badge></td><td style={{ fontWeight: 600 }}>{money(e.amount)}</td>
                  <td>{e.paymentMethod}</td><td>{e.addedBy}</td><td style={{ color: "#64748B" }}>{shortDate(e.createdAt)}</td>
                  <td><IconBtn danger onClick={() => setDeleteTarget(e)}><Trash2 size={13} /></IconBtn></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {modal && <ExpenseModal onClose={() => setModal(false)} onSave={save} />}
      {deleteTarget && <ConfirmDialog title="Delete expense?" message={`"${deleteTarget.title}" will be permanently removed.`} onConfirm={remove} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}

function ExpenseModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: "", category: EXPENSE_CATEGORIES[0], amount: "", paymentMethod: "Cash", description: "" });
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.title.trim()) return setError("Expense title is required.");
    if (!form.amount || Number(form.amount) <= 0) return setError("Enter a valid amount.");
    setError("");
    onSave({ ...form, amount: Number(form.amount) });
  };
  return (
    <Modal title="Add expense" onClose={onClose} width={420}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input label="Expense title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Transport" />
        <Select label="Category" value={form.category} onChange={(e) => set("category", e.target.value)}>
          {EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </Select>
        <Input label="Amount (KES)" type="number" value={form.amount} onChange={(e) => set("amount", e.target.value)} />
        <Select label="Payment method" value={form.paymentMethod} onChange={(e) => set("paymentMethod", e.target.value)}>
          {["Cash", "M-Pesa", "Card", "Bank"].map((m) => <option key={m}>{m}</option>)}
        </Select>
      </div>
      {error && <div style={{ color: "#DC2626", fontSize: 13, marginTop: 10 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit}>Save expense</Btn>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   EMPLOYEES
--------------------------------------------------------------------- */

const ROLES = ["Super Admin", "Admin", "Manager", "Cashier", "Stock Manager"];

function EmployeesPage({ employees, setEmployees, push }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const filtered = employees.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  const save = (data) => {
    if (modal.mode === "add") { setEmployees((e) => [{ ...data, id: genId("u"), status: "Active" }, ...e]); push("success", "Employee added successfully"); }
    else { setEmployees((e) => e.map((x) => x.id === data.id ? data : x)); push("success", "Employee updated"); }
    setModal(null);
  };
  const remove = () => { setEmployees((e) => e.filter((x) => x.id !== deleteTarget.id)); push("success", "Employee removed"); setDeleteTarget(null); };

  return (
    <div>
      <TableToolbar search={search} setSearch={setSearch} placeholder="Search employees…" onAdd={() => setModal({ mode: "add" })} addLabel="Add employee" />
      <Card style={{ overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <EmptyState icon={UserCog} title="No employees yet" message="Add staff accounts to manage roles and permissions." actionLabel="Add employee" onAction={() => setModal({ mode: "add" })} />
        ) : (
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Branch</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {filtered.map((e) => (
                <tr key={e.id}>
                  <td style={{ fontWeight: 600 }}>{e.name}</td><td style={{ color: "#64748B" }}>{e.email}</td>
                  <td><Badge tone="info">{e.role}</Badge></td><td>{e.branch}</td><td><StatusBadge status={e.status} /></td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <IconBtn onClick={() => setModal({ mode: "edit", employee: e })}><Edit2 size={13} /></IconBtn>
                      <IconBtn danger onClick={() => setDeleteTarget(e)}><Trash2 size={13} /></IconBtn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
      {modal && <EmployeeModal mode={modal.mode} employee={modal.employee} onClose={() => setModal(null)} onSave={save} />}
      {deleteTarget && <ConfirmDialog title="Remove employee?" message={`"${deleteTarget.name}" will lose access to the system.`} onConfirm={remove} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}

function EmployeeModal({ mode, employee, onClose, onSave }) {
  const [form, setForm] = useState(employee || { name: "", email: "", phone: "", role: "Cashier", branch: BRANCHES[0].location, status: "Active" });
  const [error, setError] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.name.trim()) return setError("Name is required.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email address.");
    setError("");
    onSave(form);
  };
  return (
    <Modal title={mode === "add" ? "Add employee" : "Edit employee"} onClose={onClose} width={420}>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Input label="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
        <Input label="Email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        <Input label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
        <Select label="Role" value={form.role} onChange={(e) => set("role", e.target.value)}>
          {ROLES.map((r) => <option key={r}>{r}</option>)}
        </Select>
        <Select label="Branch" value={form.branch} onChange={(e) => set("branch", e.target.value)}>
          {BRANCHES.map((b) => <option key={b.id}>{b.location}</option>)}
        </Select>
      </div>
      {error && <div style={{ color: "#DC2626", fontSize: 13, marginTop: 10 }}>{error}</div>}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
        <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
        <Btn onClick={submit}>{mode === "add" ? "Add employee" : "Save changes"}</Btn>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------
   REPORTS
--------------------------------------------------------------------- */

function ReportsPage({ orders, products, expenses, customers, employees }) {
  const completed = orders.filter((o) => o.status === "Completed");
  const revenue = completed.reduce((s, o) => s + o.total, 0);
  const cogs = completed.reduce((s, o) => s + o.items.reduce((s2, it) => {
    const p = products.find((pp) => pp.id === it.productId);
    return s2 + (p ? p.cost * it.qty : 0);
  }, 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - totalExpenses;

  const employeeSales = employees.map((e) => {
    const empOrders = completed.filter((o) => o.cashier === e.name);
    return { name: e.name, count: empOrders.length, total: empOrders.reduce((s, o) => s + o.total, 0) };
  }).sort((a, b) => b.total - a.total);

  const topCustomers = customers.map((c) => ({
    name: c.name, total: completed.filter((o) => o.customerId === c.id).reduce((s, o) => s + o.total, 0),
  })).sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card style={{ padding: 18 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Profit report</h3>
        {[["Revenue", revenue], ["COGS", -cogs], ["Gross profit", grossProfit], ["Expenses", -totalExpenses], ["Net profit", netProfit]].map(([label, val], i) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? "1px solid #F1F5F9" : "none", fontWeight: label.includes("profit") ? 700 : 500 }}>
            <span style={{ color: "#64748B" }}>{label}</span>
            <span style={{ color: val < 0 ? "#DC2626" : "#0F172A" }}>{val < 0 ? `-${money(Math.abs(val))}` : money(val)}</span>
          </div>
        ))}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Sales per employee</h3>
          {employeeSales.map((e) => (
            <div key={e.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span>{e.name} <span style={{ color: "#94A3B8" }}>({e.count})</span></span><strong>{money(e.total)}</strong>
            </div>
          ))}
        </Card>
        <Card style={{ padding: 18 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>Top customers</h3>
          {topCustomers.map((c) => (
            <div key={c.name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #F1F5F9" }}>
              <span>{c.name}</span><strong>{money(c.total)}</strong>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------
   BRANCHES
--------------------------------------------------------------------- */

function BranchesPage() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {BRANCHES.map((b) => (
        <Card key={b.id} style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>🏪</div>
            <div><div style={{ fontWeight: 700 }}>{b.name}</div><div style={{ fontSize: 12.5, color: "#64748B" }}>{b.location}</div></div>
          </div>
          <Badge tone="success">Active</Badge>
        </Card>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------
   SETTINGS
--------------------------------------------------------------------- */

function SettingsPage({ settings, setSettings, push }) {
  const [form, setForm] = useState(settings);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = () => { setSettings(form); push("success", "Settings saved"); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 560 }}>
      <Card style={{ padding: 18 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>Business settings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Input label="Business name" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
          <Input label="Address" value={form.address} onChange={(e) => set("address", e.target.value)} />
          <Input label="Phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          <Input label="Email" value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
      </Card>
      <Card style={{ padding: 18 }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700 }}>POS settings</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Currency" value={form.currency} onChange={(e) => set("currency", e.target.value)} />
          <Input label="Tax rate (%)" type="number" value={form.taxRate} onChange={(e) => set("taxRate", Number(e.target.value))} />
          <Input label="Timezone" value={form.timezone} onChange={(e) => set("timezone", e.target.value)} />
        </div>
      </Card>
      <div><Btn onClick={save}>Save changes</Btn></div>
    </div>
  );
}

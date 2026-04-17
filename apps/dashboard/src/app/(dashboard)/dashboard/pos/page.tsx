"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button, Card, CardContent, Input, Badge, Modal } from "@ecom/ui";
import { formatCurrency, getWhatsAppLink, generateInvoiceMessage } from "@ecom/utils";
import { Search, Plus, Minus, Trash2, Barcode, User, Phone, ShoppingCart, Send, Banknote, Smartphone, CreditCard, X, Check, Package, Printer } from "lucide-react";
import toast from "react-hot-toast";
const [activeTab, setActiveTab] = useState<"products"|"bill">("products");

// export const dynamic = "force-dynamic";

interface Product { id: string; name: string; sku: string; barcode?: string; sellingPrice: number; stock: number; unit: string; category: { name: string }; }
interface CartItem { productId: string; name: string; qty: number; price: number; unit: string; stock: number; }
interface KhataAcc { id: string; name: string; phone: string; currentBalance: number; creditLimit: number; }

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cName, setCName] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [payMethod, setPayMethod] = useState<"CASH"|"UPI"|"KHATA">("CASH");
  const [received, setReceived] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [khatas, setKhatas] = useState<KhataAcc[]>([]);
  const [selKhata, setSelKhata] = useState<KhataAcc|null>(null);
  const [showKhata, setShowKhata] = useState(false);
  const bBuf = useRef("");
  const bTimer = useRef<NodeJS.Timeout>();

  const subtotal = cart.reduce((s, i) => s + i.qty * i.price, 0);
  const change = payMethod === "CASH" && received > subtotal ? received - subtotal : 0;

  useEffect(() => {
    fetch("/api/products?limit=5000").then(r => r.json()).then(d => { setProducts(d.products||[]); setFiltered(d.products||[]); });
    fetch("/api/khata").then(r => r.json()).then(d => setKhatas(d.accounts||[]));
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(products.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.barcode||"").includes(q)).slice(0, 100));
  }, [search, products]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter" && bBuf.current) {
        const p = products.find(x => x.barcode === bBuf.current);
        if (p) { addToCart(p); toast.success("Added: " + p.name); } else toast.error("Not found");
        bBuf.current = ""; setSearch(""); return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey) {
        bBuf.current += e.key;
        clearTimeout(bTimer.current);
        bTimer.current = setTimeout(() => { bBuf.current = ""; }, 100);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [products]);

  const addToCart = useCallback((p: Product) => {
    if (p.stock <= 0) { toast.error("Out of stock!"); return; }
    setCart(prev => {
      const ex = prev.find(i => i.productId === p.id);
      if (ex) {
        if (ex.qty >= p.stock) { toast.error("Not enough stock"); return prev; }
        return prev.map(i => i.productId === p.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { productId: p.id, name: p.name, qty: 1, price: p.sellingPrice, unit: p.unit, stock: p.stock }];
    });
  }, []);

  const updateQty = (id: string, d: number) => {
    setCart(prev => prev.map(i => {
      if (i.productId !== id) return i;
      const nq = i.qty + d;
      if (nq <= 0) return null as any;
      if (nq > i.stock) { toast.error("Not enough stock"); return i; }
      return { ...i, qty: nq };
    }).filter(Boolean));
  };

  const clear = () => { setCart([]); setCName(""); setCPhone(""); setReceived(0); setSelKhata(null); setPayMethod("CASH"); };

  const processSale = async () => {
    if (!cart.length) { toast.error("Cart empty"); return; }
    if (payMethod === "KHATA" && !selKhata) { toast.error("Select khata account"); return; }
    if (payMethod === "KHATA" && selKhata && selKhata.currentBalance + subtotal > selKhata.creditLimit) { toast.error("Credit limit exceeded!"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderType: "POS", items: cart.map(i => ({ productId: i.productId, quantity: i.qty, unitPrice: i.price })), customerName: cName || selKhata?.name || "Walk-in", customerPhone: cPhone || selKhata?.phone || "", paymentMethod: payMethod, khataAccountId: selKhata?.id, subtotal, totalAmount: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setLastOrder(data.order); setShowDone(true); clear();
      const r = await fetch("/api/products?limit=5000"); const d = await r.json();
      setProducts(d.products||[]); setFiltered(d.products||[]);
      toast.success("Sale completed!");
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const sendWA = () => {
    if (!lastOrder?.customerPhone) { toast.error("No phone"); return; }
    const msg = generateInvoiceMessage({ orderNumber: lastOrder.orderNumber, customerName: lastOrder.customerName, items: lastOrder.items.map((i: any) => ({ name: i.productName, quantity: i.quantity, unit: i.productUnit, price: i.unitPrice })), subtotal: lastOrder.subtotal, deliveryCharge: 0, total: lastOrder.totalAmount, storeName: "My Grocery Store", storePhone: "9876543210" });
    window.open(getWhatsAppLink(lastOrder.customerPhone, msg), "_blank");
  };

  const printR = () => {
    if (!lastOrder) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const rows = lastOrder.items.map((i: any) => `<div>${i.productName}<div style='display:flex;justify-content:space-between'><span>${i.quantity} ${i.productUnit} x Rs${i.unitPrice}</span><span>Rs${i.totalAmount}</span></div></div>`).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title><style>body{font-family:monospace;font-size:12px;width:80mm;padding:5mm}.center{text-align:center}.line{border-top:1px dashed #000;margin:3mm 0}.row{display:flex;justify-content:space-between}</style></head><body><div class='center'><b>My Grocery Store</b></div><div class='line'></div><div class='row'><span>Bill:</span><span>${lastOrder.orderNumber}</span></div><div class='row'><span>Customer:</span><span>${lastOrder.customerName}</span></div><div class='line'></div>${rows}<div class='line'></div><div class='row'><b>TOTAL</b><b>Rs${lastOrder.totalAmount}</b></div><div class='line'></div><div class='center'>Thank you!</div><script>window.print()</script></body></html>`);
    w.document.close();
  };

 

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      
      {/* Mobile Tabs */}
      <div className="flex lg:hidden border-b bg-white mb-2 rounded-xl overflow-hidden shadow-sm">
        <button
          onClick={() => setActiveTab("products")}
          className={"flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 " + (activeTab === "products" ? "bg-green-600 text-white" : "text-gray-600")}
        >
          <Package className="h-4 w-4" />Products
        </button>
        <button
          onClick={() => setActiveTab("bill")}
          className={"flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 " + (activeTab === "bill" ? "bg-green-600 text-white" : "text-gray-600")}
        >
          <ShoppingCart className="h-4 w-4" />
          Bill {cart.length > 0 && <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cart.length}</span>}
        </button>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Products Panel */}
        <div className={"flex-1 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden " + (activeTab === "bill" ? "hidden lg:flex" : "flex")}>
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input type="text" placeholder="Search or scan barcode..." className="w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500" value={search} onChange={(e) => setSearch(e.target.value)} />
              <Barcode className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filtered.map(p => (
                <button key={p.id} onClick={() => { addToCart(p); setActiveTab("bill"); }} disabled={p.stock <= 0}
                  className={"p-3 border-2 rounded-xl text-left transition-all " + (p.stock <= 0 ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:border-green-500 hover:shadow-md active:scale-95")}>
                  <p className="font-medium text-sm line-clamp-2 h-10">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{p.category.name}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-green-600 font-bold text-sm">{formatCurrency(p.sellingPrice)}</span>
                    <Badge variant={p.stock > 10 ? "success" : p.stock > 0 ? "warning" : "destructive"}>{p.stock}</Badge>
                  </div>
                </button>
              ))}
            </div>
            {filtered.length === 0 && <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20"><Package className="h-16 w-16 mb-4 opacity-30" /><p>No products found</p></div>}
          </div>
        </div>

        {/* Bill Panel */}
        <div className={"w-full lg:w-96 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden " + (activeTab === "products" ? "hidden lg:flex" : "flex")}>
          <div className="p-4 border-b flex items-center justify-between bg-green-600 text-white">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">Current Bill</span>
              {cart.length > 0 && <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">{cart.length}</span>}
            </div>
            <div className="flex items-center gap-2">
              {cart.length > 0 && <button onClick={clear} className="text-white/80 hover:text-white text-sm flex items-center gap-1"><X className="h-4 w-4" />Clear</button>}
              <button onClick={() => setActiveTab("products")} className="lg:hidden text-white/80 hover:text-white"><Package className="h-5 w-5" /></button>
            </div>
          </div>
          <div className="p-3 border-b bg-gray-50 space-y-2">
            <Input placeholder="Customer Name" icon={<User className="h-4 w-4" />} value={cName} onChange={(e) => setCName(e.target.value)} />
            <Input placeholder="Phone" icon={<Phone className="h-4 w-4" />} value={cPhone} onChange={(e) => setCPhone(e.target.value.replace(/\D/g,"").slice(0,10))} />
          </div>
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <ShoppingCart className="h-16 w-16 mb-4 opacity-30" />
                <p>Cart is empty</p>
                <button onClick={() => setActiveTab("products")} className="mt-3 text-green-600 text-sm underline lg:hidden">Products dekho</button>
              </div>
            ) : cart.map(item => (
              <div key={item.productId} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                <div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{item.name}</p><p className="text-xs text-gray-500">{formatCurrency(item.price)} x {item.qty}</p></div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => updateQty(item.productId, -1)} className="h-7 w-7 flex items-center justify-center bg-white border rounded-lg hover:bg-gray-100"><Minus className="h-3 w-3" /></button>
                  <span className="w-6 text-center text-sm">{item.qty}</span>
                  <button onClick={() => updateQty(item.productId, 1)} className="h-7 w-7 flex items-center justify-center bg-white border rounded-lg hover:bg-gray-100"><Plus className="h-3 w-3" /></button>
                  <button onClick={() => setCart(c => c.filter(i => i.productId !== item.productId))} className="h-7 w-7 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="h-3 w-3" /></button>
                </div>
                <span className="w-16 text-right font-bold text-sm">{formatCurrency(item.qty * item.price)}</span>
              </div>
            ))}
          </div>
          <div className="p-3 border-t"><div className="flex justify-between text-xl font-bold"><span>Total</span><span className="text-green-600">{formatCurrency(subtotal)}</span></div></div>
          <div className="p-3 border-t space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {(["CASH","UPI","KHATA"] as const).map(m => (
                <button key={m} onClick={() => { setPayMethod(m); if (m !== "KHATA") setSelKhata(null); if (m === "KHATA") setShowKhata(true); }}
                  className={"flex flex-col items-center p-3 rounded-xl border-2 transition-all " + (payMethod === m ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 hover:border-gray-300")}>
                  {m === "CASH" ? <Banknote className="h-5 w-5 mb-1" /> : m === "UPI" ? <Smartphone className="h-5 w-5 mb-1" /> : <CreditCard className="h-5 w-5 mb-1" />}
                  <span className="text-xs font-medium">{m}</span>
                </button>
              ))}
            </div>
            {selKhata && <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between"><div><p className="font-medium text-purple-800 text-sm">{selKhata.name}</p><p className="text-xs text-purple-600">Due: {formatCurrency(selKhata.currentBalance)}</p></div><button onClick={() => { setSelKhata(null); setPayMethod("CASH"); }}><X className="h-4 w-4 text-purple-400" /></button></div>}
            {payMethod === "CASH" && (
              <div className="space-y-2">
                <Input type="number" placeholder="Amount Received" value={received || ""} onChange={(e) => setReceived(Number(e.target.value))} />
                {change > 0 && <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex justify-between"><span className="text-green-700 font-medium">Change</span><span className="font-bold text-green-700">{formatCurrency(change)}</span></div>}
                <div className="grid grid-cols-5 gap-1">{[50,100,200,500,1000].map(a => <button key={a} onClick={() => setReceived(a)} className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium">Rs{a}</button>)}</div>
                <button onClick={() => setReceived(subtotal)} className="w-full py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium">Exact Amount</button>
              </div>
            )}
            <Button onClick={processSale} className="w-full h-12 text-base" variant="success" loading={loading} disabled={cart.length === 0}>
              <Check className="h-5 w-5 mr-2" />Complete Sale
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={showKhata} onClose={() => setShowKhata(false)} title="Select Khata Account" size="md">
        <div className="space-y-2 max-h-80 overflow-auto">
          {khatas.map(a => (
            <button key={a.id} onClick={() => { setSelKhata(a); setPayMethod("KHATA"); setCName(a.name); setCPhone(a.phone); setShowKhata(false); }}
              className="w-full p-4 border-2 rounded-xl text-left hover:border-green-500 hover:bg-green-50 transition-all">
              <div className="flex justify-between items-center">
                <div><p className="font-semibold">{a.name}</p><p className="text-sm text-gray-500">{a.phone}</p></div>
                <div className="text-right"><p className="font-bold text-red-600">{formatCurrency(a.currentBalance)}</p><p className="text-xs text-gray-400">Limit: {formatCurrency(a.creditLimit)}</p></div>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showDone} onClose={() => setShowDone(false)} title="" size="sm">
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4"><Check className="h-10 w-10 text-green-600" /></div>
          <h2 className="text-2xl font-bold mb-2">Sale Done!</h2>
          {lastOrder && <>
            <p className="text-gray-500 mb-4">#{lastOrder.orderNumber}</p>
            <div className="bg-gray-50 rounded-xl p-4 mb-6"><p className="text-3xl font-bold text-green-600">{formatCurrency(lastOrder.totalAmount)}</p></div>
            <div className="space-y-2">
              {lastOrder.customerPhone && <Button onClick={sendWA} variant="success" className="w-full"><Send className="h-4 w-4 mr-2" />Send WhatsApp</Button>}
              <Button onClick={printR} variant="outline" className="w-full"><Printer className="h-4 w-4 mr-2" />Print Receipt</Button>
              <Button onClick={() => setShowDone(false)} variant="secondary" className="w-full">New Sale</Button>
            </div>
          </>}
        </div>
      </Modal>
    </div>
  );
}
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, Button, Input } from "@ecom/ui";
import { PackagePlus, Plus, Trash2, Save, Package } from "lucide-react";
import toast from "react-hot-toast";

interface Product { id: string; name: string; sku: string; stock: number; unit: string; costPrice: number; }
interface PurchaseItem { productId: string; name: string; unit: string; quantity: number; costPrice: number; }

export default function PurchasePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [supplier, setSupplier] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetch("/api/products?limit=5000")
      .then(r => r.json())
      .then(d => setProducts(d.products || []));
  }, []);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 20);

  const addItem = (product: Product) => {
    if (items.find(i => i.productId === product.id)) {
      toast.error("Product already added!");
      return;
    }
    setItems(prev => [...prev, {
      productId: product.id,
      name: product.name,
      unit: product.unit,
      quantity: 1,
      costPrice: product.costPrice || 0,
    }]);
    setSearch("");
    setShowSearch(false);
  };

  const updateItem = (productId: string, field: "quantity" | "costPrice", value: number) => {
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, [field]: value } : i));
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const totalAmount = items.reduce((s, i) => s + i.quantity * i.costPrice, 0);

  const save = async () => {
    if (!items.length) { toast.error("Koi product add nahi kiya!"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplier, date, note, items }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Purchase entry saved! Stock updated!");
      setItems([]);
      setSupplier("");
      setNote("");
      // Refresh products
      fetch("/api/products?limit=5000").then(r => r.json()).then(d => setProducts(d.products || []));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <PackagePlus className="h-7 w-7 text-green-600" />Purchase Entry
      </h1>

      {/* Header Info */}
      <Card><CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Supplier Name</label>
            <input
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              placeholder="Supplier ka naam"
              className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Optional note"
              className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
            />
          </div>
        </div>
      </CardContent></Card>

      {/* Product Search */}
      <Card><CardContent className="p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Add Karo</label>
        <div className="relative">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            placeholder="Product name ya SKU search karo..."
            className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
          />
          {showSearch && search && (
            <div className="absolute top-full left-0 right-0 bg-white border rounded-xl shadow-lg z-50 max-h-60 overflow-auto mt-1">
              {filtered.length === 0 ? (
                <p className="p-4 text-gray-400 text-center">Koi product nahi mila</p>
              ) : filtered.map(p => (
                <button
                  key={p.id}
                  onClick={() => addItem(p)}
                  className="w-full text-left px-4 py-3 hover:bg-green-50 border-b last:border-0 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.sku} | Stock: {p.stock} {p.unit}</p>
                  </div>
                  <Plus className="h-4 w-4 text-green-600" />
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent></Card>

      {/* Items Table */}
      {items.length > 0 && (
        <Card><CardContent className="p-4">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />Purchase Items ({items.length})
          </h2>
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.productId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.unit}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div>
                    <label className="text-xs text-gray-500 block">Quantity</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateItem(item.productId, "quantity", Number(e.target.value))}
                      className="w-20 border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-green-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block">Cost Price ₹</label>
                    <input
                      type="number"
                      value={item.costPrice}
                      onChange={e => updateItem(item.productId, "costPrice", Number(e.target.value))}
                      className="w-24 border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-green-500"
                      min="0"
                    />
                  </div>
                  <div className="text-right">
                    <label className="text-xs text-gray-500 block">Total</label>
                    <p className="font-bold text-green-600 text-sm">₹{(item.quantity * item.costPrice).toFixed(0)}</p>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600 mt-3">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-4 pt-4 border-t">
            <span className="font-bold text-lg">Total Amount:</span>
            <span className="font-bold text-xl text-green-600">₹{totalAmount.toFixed(0)}</span>
          </div>
        </CardContent></Card>
      )}

      {/* Save Button */}
      <Button onClick={save} loading={saving} className="w-full h-12 text-base" variant="success" disabled={items.length === 0}>
        <Save className="h-5 w-5 mr-2" />Save Purchase Entry & Update Stock
      </Button>
    </div>
  );
}
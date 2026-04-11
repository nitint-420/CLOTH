"use client";
import { useState, useEffect } from "react";
import { Plus, X, Save } from "lucide-react";
import toast from "react-hot-toast";

interface Category { id: string; name: string; }

export function AddProductButton() {
  const [show, setShow] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    categoryId: "",
    mrp: "",
    sellingPrice: "",
    costPrice: "",
    stock: "",
    unit: "KG",
    lowStockAlert: "10",
  });

  useEffect(() => {
    fetch("/api/categories")
      .then(r => r.json())
      .then(d => setCategories(d.categories || []));
  }, []);

  const save = async () => {
    if (!form.name || !form.sku || !form.categoryId || !form.mrp || !form.sellingPrice) {
      toast.error("Name, SKU, Category, MRP aur Selling Price zaruri hai!");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          barcode: form.barcode || null,
          categoryId: form.categoryId,
          mrp: Number(form.mrp),
          sellingPrice: Number(form.sellingPrice),
          costPrice: Number(form.costPrice) || 0,
          stock: Number(form.stock) || 0,
          unit: form.unit,
          lowStockAlert: Number(form.lowStockAlert) || 10,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Product add ho gaya!");
      setShow(false);
      setForm({ name: "", sku: "", barcode: "", categoryId: "", mrp: "", sellingPrice: "", costPrice: "", stock: "", unit: "KG", lowStockAlert: "10" });
      setTimeout(() => window.location.reload(), 800);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700"
      >
        <Plus className="h-5 w-5" />Add Product
      </button>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white rounded-t-2xl">
              <h2 className="text-lg font-bold">New Product Add Karo</h2>
              <button onClick={() => setShow(false)}><X className="h-6 w-6" /></button>
            </div>
            <div className="p-4 space-y-3">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Jaise: Tata Salt 1kg"
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
              </div>

              {/* SKU + Barcode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                    placeholder="Jaise: SALT001"
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <input value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})}
                    placeholder="Optional"
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500">
                  <option value="">-- Category select karo --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MRP ₹ *</label>
                  <input type="number" value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})}
                    placeholder="0"
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling ₹ *</label>
                  <input type="number" value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice: e.target.value})}
                    placeholder="0"
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost ₹</label>
                  <input type="number" value={form.costPrice} onChange={e => setForm({...form, costPrice: e.target.value})}
                    placeholder="0"
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
                </div>
              </div>

              {/* Stock + Unit */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                    placeholder="0"
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500">
                    <option>KG</option>
                    <option>GM</option>
                    <option>LTR</option>
                    <option>ML</option>
                    <option>PCS</option>
                    <option>PKT</option>
                    <option>BOX</option>
                    <option>DOZ</option>
                  </select>
                </div>
              </div>

              {/* Low Stock Alert */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                <input type="number" value={form.lowStockAlert} onChange={e => setForm({...form, lowStockAlert: e.target.value})}
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50">
                  <Save className="h-5 w-5" />{loading ? "Saving..." : "Save Product"}
                </button>
                <button onClick={() => setShow(false)}
                  className="flex-1 bg-red-100 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  <X className="h-5 w-5" />Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
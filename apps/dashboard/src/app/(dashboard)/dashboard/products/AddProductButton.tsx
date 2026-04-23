"use client";
import { useState, useRef } from "react";
import { Plus, X, Save, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

interface Category { id: string; name: string; }

export function AddProductButton() {
  const [show, setShow] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageType, setImageType] = useState<"url"|"upload">("upload");
  const imageRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "", sku: "", barcode: "", categoryId: "",
    mrp: "", sellingPrice: "", costPrice: "",
    stock: "", unit: "KG", lowStockAlert: "10",
    image: "", imageUrl: "",
  });

  const loadCategories = () => {
    fetch("/api/categories").then(r => r.json()).then(d => setCategories(d.categories || []));
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 400;
        let w = img.width, h = img.height;
        if (w > h && w > MAX) { h = (h * MAX) / w; w = MAX; }
        else if (h > MAX) { w = (w * MAX) / h; h = MAX; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await compressImage(file);
    setForm(f => ({...f, image: base64}));
  };

  const save = async () => {
    if (!form.name || !form.sku || !form.categoryId || !form.mrp || !form.sellingPrice) {
      toast.error("Name, SKU, Category, MRP aur Selling Price zaruri hai!"); return;
    }
    const finalImage = imageType === "url" ? form.imageUrl : form.image;
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, sku: form.sku,
          barcode: form.barcode || null,
          categoryId: form.categoryId,
          mrp: Number(form.mrp),
          sellingPrice: Number(form.sellingPrice),
          costPrice: Number(form.costPrice) || 0,
          stock: Number(form.stock) || 0,
          unit: form.unit,
          lowStockAlert: Number(form.lowStockAlert) || 10,
          image: finalImage || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Product add ho gaya!");
      setShow(false);
      setForm({ name: "", sku: "", barcode: "", categoryId: "", mrp: "", sellingPrice: "", costPrice: "", stock: "", unit: "KG", lowStockAlert: "10", image: "", imageUrl: "" });
      setTimeout(() => window.location.reload(), 800);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <button onClick={() => { setShow(true); loadCategories(); }}
        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-green-700">
        <Plus className="h-5 w-5" />Add Product
      </button>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white rounded-t-2xl sticky top-0">
              <h2 className="text-lg font-bold">New Product Add Karo</h2>
              <button onClick={() => setShow(false)}><X className="h-6 w-6" /></button>
            </div>
            <div className="p-4 space-y-3">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Jaise: Tata Salt 1kg"
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                  <input value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                    placeholder="SALT001"
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <input value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})}
                    placeholder="Optional"
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500">
                  <option value="">-- Category select karo --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">MRP ₹ *</label>
                  <input type="number" value={form.mrp} onChange={e => setForm({...form, mrp: e.target.value})}
                    placeholder="0" className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling ₹ *</label>
                  <input type="number" value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice: e.target.value})}
                    placeholder="0" className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost ₹</label>
                  <input type="number" value={form.costPrice} onChange={e => setForm({...form, costPrice: e.target.value})}
                    placeholder="0" className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Opening Stock</label>
                  <input type="number" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})}
                    placeholder="0" className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Alert</label>
                <input type="number" value={form.lowStockAlert} onChange={e => setForm({...form, lowStockAlert: e.target.value})}
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="h-4 w-4 inline mr-1" />Product Image
                </label>
                <div className="flex gap-2 mb-2">
                  <button type="button" onClick={() => setImageType("upload")}
                    className={"flex-1 py-2 rounded-xl text-sm font-medium border-2 " + (imageType === "upload" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200")}>
                    📁 Computer se Upload
                  </button>
                  <button type="button" onClick={() => setImageType("url")}
                    className={"flex-1 py-2 rounded-xl text-sm font-medium border-2 " + (imageType === "url" ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200")}>
                    🔗 URL se
                  </button>
                </div>

                {imageType === "upload" ? (
                  <input type="file" accept="image/*" onChange={handleImageUpload} ref={imageRef}
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
                ) : (
                  <input value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
                )}

                {(form.image || form.imageUrl) && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={imageType === "url" ? form.imageUrl : form.image} alt="preview"
                      className="w-16 h-16 object-cover rounded-xl border" />
                    <span className="text-xs text-green-600">✅ Image ready!</span>
                  </div>
                )}
              </div>

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
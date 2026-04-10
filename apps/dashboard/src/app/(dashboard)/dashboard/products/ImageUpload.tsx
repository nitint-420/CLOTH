"use client";
import { useState, useRef } from "react";
import { Pencil, X, Save } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  productId: string;
  hasImage: boolean;
  currentPrice: number;
  currentMrp: number;
  currentStock: number;
  currentCost: number;
}

export function ImageUpload({ productId, hasImage, currentPrice, currentMrp, currentStock, currentCost }: Props) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editData, setEditData] = useState({
    sellingPrice: currentPrice,
    mrp: currentMrp,
    stock: currentStock,
    costPrice: currentCost,
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const img = new Image();
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

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const base64 = await compressImage(file);
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, image: base64 }),
      });
      if (res.ok) { setDone(true); setTimeout(() => window.location.reload(), 500); }
      else { toast.error("Image save nahi hui"); }
    } catch { toast.error("Error hua"); }
    finally { setLoading(false); }
  };

  const saveEdit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, ...editData, previousPrice: currentPrice, previousStock: currentStock, previousCost: currentCost }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Product updated!");
      setShowEdit(false);
      setTimeout(() => window.location.reload(), 800);
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} disabled={loading} />
      
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="text-xs text-blue-500 underline disabled:opacity-50"
        >
          {loading ? "Saving..." : done ? "✅ Saved!" : hasImage ? "Change Image" : "Add Image"}
        </button>
        <button
          type="button"
          onClick={() => setShowEdit(!showEdit)}
          className="text-xs text-green-600 underline flex items-center gap-1"
        >
          <Pencil className="h-3 w-3" />Edit
        </button>
      </div>

      {showEdit && (
        <div className="mt-3 p-3 bg-gray-50 rounded-xl border space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500">Selling Price ₹</label>
              <input
                type="number"
                value={editData.sellingPrice}
                onChange={e => setEditData({...editData, sellingPrice: Number(e.target.value)})}
                className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">MRP ₹</label>
              <input
                type="number"
                value={editData.mrp}
                onChange={e => setEditData({...editData, mrp: Number(e.target.value)})}
                className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Cost Price ₹</label>
              <input
                type="number"
                value={editData.costPrice}
                onChange={e => setEditData({...editData, costPrice: Number(e.target.value)})}
                className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Stock</label>
              <input
                type="number"
                value={editData.stock}
                onChange={e => setEditData({...editData, stock: Number(e.target.value)})}
                className="w-full border rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={saveEdit} disabled={loading} className="flex-1 bg-green-600 text-white py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
              <Save className="h-3 w-3" />{loading ? "Saving..." : "Save"}
            </button>
            <button onClick={() => setShowEdit(false)} className="flex-1 bg-gray-200 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
              <X className="h-3 w-3" />Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
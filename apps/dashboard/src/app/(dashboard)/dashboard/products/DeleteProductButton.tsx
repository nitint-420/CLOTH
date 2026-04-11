"use client";
import { useState } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: Props) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const deleteProduct = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Product delete ho gaya!");
      setShow(false);
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
        className="text-xs text-red-500 underline flex items-center gap-1 mt-1"
      >
        <Trash2 className="h-3 w-3" />Delete
      </button>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b bg-red-600 text-white rounded-t-2xl">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />Delete Product
              </h2>
              <button onClick={() => setShow(false)}><X className="h-6 w-6" /></button>
            </div>
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <p className="font-semibold text-gray-800 mb-2">Kya aap sure hain?</p>
              <p className="text-sm text-gray-500 mb-6">
                <span className="font-medium text-red-600">"{productName}"</span> delete ho jayega — yeh action undo nahi ho sakta!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={deleteProduct}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="h-5 w-5" />{loading ? "Deleting..." : "Haan, Delete Karo"}
                </button>
                <button
                  onClick={() => setShow(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
"use client";
import { useState } from "react";
import { Plus, X, Save, User, Phone, MapPin, CreditCard } from "lucide-react";
import toast from "react-hot-toast";

export function AddKhataButton() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    creditLimit: "5000",
  });

  const save = async () => {
    if (!form.name || !form.phone) { toast.error("Naam aur phone zaruri hai!"); return; }
    if (form.phone.length !== 10) { toast.error("Phone 10 digits ka hona chahiye!"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/khata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address: form.address || null,
          creditLimit: Number(form.creditLimit) || 5000,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Khata account ban gaya!");
      setShow(false);
      setForm({ name: "", phone: "", address: "", creditLimit: "5000" });
      setTimeout(() => window.location.reload(), 800);
    } catch (e: any) {
      toast.error(e.message === "Phone exists" ? "Yeh phone number already registered hai!" : e.message);
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
        <Plus className="h-5 w-5" />Add Khata
      </button>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white rounded-t-2xl">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5" />Naya Khata Account
              </h2>
              <button onClick={() => setShow(false)}><X className="h-6 w-6" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-1" />Customer Name *
                </label>
                <input
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Jaise: Ramesh Kumar"
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />Phone Number *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})}
                  placeholder="10 digit phone number"
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />Address
                </label>
                <textarea
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  placeholder="Ghar ka address (optional)"
                  rows={2}
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CreditCard className="h-4 w-4 inline mr-1" />Credit Limit ₹
                </label>
                <input
                  type="number"
                  value={form.creditLimit}
                  onChange={e => setForm({...form, creditLimit: e.target.value})}
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500"
                />
                <p className="text-xs text-gray-400 mt-1">Kitna udhaar de sakte ho maximum</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={save}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50"
                >
                  <Save className="h-5 w-5" />{loading ? "Saving..." : "Save Khata"}
                </button>
                <button
                  onClick={() => setShow(false)}
                  className="flex-1 bg-red-100 text-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
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
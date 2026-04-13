"use client";
import { useState } from "react";
import { Pencil, X, Save, User, Phone, MapPin, CreditCard, IndianRupee } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  account: {
    id: string;
    name: string;
    phone: string;
    address: string | null;
    creditLimit: number;
    currentBalance: number;
  };
}

export function EditKhataButton({ account }: Props) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: account.name,
    phone: account.phone,
    address: account.address || "",
    creditLimit: account.creditLimit.toString(),
    currentBalance: account.currentBalance.toString(),
    paymentNote: "",
  });

  const save = async () => {
    if (!form.name || !form.phone) { toast.error("Naam aur phone zaruri hai!"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/khata/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: account.id,
          name: form.name,
          phone: form.phone,
          address: form.address || null,
          creditLimit: Number(form.creditLimit),
          currentBalance: Number(form.currentBalance),
          previousBalance: account.currentBalance,
          paymentNote: form.paymentNote,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      toast.success("Khata update ho gaya!");
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
        className="text-xs text-green-600 underline flex items-center gap-1"
      >
        <Pencil className="h-3 w-3" />Edit
      </button>

      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white rounded-t-2xl">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Pencil className="h-5 w-5" />Edit Khata Account
              </h2>
              <button onClick={() => setShow(false)}><X className="h-6 w-6" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-1" />Customer Name *
                </label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />Phone Number *
                </label>
                <input type="tel" value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10)})}
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />Address
                </label>
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                  rows={2} className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <CreditCard className="h-4 w-4 inline mr-1" />Credit Limit ₹
                </label>
                <input type="number" value={form.creditLimit}
                  onChange={e => setForm({...form, creditLimit: e.target.value})}
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-green-500" />
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-2">
                <label className="block text-sm font-medium text-orange-700">
                  <IndianRupee className="h-4 w-4 inline mr-1" />Current Balance ₹ (Baaki Amount)
                </label>
                <input type="number" value={form.currentBalance}
                  onChange={e => setForm({...form, currentBalance: e.target.value})}
                  className="w-full border rounded-xl px-4 py-2.5 focus:outline-none focus:border-orange-400" />
                <p className="text-xs text-orange-600">
                  Purana balance: ₹{account.currentBalance} | 
                  {Number(form.currentBalance) < account.currentBalance 
                    ? ` ₹${account.currentBalance - Number(form.currentBalance)} payment mili` 
                    : Number(form.currentBalance) > account.currentBalance 
                    ? ` ₹${Number(form.currentBalance) - account.currentBalance} naya udhaar`
                    : " Koi change nahi"}
                </p>
                <input value={form.paymentNote} onChange={e => setForm({...form, paymentNote: e.target.value})}
                  placeholder="Payment note (optional)"
                  className="w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-orange-400" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={save} disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-50">
                  <Save className="h-5 w-5" />{loading ? "Saving..." : "Save"}
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
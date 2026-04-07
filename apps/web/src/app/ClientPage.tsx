"use client";
import { useState } from "react";
import { formatCurrency } from "@ecom/utils";
import { Store, Phone, MapPin, Clock, MessageCircle, ShoppingCart, Plus, Minus, X } from "lucide-react"; // X still used in cart/form

type Product = {
  id: string; name: string; sellingPrice: number; mrp: number;
  image: string | null; category: { name: string }; unit: string; stock: number;
};

type CartItem = { product: Product; qty: number };

export default function HomePage({ categories, products, s }: {
  categories: any[]; products: Product[]; s: Record<string, string>;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "", note: "" });
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const wa = "91" + (s.store_whatsapp || s.store_phone || "9876543210");

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { product, qty: 1 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) setCart(prev => prev.filter(i => i.product.id !== id));
    else setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty } : i));
  };

  const total = cart.reduce((sum, i) => sum + i.product.sellingPrice * i.qty, 0);
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);

  const filteredProducts = selectedCategory
    ? products.filter(p => p.category.name === selectedCategory)
    : products;

  const sendOrder = () => {
    if (!form.name || !form.phone || !form.address) { alert("Naam, phone aur address zaruri hai!"); return; }
    let msg = `🛒 *New Order*\n\n`;
    msg += `👤 *Name:* ${form.name}\n📞 *Phone:* ${form.phone}\n📍 *Address:* ${form.address}\n`;
    if (form.note) msg += `📝 *Note:* ${form.note}\n`;
    msg += `\n*Order Items:*\n`;
    cart.forEach(i => { msg += `▪ ${i.product.name} x${i.qty} ${i.product.unit} = ${formatCurrency(i.product.sellingPrice * i.qty)}\n`; });
    msg += `\n💰 *Total: ${formatCurrency(total)}*`;
    window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, "_blank");
    setCart([]); setShowForm(false); setShowCart(false);
    setForm({ name: "", phone: "", address: "", note: "" });
  };

  const emojis = ["🌾","🍚","🫒","🌶","🍬","☕","🍪","🥛","🧴","🧹","🥤","🍜"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><Store className="h-7 w-7" /><span className="text-xl font-bold">{s.store_name || "Grocery Store"}</span></div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowCart(true)} className="relative flex items-center gap-1 bg-white text-green-600 px-3 py-1.5 rounded-full font-medium text-sm">
              <ShoppingCart className="h-4 w-4" />Cart
              {totalItems > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{totalItems}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-green-600 text-white py-14 px-4 text-center">
        <h1 className="text-3xl font-bold mb-3">Fresh Groceries Delivered!</h1>
        <p className="text-green-100 mb-6">Best prices | Fresh stock | Fast delivery</p>
        <button onClick={() => setShowCart(true)} className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-full font-bold text-lg hover:bg-green-50 shadow-lg">
          <ShoppingCart className="h-5 w-5" />Order Now
        </button>
      </section>

      {/* Store Info */}
      <section className="bg-white py-3 border-b">
        <div className="container mx-auto px-4 flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-1"><MapPin className="h-4 w-4 text-green-600" />{s.store_address || "Main Market"}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-green-600" />{s.store_timing || "8 AM - 10 PM"}</span>
          <span className="flex items-center gap-1"><Phone className="h-4 w-4 text-green-600" />{s.store_phone || "9876543210"}</span>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 px-4 container mx-auto">
        <h2 className="text-xl font-bold mb-4">Shop by Category</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {/* All Category */}
          <div
            onClick={() => setSelectedCategory(null)}
            className={`flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm border cursor-pointer transition-all
              ${selectedCategory === null
                ? "border-green-500 bg-green-50 shadow-lg ring-2 ring-green-400"
                : "hover:shadow-lg"
              }`}
          >
            <span className="text-3xl mb-2">🏪</span>
            <span className={`text-xs font-medium text-center ${selectedCategory === null ? "text-green-700" : ""}`}>
              All
            </span>
          </div>
          {categories.map((cat, i) => (
            <div
              key={cat.id}
              onClick={() => setSelectedCategory(prev => prev === cat.name ? null : cat.name)}
              className={`flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm border cursor-pointer transition-all
                ${selectedCategory === cat.name
                  ? "border-green-500 bg-green-50 shadow-lg ring-2 ring-green-400"
                  : "hover:shadow-lg"
                }`}
            >
              <span className="text-3xl mb-2">{emojis[i % emojis.length]}</span>
              <span className={`text-xs font-medium text-center ${selectedCategory === cat.name ? "text-green-700" : ""}`}>
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="py-8 px-4 bg-white">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold">
              {selectedCategory ? `${selectedCategory}` : "Featured Products"}
            </h2>
            <span className="text-xs text-gray-400 ml-auto">{filteredProducts.length} products</span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-5xl block mb-3">🛒</span>
              <p className="font-medium">Is category mein koi product nahi hai</p>
              <button onClick={() => setSelectedCategory(null)} className="mt-4 text-green-600 underline text-sm">
                Sab products dekho
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredProducts.map(p => {
                const cartItem = cart.find(i => i.product.id === p.id);
                return (
                  <div key={p.id} className="bg-gray-50 rounded-2xl p-4 border hover:shadow-lg transition-all">
                    <div className="aspect-square bg-white rounded-xl mb-3 overflow-hidden flex items-center justify-center">
                      {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover rounded-xl" /> : <span className="text-4xl">🛒</span>}
                    </div>
                    <p className="text-xs text-green-600 font-medium">{p.category.name}</p>
                    <h3 className="font-medium text-sm line-clamp-2 h-10 mt-1">{p.name}</h3>
                    <div className="flex items-center justify-between mt-2 mb-3">
                      <span className="text-green-600 font-bold">{formatCurrency(p.sellingPrice)}</span>
                      {p.mrp > p.sellingPrice && <span className="text-xs text-gray-400 line-through">{formatCurrency(p.mrp)}</span>}
                    </div>
                    {cartItem ? (
                      <div className="flex items-center justify-between bg-green-50 rounded-xl p-1">
                        <button onClick={() => updateQty(p.id, cartItem.qty - 1)} className="bg-green-600 text-white rounded-lg w-8 h-8 flex items-center justify-center"><Minus className="h-4 w-4" /></button>
                        <span className="font-bold text-green-700">{cartItem.qty}</span>
                        <button onClick={() => updateQty(p.id, cartItem.qty + 1)} className="bg-green-600 text-white rounded-lg w-8 h-8 flex items-center justify-center"><Plus className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(p)} className="w-full bg-green-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-1">
                        <Plus className="h-4 w-4" />Add to Cart
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black bg-opacity-50" onClick={() => setShowCart(false)} />
          <div className="w-full max-w-sm bg-white flex flex-col h-full shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white">
              <h2 className="text-lg font-bold flex items-center gap-2"><ShoppingCart className="h-5 w-5" />Your Cart ({totalItems})</h2>
              <button onClick={() => setShowCart(false)}><X className="h-6 w-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Cart khali hai!</p>
                  <p className="text-sm mt-1">Products add karo</p>
                </div>
              ) : cart.map(item => (
                <div key={item.product.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-white">
                    {item.product.image ? <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" /> : <span className="text-2xl flex items-center justify-center h-full">🛒</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-green-600">{formatCurrency(item.product.sellingPrice)} x {item.qty}</p>
                    <p className="text-xs font-bold text-green-700">{formatCurrency(item.product.sellingPrice * item.qty)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQty(item.product.id, item.qty - 1)} className="bg-green-600 text-white rounded-lg w-7 h-7 flex items-center justify-center"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.product.id, item.qty + 1)} className="bg-green-600 text-white rounded-lg w-7 h-7 flex items-center justify-center"><Plus className="h-3 w-3" /></button>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-4 border-t bg-white">
                <div className="flex justify-between mb-4">
                  <span className="font-bold text-lg">Total:</span>
                  <span className="font-bold text-lg text-green-600">{formatCurrency(total)}</span>
                </div>
                <button onClick={() => { setShowCart(false); setShowForm(true); }} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-700">
                  <MessageCircle className="h-5 w-5" />Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b bg-green-600 text-white rounded-t-2xl">
              <h2 className="text-lg font-bold">Order Details</h2>
              <button onClick={() => setShowForm(false)}><X className="h-6 w-6" /></button>
            </div>
            <div className="p-4 space-y-3">
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Aapka naam *" className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
              <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone number *" type="tel" className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500" />
              <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Delivery address *" rows={3} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 resize-none" />
              <textarea value={form.note} onChange={e => setForm({...form, note: e.target.value})} placeholder="Order note (optional)" rows={2} className="w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-green-500 resize-none" />
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-sm font-bold text-green-700">Order Summary:</p>
                {cart.map(i => <p key={i.product.id} className="text-xs text-gray-600 mt-1">▪ {i.product.name} x{i.qty} = {formatCurrency(i.product.sellingPrice * i.qty)}</p>)}
                <p className="text-sm font-bold text-green-700 mt-2">Total: {formatCurrency(total)}</p>
              </div>
              <button onClick={sendOrder} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-700">
                <MessageCircle className="h-5 w-5" />Send Order on WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-white py-8 px-4 text-center">
        <p className="font-bold text-lg">{s.store_name || "My Grocery Store"}</p>
        <p className="text-gray-400 mt-1">{s.store_address}</p>
        <p className="text-gray-400">Phone: {s.store_phone}</p>
        <p className="text-gray-500 mt-4 text-sm">2026 All rights reserved</p>
        <p className="text-red-500 mt-8 text-20m">RAMKRISHNA INFOTECH</p>
        <p className="text-white-500 mt-4 text-sm"> Software Develop By Mr. Nitin Thakare Mo. No. 9975162329</p>
      </footer>
    </div>
  );
}
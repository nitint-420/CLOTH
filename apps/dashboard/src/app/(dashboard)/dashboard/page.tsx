export const dynamic = 'force-dynamic';
import { prisma } from "@ecom/database";
import { formatCurrency } from "@ecom/utils";
import { Card, CardContent, Badge } from "@ecom/ui";
import { DollarSign, ShoppingCart, CreditCard, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";


async function getStats() {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const [todayOrders, monthOrders, pending, lowStock, khata, recentOrders] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: today, lt: tomorrow }, status: { not: "CANCELLED" } } }),
    prisma.order.findMany({ where: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } } }),
    prisma.order.count({ where: { status: { in: ["PENDING","CONFIRMED"] } } }),
    prisma.product.count({ where: { isActive: true, stock: { lte: 10 } } }),
    prisma.khataAccount.aggregate({ _sum: { currentBalance: true } }),
    prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" } }),
  ]);
  return {
    todaySales: todayOrders.reduce((s,o) => s+o.totalAmount, 0),
    todayCount: todayOrders.length,
    monthSales: monthOrders.reduce((s,o) => s+o.totalAmount, 0),
    pending, lowStock,
    khataTotal: khata._sum.currentBalance || 0,
    recentOrders,
  };
}

export default async function DashboardPage() {
  const s = await getStats();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold">Dashboard</h1><p className="text-gray-500">Welcome back!</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500">Today Sales</p><p className="text-2xl font-bold mt-1">{formatCurrency(s.todaySales)}</p><p className="text-xs text-gray-400">{s.todayCount} orders</p></div><div className="p-3 bg-green-100 rounded-xl"><DollarSign className="h-5 w-5 text-green-600" /></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500">Month Sales</p><p className="text-2xl font-bold mt-1">{formatCurrency(s.monthSales)}</p></div><div className="p-3 bg-blue-100 rounded-xl"><TrendingUp className="h-5 w-5 text-blue-600" /></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500">Pending Orders</p><p className="text-2xl font-bold mt-1">{s.pending}</p></div><div className="p-3 bg-yellow-100 rounded-xl"><Clock className="h-5 w-5 text-yellow-600" /></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-start justify-between"><div><p className="text-sm text-gray-500">Khata Due</p><p className="text-2xl font-bold mt-1">{formatCurrency(s.khataTotal)}</p></div><div className="p-3 bg-red-100 rounded-xl"><CreditCard className="h-5 w-5 text-red-600" /></div></div></CardContent></Card>
      </div>
      {s.lowStock > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div><p className="font-medium text-yellow-800">{s.lowStock} Products Low on Stock</p><Link href="/dashboard/products" className="text-sm text-yellow-600 hover:underline">View</Link></div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/dashboard/pos" className="flex flex-col items-center justify-center p-6 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-lg"><ShoppingCart className="h-8 w-8 mb-2" /><span className="font-medium">New Sale</span></Link>
        <Link href="/dashboard/products" className="flex flex-col items-center justify-center p-6 bg-white border-2 rounded-xl hover:border-blue-500 hover:shadow"><TrendingUp className="h-8 w-8 mb-2 text-blue-600" /><span className="font-medium">Products</span></Link>
        <Link href="/dashboard/khata" className="flex flex-col items-center justify-center p-6 bg-white border-2 rounded-xl hover:border-purple-500 hover:shadow"><CreditCard className="h-8 w-8 mb-2 text-purple-600" /><span className="font-medium">Khata</span></Link>
        <Link href="/dashboard/reports" className="flex flex-col items-center justify-center p-6 bg-white border-2 rounded-xl hover:border-orange-500 hover:shadow"><TrendingUp className="h-8 w-8 mb-2 text-orange-600" /><span className="font-medium">Reports</span></Link>
      </div>
      <Card><CardContent className="p-4">
        <h3 className="font-semibold mb-4">Recent Orders</h3>
        {s.recentOrders.length === 0 ? <p className="text-gray-500 text-center py-8">No orders yet</p> : (
          <div className="space-y-3">{s.recentOrders.map(o => (
            <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div><p className="font-medium">{o.orderNumber}</p><p className="text-sm text-gray-500">{o.customerName}</p></div>
              <div className="text-right"><p className="font-bold">{formatCurrency(o.totalAmount)}</p><Badge variant={o.status === "DELIVERED" ? "success" : "warning"}>{o.status}</Badge></div>
            </div>
          ))}</div>
        )}
      </CardContent></Card>
    </div>
  );
}


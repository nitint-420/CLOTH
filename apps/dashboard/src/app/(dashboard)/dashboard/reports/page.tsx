import { prisma } from "@ecom/database";
import { formatCurrency } from "@ecom/utils";
import { Card, CardContent } from "@ecom/ui";

export default async function ReportsPage() {
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const orders = await prisma.order.findMany({ where: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } }, include: { items: { include: { product: true } } } });
  const sales = orders.reduce((s: number, o: {totalAmount: number}) => s + o.totalAmount, 0);
  let profit = 0;
  orders.forEach(o => o.items.forEach(i => { profit += (i.unitPrice - (i.product?.costPrice||0)) * i.quantity; }));
  const khata = await prisma.khataAccount.aggregate({ _sum: { currentBalance: true } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports - This Month</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Total Sales</p><p className="text-2xl font-bold text-green-600">{formatCurrency(sales)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Orders</p><p className="text-2xl font-bold">{orders.length}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Profit</p><p className="text-2xl font-bold text-blue-600">{formatCurrency(profit)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Khata Due</p><p className="text-2xl font-bold text-red-600">{formatCurrency(khata._sum.currentBalance||0)}</p></CardContent></Card>
      </div>
    </div>
  );
}

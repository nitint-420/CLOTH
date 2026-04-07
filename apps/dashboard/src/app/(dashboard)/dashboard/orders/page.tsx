import { prisma } from "@ecom/database";
import { formatCurrency, formatDateTime } from "@ecom/utils";
import { Card, CardContent, Badge } from "@ecom/ui";

// export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({ take: 50, orderBy: { createdAt: "desc" }, include: { items: true } });
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders ({orders.length})</h1>
      <div className="space-y-3">
        {orders.length === 0 && <p className="text-center text-gray-500 py-20">No orders yet</p>}
        {orders.map(o => (
          <Card key={o.id}><CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div><p className="font-bold">{o.orderNumber}</p><p className="text-sm text-gray-500">{o.customerName} {o.customerPhone && "| " + o.customerPhone}</p><p className="text-xs text-gray-400">{formatDateTime(o.createdAt)} | {o.items.length} items</p></div>
              <div className="text-right space-y-1"><p className="text-xl font-bold text-green-600">{formatCurrency(o.totalAmount)}</p><Badge variant={o.status === "DELIVERED" ? "success" : o.status === "CANCELLED" ? "destructive" : "warning"}>{o.status}</Badge><Badge variant="secondary" className="ml-1">{o.paymentMethod}</Badge></div>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

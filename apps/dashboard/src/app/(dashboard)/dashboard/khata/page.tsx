import { prisma } from "@ecom/database";
import { formatCurrency } from "@ecom/utils";
import { Card, CardContent } from "@ecom/ui";
import { User } from "lucide-react";

// export const dynamic = "force-dynamic";

export default async function KhataPage() {
  const accounts = await prisma.khataAccount.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const total = accounts.reduce((s, a) => s + a.currentBalance, 0);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h1 className="text-2xl font-bold">Khata Book</h1><div className="text-right"><p className="text-sm text-gray-500">Total Outstanding</p><p className="text-2xl font-bold text-red-600">{formatCurrency(total)}</p></div></div>
      <div className="space-y-3">
        {accounts.map(a => (
          <Card key={a.id}><CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center"><User className="h-6 w-6 text-gray-400" /></div>
              <div className="flex-1"><p className="font-semibold">{a.name}</p><p className="text-sm text-gray-500">{a.phone}</p>{a.address && <p className="text-xs text-gray-400">{a.address}</p>}</div>
              <div className="text-right"><p className={"text-xl font-bold " + (a.currentBalance > 0 ? "text-red-600" : "text-green-600")}>{formatCurrency(a.currentBalance)}</p><p className="text-xs text-gray-400">Limit: {formatCurrency(a.creditLimit)}</p></div>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}

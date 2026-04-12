export const dynamic = 'force-dynamic';
import { prisma } from "@ecom/database";
import { formatCurrency } from "@ecom/utils";
import { Card, CardContent } from "@ecom/ui";
import { User } from "lucide-react";
import { AddKhataButton } from "./AddKhataButton";

type KhataAccount = Awaited<ReturnType<typeof prisma.khataAccount.findMany>>[number];

export default async function KhataPage() {
  const accounts = await prisma.khataAccount.findMany({ where: { isActive: true }, orderBy: { name: "asc" } });
  const total = accounts.reduce((s: number, a: KhataAccount) => s + a.currentBalance, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">Get-ChildItem "
        <h1 className="text-2xl font-bold">Khata Book</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Outstanding</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(total)}</p>
          </div>
          <AddKhataButton />
        </div>
      </div>

      <div className="space-y-3">
        {accounts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Koi khata account nahi hai</p>
            <p className="text-sm mt-1">Upar "Add Khata" button se naya banao</p>
          </div>
        )}
        {accounts.map((a: KhataAccount) => (
          <Card key={a.id}><CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold">{a.name}</p>
                <p className="text-sm text-gray-500">{a.phone}</p>
                {a.address && <p className="text-xs text-gray-400">{a.address}</p>}
              </div>
              <div className="text-right">
                <p className={"text-xl font-bold " + (a.currentBalance > 0 ? "text-red-600" : "text-green-600")}>
                  {formatCurrency(a.currentBalance)}
                </p>
                <p className="text-xs text-gray-400">Limit: {formatCurrency(a.creditLimit)}</p>
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </div>
  );
}
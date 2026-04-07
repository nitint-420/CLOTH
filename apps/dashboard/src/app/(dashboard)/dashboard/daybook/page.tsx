export const dynamic = 'force-dynamic';
import { prisma } from "@ecom/database";
import { formatCurrency } from "@ecom/utils";
import { Card, CardContent } from "@ecom/ui";

<<<<<<< HEAD
// export const dynamic = "force-dynamic";
=======
type Entry = Awaited<ReturnType<typeof prisma.dayBook.findMany>>[number];
>>>>>>> 41cfb7f71a6b465ea6ca924927b74cd04e21f4cc

export default async function DaybookPage() {
  const today = new Date(); today.setHours(0,0,0,0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
  const entries = await prisma.dayBook.findMany({ where: { date: { gte: today, lt: tomorrow } }, orderBy: { createdAt: "desc" } });
  const income = entries.filter((e: Entry) => e.type === "INCOME").reduce((s: number, e: Entry) => s + e.amount, 0);
  const expense = entries.filter((e: Entry) => e.type === "EXPENSE").reduce((s: number, e: Entry) => s + e.amount, 0);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Daybook - Today</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Income</p><p className="text-2xl font-bold text-green-600">+{formatCurrency(income)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Expense</p><p className="text-2xl font-bold text-red-600">-{formatCurrency(expense)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">Net</p><p className={"text-2xl font-bold " + (income-expense >= 0 ? "text-green-600" : "text-red-600")}>{formatCurrency(income-expense)}</p></CardContent></Card>
      </div>
      <Card><CardContent className="p-4">
        {entries.length === 0 ? <p className="text-center text-gray-500 py-12">No entries today</p> : (
          <div className="space-y-3">{entries.map((e: Entry) => (
            <div key={e.id} className={"flex items-center gap-3 p-3 rounded-lg " + (e.type === "INCOME" ? "bg-green-50" : "bg-red-50")}>
              <div className="flex-1"><p className="font-medium">{e.description}</p><p className="text-xs text-gray-500">{e.category}</p></div>
              <span className={"font-bold " + (e.type === "INCOME" ? "text-green-600" : "text-red-600")}>{e.type === "INCOME" ? "+" : "-"}{formatCurrency(e.amount)}</span>
            </div>
          ))}</div>
        )}
      </CardContent></Card>
    </div>
  );
}


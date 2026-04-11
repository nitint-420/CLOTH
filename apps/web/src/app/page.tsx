import { prisma } from "@ecom/database";
import ClientPage from "./ClientPage";
export const dynamic = 'force-dynamic';

async function getData() {
  const [categories, products, settings] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({ 
      where: { isActive: true, stock: { gt: 0 } },
      take: 16,
      include: { category: { select: { name: true } } }
    }),
    prisma.setting.findMany(),
  ]);
  const s: Record<string,string> = {};
  settings.forEach(x => { s[x.key] = x.value; });
  return { categories, products, s };
}

export default async function HomePage() {
  const { categories, products, s } = await getData();
  return <ClientPage categories={categories} products={products} s={s} />;
}
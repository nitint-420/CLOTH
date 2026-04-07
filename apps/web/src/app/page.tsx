import { prisma } from "@ecom/database";
import ClientPage from "./ClientPage";

async function getData() {
  const [categories, products, settings] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
<<<<<<< HEAD
    prisma.product.findMany({
      where: { isActive: true, stock: { gt: 0 } },
      include: { category: { select: { name: true } } },
      orderBy: { isFeatured: "desc" },
    }),
=======
    prisma.product.findMany({ 
  where: { isActive: true, stock: { gt: 0 } },  // ← isFeatured hata diya
  take: 16,
  include: { category: { select: { name: true } } }
}),
>>>>>>> 41cfb7f71a6b465ea6ca924927b74cd04e21f4cc
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
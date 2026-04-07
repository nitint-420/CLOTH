export const dynamic = 'force-dynamic';
import { prisma } from "@ecom/database";
import { formatCurrency } from "@ecom/utils";
import { Card, CardContent, Badge } from "@ecom/ui";
import { Package } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Products ({products.length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map(p => (
          <Card key={p.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                  {p.image
                    ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    : <Package className="h-6 w-6 text-gray-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.sku} | {p.category.name}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-green-600">{formatCurrency(p.sellingPrice)}</span>
                    <Badge variant={p.stock === 0 ? "destructive" : p.stock <= 10 ? "warning" : "success"}>
                      {p.stock} {p.unit}
                    </Badge>
                  </div>
                  <ImageUpload productId={p.id} hasImage={!!p.image} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


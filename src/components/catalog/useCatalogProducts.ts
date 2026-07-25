import { useEffect, useState } from "react";
import { fetchCatalogProducts } from "../../application/commerce";
import type { CatalogCategory, CatalogProduct } from "../../domain/catalog";

export async function loadCatalogProducts(category: CatalogCategory) {
  const products = await fetchCatalogProducts(category);
  return products.filter((product) => product.category === category);
}

export function useCatalogProducts(category: CatalogCategory) {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    loadCatalogProducts(category)
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [category]);

  return { products, loading };
}

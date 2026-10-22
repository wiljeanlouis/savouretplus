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
  const [error, setError] = useState<Error | null>(null);
  const [requestKey, setRequestKey] = useState(0);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError(null);
    loadCatalogProducts(category)
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .catch((cause) => {
        if (!mounted) return;
        setProducts([]);
        setError(cause instanceof Error ? cause : new Error("Impossible de charger le catalogue."));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [category, requestKey]);

  return {
    products,
    loading,
    error,
    retry: () => setRequestKey((current) => current + 1),
  };
}

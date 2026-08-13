import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function useProductDetails(productId) {
    const [product, setProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        async function fetchProductDetails() {
            setLoading(true);
            setError(null);

            try {
                const res = await fetch(`${API}/api/products?all=true`);

                if (!res.ok) {
                    throw new Error("Failed to load products");
                }

                const all = await res.json();

                const normalised = all.map((p) => ({
                    ...p,
                    id: p.productId,
                }));

                const found = normalised.find(
                    (p) => String(p.productId) === String(productId)
                );

                if (!found) {
                    throw new Error("Product not found");
                }

                if (cancelled) return;

                setProducts(normalised);
                setProduct(found);

                setRelated(
                    normalised
                        .filter(
                            (p) =>
                                p.category === found.category &&
                                String(p.productId) !== String(productId)
                        )
                        .slice(0, 4)
                );
            } catch (err) {
                if (!cancelled) {
                    setError(err.message);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchProductDetails();

        return () => {
            cancelled = true;
        };
    }, [productId]);

    return {
        product,
        products,
        related,
        loading,
        error,
    };
}
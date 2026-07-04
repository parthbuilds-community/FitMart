// src/test/CartDrawer.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CartDrawer from "../components/CartDrawer";

// Wrap in MemoryRouter because CartDrawer uses <Link> from react-router-dom
const renderDrawer = (props = {}) => {
  const defaults = {
    isOpen: false,
    onClose: vi.fn(),
    cart: [],
    cartCount: 0,
    cartTotal: 0,
    updateQty: vi.fn(),
    removeFromCart: vi.fn(),
  };
  return render(
    <MemoryRouter>
      <CartDrawer {...defaults} {...props} />
    </MemoryRouter>
  );
};

describe("CartDrawer", () => {
  it("renders the cart heading when open", () => {
    renderDrawer({ isOpen: true });
    expect(screen.getByRole("heading", { name: /cart/i })).toBeInTheDocument();
  });

  it("shows empty-state message when cart is empty", () => {
    renderDrawer({ isOpen: true, cart: [] });
    expect(screen.getByText(/your cart is empty/i)).toBeInTheDocument();
  });

  it("renders a cart item's name when the cart has items", () => {
    const cart = [
      {
        id: "1",
        name: "Whey Protein 1kg",
        brand: "MuscleBlaze",
        price: 1499,
        qty: 2,
        image: null,
      },
    ];
    renderDrawer({ isOpen: true, cart, cartCount: 2, cartTotal: 2998 });
    expect(screen.getByText("Whey Protein 1kg")).toBeInTheDocument();
  });

  it("shows the Checkout button when cart has items", () => {
    const cart = [{ id: "1", name: "Dumbbell Set", price: 3000, qty: 1, image: null }];
    renderDrawer({ isOpen: true, cart, cartCount: 1, cartTotal: 3000 });
    expect(screen.getByRole("button", { name: /checkout/i })).toBeInTheDocument();
  });
});

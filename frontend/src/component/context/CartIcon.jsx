// src/components/CartIcon.jsx
import React from "react";
import { Link } from "react-router-dom";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { useCart } from "./CartContext";

export default function CartIcon() {
  const { cart = [] } = useCart();

  // Calculate total items (unique products)
  const totalItems = cart.length;

  return (
    <Link to="/cartpage" className="relative ">
      <AiOutlineShoppingCart className="text-3xl text-primary" />
      {totalItems > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-slate-900 text-xs w-5 h-5 flex items-center justify-center rounded-full">
          {totalItems}
        </span>
      )}
    </Link>
  );
}

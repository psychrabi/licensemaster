import { useState, useEffect } from 'react';
import { cartManager, type Cart } from '@/lib/cart';

export function useCart() {
  const [cart, setCart] = useState<Cart>(cartManager.getCart());

  useEffect(() => {
    const unsubscribe = cartManager.subscribe(setCart);
    return unsubscribe;
  }, []);

  return {
    cart,
    addToCart: cartManager.addToCart.bind(cartManager),
    updateQuantity: cartManager.updateQuantity.bind(cartManager),
    removeFromCart: cartManager.removeFromCart.bind(cartManager),
    clearCart: cartManager.clearCart.bind(cartManager)
  };
}
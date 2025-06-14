export interface CartItem {
  licenseType: string;
  price: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  itemCount: number;
}

class CartManager {
  private cart: Cart = {
    items: [],
    total: 0,
    itemCount: 0
  };

  private listeners: ((cart: Cart) => void)[] = [];

  addToCart(licenseType: string, price: string): void {
    const existingItem = this.cart.items.find(item => item.licenseType === licenseType);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.items.push({
        licenseType,
        price,
        quantity: 1
      });
    }
    
    this.updateTotals();
    this.notifyListeners();
  }

  updateQuantity(licenseType: string, quantity: number): void {
    const item = this.cart.items.find(item => item.licenseType === licenseType);
    
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(licenseType);
      } else {
        item.quantity = quantity;
        this.updateTotals();
        this.notifyListeners();
      }
    }
  }

  removeFromCart(licenseType: string): void {
    this.cart.items = this.cart.items.filter(item => item.licenseType !== licenseType);
    this.updateTotals();
    this.notifyListeners();
  }

  clearCart(): void {
    this.cart.items = [];
    this.updateTotals();
    this.notifyListeners();
  }

  getCart(): Cart {
    return { ...this.cart };
  }

  private updateTotals(): void {
    this.cart.total = this.cart.items.reduce((sum, item) => {
      return sum + (parseFloat(item.price) * item.quantity);
    }, 0);
    
    this.cart.itemCount = this.cart.items.reduce((sum, item) => {
      return sum + item.quantity;
    }, 0);
  }

  subscribe(listener: (cart: Cart) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.getCart()));
  }
}

export const cartManager = new CartManager();
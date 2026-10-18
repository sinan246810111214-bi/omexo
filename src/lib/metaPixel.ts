declare global {
  interface Window {
    fbq?: (action: string, eventName: string, data?: Record<string, any>) => void;
  }
}

export const pixelEvent = (eventName: string, data?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, data);
  }
};

export const trackViewContent = (product: { id: string; title: string; salePrice: number; category?: string }) => {
  pixelEvent('ViewContent', {
    content_ids: [product.id],
    content_name: product.title,
    content_category: product.category || 'Gadgets',
    value: product.salePrice,
    currency: 'INR'
  });
};

export const trackAddToCart = (product: { id: string; title: string; salePrice: number }, quantity: number = 1) => {
  pixelEvent('AddToCart', {
    content_ids: [product.id],
    content_name: product.title,
    value: product.salePrice * quantity,
    currency: 'INR'
  });
};

export const trackInitiateCheckout = (items: Array<{ product: { id: string; title: string; salePrice: number }; quantity: number }>, totalValue: number) => {
  pixelEvent('InitiateCheckout', {
    content_ids: items.map(item => item.product.id),
    num_items: items.reduce((acc, item) => acc + item.quantity, 0),
    value: totalValue,
    currency: 'INR'
  });
};

export const trackPurchase = (orderId: string, items: Array<{ product: { id: string; title: string; salePrice: number }; quantity: number }>, totalValue: number) => {
  pixelEvent('Purchase', {
    content_ids: items.map(item => item.product.id),
    num_items: items.reduce((acc, item) => acc + item.quantity, 0),
    value: totalValue,
    currency: 'INR',
    order_id: orderId
  });
};

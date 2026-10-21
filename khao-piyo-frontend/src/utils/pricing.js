export const FREE_DELIVERY_ABOVE = 299;
export const DELIVERY_FEE = 40;

// Delivery is free above the threshold (and 0 for an empty cart)
export const getDeliveryFee = (subtotal) =>
  subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
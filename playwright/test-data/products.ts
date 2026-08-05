export const products = {
  // `index` is the app's internal inventory item id stored in the `cart-contents`
  // localStorage entry (see utils/cart.ts) — values discovered by inspecting
  // local storage after adding each item to the cart via the UI.
  backpack: { slug: 'sauce-labs-backpack', name: 'Sauce Labs Backpack', index: 4 },
  bikeLight: { slug: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', index: 0 },
} as const;

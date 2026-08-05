import type { Page } from '@playwright/test';

const CART_STORAGE_KEY = 'cart-contents';

export async function seedCart(page: Page, productIndexes: number[]) {
  await page.addInitScript(
    ({ key, items }) => {
      localStorage.setItem(key, JSON.stringify(items));
    },
    { key: CART_STORAGE_KEY, items: productIndexes },
  );
}

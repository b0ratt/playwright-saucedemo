import { test } from '../../fixtures/base';
import { products } from '../../test-data/products';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.loginViaCookie();
    await inventoryPage.expectLoaded();
  });

  test(
    'TC-05: adding a product updates the cart badge and shows it in the cart',
    { tag: '@smoke' },
    async ({ inventoryPage, cartPage }) => {
      // --- Act ---
      await inventoryPage.addProductToCart(products.backpack.slug);

      // --- Assert ---
      await inventoryPage.expectCartBadgeCount(1);
      await inventoryPage.goToCart();
      await cartPage.expectLoaded();
      await cartPage.expectItemCount(1);
      await cartPage.expectItemVisible(products.backpack.name);
    },
  );

  test(
    'TC-06: adding multiple products increases the cart badge count',
    { tag: '@regression' },
    async ({ inventoryPage }) => {
      // --- Act ---
      await inventoryPage.addProductToCart(products.backpack.slug);
      await inventoryPage.addProductToCart(products.bikeLight.slug);

      // --- Assert ---
      await inventoryPage.expectCartBadgeCount(2);
    },
  );

  test(
    'TC-11: removing the last product from the cart hides the cart badge',
    { tag: '@regression' },
    async ({ inventoryPage }) => {
      // --- Arrange ---
      await inventoryPage.addProductToCart(products.backpack.slug);
      await inventoryPage.expectCartBadgeCount(1);

      // --- Act ---
      await inventoryPage.removeProductFromCart(products.backpack.slug);

      // --- Assert ---
      await inventoryPage.expectCartBadgeHidden();
    },
  );
});

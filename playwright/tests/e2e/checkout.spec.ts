import { test, expect } from '../../fixtures/base';
import { seedCart } from '../../utils/cart';
import { products } from '../../test-data/products';
import { validCustomerInfo } from '../../test-data/checkout';
import type { CartPage } from '../../pages/CartPage';
import type { CheckoutInfoPage } from '../../pages/CheckoutInfoPage';
import type { CheckoutOverviewPage } from '../../pages/CheckoutOverviewPage';

async function openOrderOverview(
  cartPage: CartPage,
  checkoutInfoPage: CheckoutInfoPage,
  checkoutOverviewPage: CheckoutOverviewPage,
) {
  await cartPage.goToCheckout();
  await checkoutInfoPage.expectLoaded();
  await checkoutInfoPage.fillInfo(validCustomerInfo);
  await checkoutInfoPage.continueToOverview();
  await checkoutOverviewPage.expectLoaded();
}

test.describe('Checkout', () => {
  test.beforeEach(async ({ page, cartPage }) => {
    await seedCart(page, [products.backpack.index]);
    await cartPage.loginViaCookie();
    await cartPage.expectLoaded();
  });

  test(
    'TC-07: completing checkout with valid personal info places the order',
    { tag: '@smoke' },
    async ({ cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage }) => {
      // --- Act ---
      await openOrderOverview(cartPage, checkoutInfoPage, checkoutOverviewPage);
      await checkoutOverviewPage.expectItemVisible(products.backpack.name);
      await checkoutOverviewPage.expectTotalsAreConsistent();
      await checkoutOverviewPage.finish();

      // --- Assert ---
      await checkoutCompletePage.expectOrderComplete();
    },
  );

  test(
    'TC-08: continuing without personal info shows a required first name error',
    { tag: '@regression' },
    async ({ cartPage, checkoutInfoPage }) => {
      // --- Act ---
      await cartPage.goToCheckout();
      await checkoutInfoPage.expectLoaded();
      await checkoutInfoPage.continueToOverview();

      // --- Assert ---
      await checkoutInfoPage.expectErrorMessage('Error: First Name is required');
    },
  );

  test(
    'TC-09: canceling the order overview returns to the inventory page',
    { tag: '@regression' },
    async ({ cartPage, checkoutInfoPage, checkoutOverviewPage, inventoryPage }) => {
      // --- Arrange ---
      await openOrderOverview(cartPage, checkoutInfoPage, checkoutOverviewPage);

      // --- Act ---
      await checkoutOverviewPage.cancel();

      // --- Assert ---
      await inventoryPage.expectLoaded();
    },
  );

  test(
    'TC-10: the generated PDF order receipt reflects the placed order',
    { tag: '@regression' },
    async ({ cartPage, checkoutInfoPage, checkoutOverviewPage, checkoutCompletePage }) => {
      // --- Arrange ---
      await openOrderOverview(cartPage, checkoutInfoPage, checkoutOverviewPage);
      const { total } = await checkoutOverviewPage.getTotals();
      await checkoutOverviewPage.finish();
      await checkoutCompletePage.expectOrderComplete();

      // --- Act ---
      const pdfText = await checkoutCompletePage.downloadOrderPdfText();

      // --- Assert ---
      expect(pdfText).toContain('Order Receipt');
      expect(pdfText).toContain(`${validCustomerInfo.firstName} ${validCustomerInfo.lastName}`);
      expect(pdfText).toContain(validCustomerInfo.postalCode);
      expect(pdfText).toContain(products.backpack.name);
      expect(pdfText).toContain(`$${total.toFixed(2)}`);
    },
  );
});

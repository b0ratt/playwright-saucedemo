import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly url = '/inventory.html';
  readonly inventoryList: Locator;
  readonly shoppingCartLink: Locator;
  readonly shoppingCartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryList = page.getByTestId('inventory-list');
    this.shoppingCartLink = page.getByTestId('shopping-cart-link');
    this.shoppingCartBadge = page.getByTestId('shopping-cart-badge');
  }

  private addToCartButton(productSlug: string): Locator {
    return this.page.getByTestId(`add-to-cart-${productSlug}`);
  }

  private removeFromCartButton(productSlug: string): Locator {
    return this.page.getByTestId(`remove-${productSlug}`);
  }

  async addProductToCart(productSlug: string) {
    await this.addToCartButton(productSlug).click();
  }

  async removeProductFromCart(productSlug: string) {
    await this.removeFromCartButton(productSlug).click();
  }

  async expectLoaded() {
    await super.expectLoaded();
    await expect(this.inventoryList).toBeVisible();
  }

  async expectCartBadgeCount(count: number) {
    await expect(this.shoppingCartBadge).toHaveText(String(count));
  }

  async expectCartBadgeHidden() {
    await expect(this.shoppingCartBadge).toBeHidden();
  }

  async goToCart() {
    await this.shoppingCartLink.click();
  }
}

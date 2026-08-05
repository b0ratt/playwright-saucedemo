import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly url = '/inventory.html';
  readonly inventoryList: Locator;

  constructor(page: Page) {
    super(page);
    this.inventoryList = page.getByTestId('inventory-list');
  }

  async expectLoaded() {
    await super.expectLoaded();
    await expect(this.inventoryList).toBeVisible();
  }
}

import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

function parseMoney(text: string): number {
  const match = text.match(/\$([\d.]+)/);
  if (!match) {
    throw new Error(`Could not parse a money value from "${text}"`);
  }
  return Number(match[1]);
}

export class CheckoutOverviewPage extends BasePage {
  readonly url = '/checkout-step-two.html';
  readonly itemName: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemName = page.getByTestId('inventory-item-name');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.cancelButton = page.getByTestId('cancel');
    this.finishButton = page.getByTestId('finish');
  }

  async expectItemVisible(productName: string) {
    await expect(this.itemName).toHaveText(productName);
  }

  async getTotals(): Promise<{ subtotal: number; tax: number; total: number }> {
    const [subtotalText, taxText, totalText] = await Promise.all([
      this.subtotalLabel.innerText(),
      this.taxLabel.innerText(),
      this.totalLabel.innerText(),
    ]);
    return {
      subtotal: parseMoney(subtotalText),
      tax: parseMoney(taxText),
      total: parseMoney(totalText),
    };
  }

  async expectTotalsAreConsistent() {
    const { subtotal, tax, total } = await this.getTotals();
    expect(total).toBeCloseTo(subtotal + tax, 2);
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async finish() {
    await this.finishButton.click();
  }
}

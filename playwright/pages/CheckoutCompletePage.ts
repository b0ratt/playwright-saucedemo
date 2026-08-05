import { expect, type Locator, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { PDFParse } from 'pdf-parse';
import { BasePage } from './BasePage';

export class CheckoutCompletePage extends BasePage {
  readonly url = '/checkout-complete.html';
  readonly completeHeader: Locator;
  readonly generatePdfButton: Locator;

  constructor(page: Page) {
    super(page);
    this.completeHeader = page.getByTestId('complete-header');
    this.generatePdfButton = page.getByTestId('generate-pdf-order');
  }

  async expectOrderComplete() {
    await super.expectLoaded();
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }

  async downloadOrderPdfText(): Promise<string> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.generatePdfButton.click(),
    ]);
    const path = await download.path();
    if (!path) {
      throw new Error('PDF download did not produce a local file path');
    }
    const buffer = await readFile(path);
    const parser = new PDFParse({ data: buffer });
    const { text } = await parser.getText();
    return text;
  }
}

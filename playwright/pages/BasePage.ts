import { expect, type Page } from '@playwright/test';
import { users } from '../test-data/users';

const SESSION_COOKIE_NAME = 'session-username';
const SESSION_COOKIE_DOMAIN = 'www.saucedemo.com';

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export abstract class BasePage {
  protected readonly page: Page;
  abstract readonly url: string;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.url);
  }

  async loginViaCookie(username: string = users.standard.username) {
    await this.page.context().addCookies([
      {
        name: SESSION_COOKIE_NAME,
        value: username,
        domain: SESSION_COOKIE_DOMAIN,
        path: '/',
      },
    ]);
    await this.page.goto(this.url);
  }

  async expectLoaded() {
    await expect(this.page).toHaveURL(new RegExp(escapeRegExp(this.url)));
  }
}

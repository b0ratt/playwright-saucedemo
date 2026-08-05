import { test, expect } from '../../fixtures/base';
import { users, invalidPassword } from '../../test-data/users';

const invalidLoginScenarios = [
  {
    tc: 'TC-02',
    description: 'invalid password shows an error message',
    username: users.standard.username,
    password: invalidPassword,
    expectedError: 'Epic sadface: Username and password do not match any user in this service',
  },
  {
    tc: 'TC-03',
    description: 'locked out user cannot log in',
    username: users.lockedOut.username,
    password: users.lockedOut.password,
    expectedError: 'Epic sadface: Sorry, this user has been locked out.',
  },
  {
    tc: 'TC-04',
    description: 'empty credentials show a required username error',
    username: '',
    password: '',
    expectedError: 'Epic sadface: Username is required',
  },
];

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test(
    'TC-01: valid credentials log the user in and load the inventory page',
    { tag: '@smoke' },
    async ({ page, loginPage, inventoryPage }) => {
      // --- Act ---
      await loginPage.login(users.standard);

      // --- Assert ---
      await inventoryPage.expectLoaded();
      await expect(page).toHaveTitle('Swag Labs');
    },
  );

  for (const scenario of invalidLoginScenarios) {
    test(
      `${scenario.tc}: ${scenario.description}`,
      { tag: '@regression' },
      async ({ loginPage }) => {
        // --- Act ---
        await loginPage.login(scenario);

        // --- Assert ---
        await loginPage.expectErrorMessage(scenario.expectedError);
      },
    );
  }
});

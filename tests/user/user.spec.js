import { expect, test } from '@playwright/test';
import 'dotenv/config';
require('dotenv').config();

test.use({ storageState: 'playwright/.auth/user.json' });

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('As a user, I can update my name', async ({ page }) => {
  await page.getByRole('navigation').getByRole('link').nth(1).click();
  await page.getByRole('button', { name: 'EDIT PROFILE' }).click();
  await page.locator('#input-5').click();
  await page.locator('#input-5').fill(`${process.env.USER_USERNAME}test`);
  await page.getByRole('button', { name: 'Save' }).click();

  // let nameValue = (await page.getByLabel('Name').inputValue());
  // await expect(nameValue).toEqual(`superuser ${formattedDate}`);
});

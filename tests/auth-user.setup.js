import { test as setup, expect } from '@playwright/test';
import 'dotenv/config';
require('dotenv').config();

const user = 'playwright/.auth/user.json';

setup('authenticate as user', async ({ page }) => {
  // Perform authentication steps.
  await page.goto('http://localhost:5173/');
  await page.getByText('Login').click();
  await page.getByLabel('E-mail').click();
  await page.getByLabel('E-mail').fill(process.env.USER_EMAIL);
  await page.getByLabel('Password').fill(process.env.USER_PASSWORD);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(
    page.getByRole('navigation').getByRole('link').nth(1)
  ).toBeVisible();

  await page.context().storageState({ path: user });
});

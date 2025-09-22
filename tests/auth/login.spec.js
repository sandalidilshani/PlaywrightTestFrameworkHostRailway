import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/auth/LoginPage';
import TestDataHelper from '../../utils/TestDataHelper';
import fs from 'fs';
import path from 'path';

let loginPage;
let testData;

test.describe('Login Tests - Comprehensive Suite', () => {
    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        testData = new TestDataHelper();
        await loginPage.navigateToLogin();
    });

    // TC13 - Valid login
    test('TC13 - Valid login with registered credentials', async ({ page }) => {
        const data = testData.getTestDataById('TC13');
        console.log('Test Data for TC13:', data.email);
    
        await loginPage.validLogin(data.email, data.password);
        await expect(page).toHaveURL(/.*dashboard/);

        

        logger.info('TC13 - Test completed successfully');
    });

    // TC14 - Invalid email
    test('TC14 - Invalid login with unregistered email', async ({ page }) => {
        const data = testData.getTestDataById('TC14');
        console.log('Test Data for TC14:', data.email);

        await loginPage.validLogin(data.email, data.password);
        await expect(page.locator('text=Invalid email or password')).toBeVisible();

        logger.info('TC14 - Test completed successfully');
    });
});
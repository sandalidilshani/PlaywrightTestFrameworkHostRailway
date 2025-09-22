export class LoginPage {
    constructor(page) {
        this.page = page;
        this.emailInput = page.locator('input[placeholder="Email Address"]');
        this.passwordInput = page.locator('input[placeholder="Password"]');
        this.loginButton = page.getByRole('button', { name: 'Login' });
        this.forgotPasswordLink = page.getByRole('link', { name: 'Forgot password' });
        this.registerLink = page.getByText('Register Now');
        this.otpInputs = page.locator('input[type="text"]');
        this.newPasswordInput = page.locator('input[name="newPassword"]');
        this.confirmPasswordInput = page.locator('input[name="confirmPassword"]');
        this.resetPasswordButton = page.getByRole('button', { name: 'Reset Password' });
        this.submitButton = page.getByRole('button', { name: 'Send Code' });
        this.logoutButton = page.getByRole('button', { name: 'Logout' });
        this.continueButton = page.getByRole('button', { name: 'Continue' });
    }

    async navigateToLogin() {
        await this.page.goto('/login');
    }

    async login(email, password) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async validLogin(email, password, expectedDashboard = '/dashboard') {
        await this.login(email, password);
        await this.page.waitForSelector(`a[href="${expectedDashboard}"]`, { timeout: 15000 });
    }

    async invalidLogin(email, password) {
        await this.login(email, password);
    }

    async forgotPassword(email) {
        await this.forgotPasswordLink.click();
        await this.emailInput.fill(email);
        await this.submitButton.click();
    }

    async resetPasswordWithOtp(otp, newPassword, confirmPassword) {
        await this.fillOtp(otp);
        await this.newPasswordInput.fill(newPassword);
        await this.confirmPasswordInput.fill(confirmPassword);
        await this.resetPasswordButton.click();
    }
    async fillOtp(otp) {
    for (let i = 0; i < otp.length; i++) {
      await this.otpInputs.nth(i).fill(otp[i]);
    }
    await this.continueButton.click();
  }

    async logout() {
        await this.logoutButton.click();
    }

    async navigateToRegisterFromLogin() {
        
        await this.registerLink.click();
    
    }

    async isPasswordMasked() {
        const passwordType = await this.passwordInput.getAttribute('type');
        return passwordType === 'password';
    }

    async multipleFailedAttempts(email, wrongPassword, attempts) {
        for (let i = 0; i < attempts; i++) {
            await this.invalidLogin(email, wrongPassword);
            if (i < attempts - 1) {
                // Wait a bit between attempts
                await this.page.waitForTimeout(1000);
            }
        }
    }

    async loginAndNavigateToDashboard(email, password) {
        await this.navigateToLogin();
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.loginButton.click();

        // Wait for the dashboard page to load
        await this.page.waitForURL('/dashboard');
    }
}
class ForgotPasswordPage {
    constructor(page) {
        this.page = page;
        this.forgotPasswordButton = 'role=link[name="Forgot password"]';
        this.emailInput = 'input[name="email"]';
        this.sendCodeButton = 'text=Send Code';
        this.otpInputs = page.locator('input[type="text"]');
        this.newPasswordInput = 'input[name="newPassword"]';
        this.confirmPasswordInput = 'input[name="confirmPassword"]';
        this.resetButton = 'text=Reset Password';
        this.submitButton = 'text=Submit';
        this.continueButton = 'text=Continue';
    }

    async navigateToForgotPassword() {
        await this.page.locator(this.forgotPasswordButton).click();
    }

    async navigateToResetPassword() {
        await this.page.goto('/reset-password');
    }

    async submitEmail(email) {
        await this.page.fill(this.emailInput, email);
        await this.page.click(this.sendCodeButton);
    }

    async submitOtpAndPasswords(otp, newPassword, confirmPassword) {
        await this.page.fill(this.otpInput, otp);
        await this.page.fill(this.newPasswordInput, newPassword);
        await this.page.fill(this.confirmPasswordInput, confirmPassword);
        await this.page.click(this.resetButton);
    }

    async forgotPassword(email) {
        await this.page.locator(this.forgotPasswordButton).click();
        await this.page.fill(this.emailInput, email);
        await this.page.click(this.submitButton);
    }

    async resetPasswordWithOtp(otp, newPassword, confirmPassword) {
        await this.fillOtp(otp);
        await this.page.fill(this.newPasswordInput, newPassword);
        await this.page.fill(this.confirmPasswordInput, confirmPassword);
        await this.page.click(this.resetButton);
    }

    async fillOtp(otp) {
    for (let i = 0; i < otp.length; i++) {
        await this.otpInputs.nth(i).fill(otp[i]); // Fill each OTP field
    }
    await this.page.click(this.continueButton); // Click the Continue button
}
}

export default ForgotPasswordPage;

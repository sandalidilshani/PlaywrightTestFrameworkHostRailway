// pages/Logout.js
export class Logout {
  constructor(page) {
    this.page = page;
    this.profileButton = page.locator('button.w-12.h-12.rounded-full');
    this.logoutMenuItem = page.getByRole('menuitem', { name: 'Log Out' });
    this.confirmLogoutButton = page.getByRole('button', { name: 'Yes, Logout' });
    this.cancelLogoutButton = page.getByRole('button', { name: 'Cancel' });
  }

  async logout() {
    await this.profileButton.click();
    await this.logoutMenuItem.click();
    await this.confirmLogoutButton.click();
  }

  async cancelLogout() {
    await this.profileButton.click();
    await this.logoutMenuItem.click();
    await this.cancelLogoutButton.click();
  }

  async verifyLogoutOption() {
    await this.profileButton.click();
    const isVisible = await this.logoutMenuItem.isVisible();
    return isVisible;
  }

  async verifySessionCleared() {
    const cookies = await this.page.context().cookies();
    return cookies.length === 0;
  }

  async verifyRedirectionAfterLogout(expectedURL) {
    await this.logout();
    await this.page.waitForURL(expectedURL);
    return this.page.url() === expectedURL;
  }

  async verifyNoBackNavigation() {
    await this.logout();
    await this.page.goBack();
    return this.page.url().includes('login');
  }

  async verifyLogoutAcrossTabs(context) {
    const [tab1, tab2] = await Promise.all([
      context.newPage(),
      context.newPage()
    ]);

    await tab1.goto('https://app.affooh.com/dashboard');
    await tab2.goto('https://app.affooh.com/dashboard');

    const logout = new Logout(tab1);
    await logout.logout();

    await tab2.reload();
    return tab2.url().includes('login');
  }
}

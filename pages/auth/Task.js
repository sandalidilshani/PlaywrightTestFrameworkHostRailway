exports.ManageSprintPage = class ManageSprintPage {
  constructor(page) {
    this.page = page;
    this.sprintIcon = page.locator('a[href="/sprints"]'); 
  }

  async navigateToSprintTab() {
    await this.sprintIcon.click();
    await this.page.waitForURL(/.*\/sprints/);
  }
};
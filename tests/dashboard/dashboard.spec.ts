import { expect, test } from '@fixtures';

type AllureInterface = {
  feature: (name: string) => void;
  story: (name: string) => void;
  severity: (name: string) => void;
  owner: (name: string) => void;
  description: (text: string) => void;
  tag: (name: string) => void;
};

const { allure } = globalThis as unknown as { allure: AllureInterface };

test.describe('Dashboard', () => {
  test('should display dashboard with welcome message after login @smoke', async ({ dashboardPage }) => {
    allure.feature('Dashboard');
    allure.story('Landing Page');
    allure.severity('critical');
    allure.owner('QA Team');
    allure.description('Verify that the dashboard is displayed after authentication');
    allure.tag('smoke');

    await dashboardPage.navigate('/web/index.php/dashboard/index');
    await dashboardPage.verifyPageLoaded();
  });

  test('should display all top-level navigation menu items @smoke', async ({ dashboardPage }) => {
    allure.feature('Dashboard');
    allure.story('Navigation');
    allure.severity('critical');
    allure.owner('QA Team');
    allure.description('Verify the top-level navigation menu includes the expected items');
    allure.tag('smoke');

    await dashboardPage.navigate('/web/index.php/dashboard/index');
    const labels = await dashboardPage.getAllMenuLabels();
    const expected = ['Admin', 'PIM', 'Leave', 'Time', 'Recruitment', 'My Info', 'Performance', 'Directory', 'Maintenance'];

    for (const label of expected) {
      expect(labels, `Menu should include ${label}`).toContain(label);
    }
  });

  test('should display dashboard quick launch widgets @regression', async ({ dashboardPage }) => {
    allure.feature('Dashboard');
    allure.story('Widgets');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify dashboard quick launch widgets are visible');
    allure.tag('regression');

    await dashboardPage.navigate('/web/index.php/dashboard/index');
    await dashboardPage.verifyWidgetsPresent();
  });

  test('should navigate to PIM module from menu @regression', async ({ dashboardPage }) => {
    allure.feature('Dashboard');
    allure.story('Navigation');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify that PIM module opens when the menu item is clicked');
    allure.tag('regression');

    await dashboardPage.navigate('/web/index.php/dashboard/index');
    await dashboardPage.navigateToModule('PIM');
    await expect(dashboardPage.page).toHaveURL(/pim\/viewEmployeeList/);
  });

  test('should navigate to Leave module from menu @regression', async ({ dashboardPage }) => {
    allure.feature('Dashboard');
    allure.story('Navigation');
    allure.severity('normal');
    allure.owner('QA Team');
    allure.description('Verify that Leave module opens when the menu item is clicked');
    allure.tag('regression');

    await dashboardPage.navigate('/web/index.php/dashboard/index');
    await dashboardPage.navigateToModule('Leave');
    await expect(dashboardPage.page).toHaveURL(/leave\/viewLeaveModule/);
  });

  test('should pass accessibility audit on dashboard @a11y', async ({ dashboardPage }) => {
    allure.feature('Dashboard');
    allure.story('Accessibility');
    allure.severity('minor');
    allure.owner('QA Team');
    allure.description('Verify dashboard page has no critical or serious accessibility violations');
    allure.tag('a11y');

    await dashboardPage.navigate('/web/index.php/dashboard/index');
    await dashboardPage.checkA11y({ tags: ['wcag2a', 'wcag2aa'] });
  });
});

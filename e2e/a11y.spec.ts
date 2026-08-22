import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Automated accessibility gate. Catches the mechanically detectable subset
 * (contrast, names, roles, landmark structure). It does not replace the manual
 * screen-reader pass required by the release gate.
 */
const ROUTES = [
  "/",
  "/studio",
  "/services",
  "/contact",
  "/dev/design-system",
] as const;

for (const route of ROUTES) {
  test(`${route} has no detectable accessibility violations`, async ({ page }) => {
    await page.goto(route);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const summary = results.violations.map(
      (violation) => `${violation.id} (${violation.nodes.length}): ${violation.help}`,
    );

    expect(summary, `axe violations on ${route}`).toEqual([]);
  });
}

test("mobile navigation panel is accessible when open", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: /open menu/i }).click();
  await expect(page.getByRole("dialog", { name: "Site navigation" })).toBeVisible();

  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations.map((violation) => violation.id)).toEqual([]);
});

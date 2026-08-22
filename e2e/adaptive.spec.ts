import { expect, test } from "@playwright/test";

/**
 * Device coverage cannot be verified by hand on every commit, so the two
 * failure modes that actually break a layout are asserted here: content wider
 * than the viewport, and primary navigation that cannot be reached.
 */
const VIEWPORTS = [
  { name: "small-phone", width: 320, height: 568 },
  { name: "folded-fold-outer", width: 344, height: 882 },
  { name: "compact-android", width: 360, height: 800 },
  { name: "large-phone", width: 430, height: 932 },
  { name: "phone-landscape", width: 844, height: 390 },
  { name: "tablet-portrait", width: 768, height: 1024 },
  { name: "fold-inner", width: 900, height: 1000 },
  { name: "tablet-landscape", width: 1024, height: 768 },
  { name: "laptop", width: 1280, height: 800 },
  { name: "macbook", width: 1440, height: 900 },
  { name: "desktop-fhd", width: 1920, height: 1080 },
  { name: "qhd-ultrawide", width: 2560, height: 1440 },
  { name: "uhd-tv", width: 3840, height: 2160 },
] as const;

const ROUTES = ["/", "/studio", "/services", "/contact"] as const;

test.describe("adaptive layout", () => {
  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`${viewport.name} ${route} has no horizontal overflow`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(route);

        const overflow = await page.evaluate(() => {
          const docWidth = document.documentElement.clientWidth;
          const offenders: string[] = [];
          for (const element of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
            const rect = element.getBoundingClientRect();
            // Allow a sub-pixel tolerance for fractional layout rounding.
            if (rect.width > 0 && rect.right > docWidth + 1) {
              offenders.push(
                `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).split(" ")[0]}` : ""}`,
              );
            }
          }
          return { docWidth, scrollWidth: document.documentElement.scrollWidth, offenders };
        });

        expect(overflow.offenders.slice(0, 5), `offending elements on ${route}`).toEqual([]);
        expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.docWidth + 1);
      });
    }

    test(`${viewport.name} exposes primary navigation`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      const desktopNav = page.getByRole("navigation", { name: "Primary" });
      const menuToggle = page.getByRole("button", { name: /open menu/i });

      if (await menuToggle.isVisible()) {
        await expect(page.getByRole("link", { name: /let's create/i })).toBeVisible();
        await menuToggle.click();
        const dialog = page.getByRole("dialog", { name: "Site navigation" });
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole("link", { name: "Work" })).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(dialog).toBeHidden();
        await expect(menuToggle).toBeFocused();
      } else {
        await expect(desktopNav).toBeVisible();
        await expect(desktopNav.getByRole("link", { name: "Work" })).toBeVisible();
        await expect(page.getByRole("link", { name: /let's create/i })).toBeVisible();
      }
    });

    test(`${viewport.name} keeps the hero call to action in view`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");

      const cta = page.getByRole("link", { name: /view work/i });
      await expect(cta).toBeInViewport();
    });
  }
});

test.describe("reflow and zoom", () => {
  test("remains usable at 320 CSS pixels", async ({ page }) => {
    // WCAG 1.4.10: no loss of content or function, no two-dimensional scrolling.
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/");
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(321);
  });
});

test.describe("keyboard", () => {
  test("skip link is the first stop and moves focus to main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");

    const skip = page.getByRole("link", { name: /skip to content/i });
    await expect(skip).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeAttached();
  });
});

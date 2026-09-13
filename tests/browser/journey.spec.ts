import { test, expect } from "@playwright/test";
import { GAME_LEVELS } from "../../game/levels";
import { solve } from "../../game/engine";
test("complete every level, save progress, revisit, and render without errors", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A change of perspective." }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("home.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Reduce motion").check();
  await page.getByRole("button", { name: "Close panel" }).click();
  await page.getByRole("button", { name: /Begin the ascent/ }).click();
  await expect(page.locator("canvas")).toBeVisible();
  for (let i = 0; i < GAME_LEVELS.length; i++) {
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      GAME_LEVELS[i].title,
    );
    if (i === 0 || i === 23)
      await page.screenshot({
        path: testInfo.outputPath(`level-${i + 1}.png`),
        fullPage: true,
      });
    const solution = solve(GAME_LEVELS[i])!;
    for (const a of solution) {
      if (a.type === "view")
        await page
          .getByRole("button", {
            name: `Frame ${["I", "II", "III", "IV"][a.view]}`,
            exact: true,
          })
          .click();
      else {
        await page.getByLabel("Select surface").selectOption(a.id);
        await page
          .getByRole("button", {
            name: a.type === "walk" ? /Walk here/ : /Operate handle/,
          })
          .click();
      }
      await expect(page.locator('[role="status"]')).not.toHaveText(
        "Architecture in motion…",
      );
    }
    await expect(
      page.getByRole("dialog", { name: "One step higher." }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name:
          i === GAME_LEVELS.length - 1
            ? /See the completed ascent/
            : /Next space/,
      })
      .click();
  }
  await expect(
    page.getByRole("heading", { name: "You found another way." }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("ending.png"),
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole("button", { name: /Chapters 26\/26/ }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("normal motion serializes input; undo and restart restore state", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Begin the ascent/ }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await page.getByLabel("Select surface").selectOption("bridge");
  await page.getByRole("button", { name: /Operate handle/ }).click();
  await expect(
    page.getByRole("button", { name: /Operate handle/ }),
  ).toBeDisabled();
  await expect(page.locator('[role="status"]')).not.toHaveText(
    "Architecture in motion…",
  );
  await expect(page.getByRole("button", { name: /Walk here/ })).toBeEnabled();
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByRole("button", { name: /Walk here/ })).toBeDisabled();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Close panel" }).press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Restart", exact: true }).click();
  await expect(page.getByText("0 moves", { exact: true })).toBeVisible();
});

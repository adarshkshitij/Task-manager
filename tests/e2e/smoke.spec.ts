import { expect, test, type Page } from "@playwright/test";

const smokeProjectName = `Smoke Project ${Date.now()}`;
const smokeTaskName = `Smoke Task ${Date.now()}`;

async function login(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Login" }).click();
  await page.waitForURL("**/dashboard");
}

test.describe.serial("team task manager smoke flows", () => {
  test("admin logs in, creates a project, adds member, and creates a task", async ({ page }) => {
    await login(page, "admin@example.com", "Admin@123");

    await expect(page.getByText("Demo cockpit")).toBeVisible();

    await page.goto("/projects");
    await page.getByLabel("Project name").fill(smokeProjectName);
    await page.getByLabel("Description").fill("Created by the Playwright smoke suite.");
    await page.getByRole("button", { name: "Create project" }).click();

    const projectLink = page.getByRole("link", { name: new RegExp(smokeProjectName) });
    await expect(projectLink).toBeVisible();
    await projectLink.click();

    await page.getByLabel("Select user").selectOption({
      label: "Team Member (MEMBER) - member@example.com",
    });
    await page.getByRole("button", { name: "Add member" }).click();
    await expect(
      page.locator("p").filter({ hasText: "member@example.com" }).first(),
    ).toBeVisible();

    await page.getByLabel("Task title").fill(smokeTaskName);
    await page.getByLabel("Description").fill("Smoke assignment task.");
    await page.getByLabel("Assign to").selectOption({
      label: "Team Member - member@example.com",
    });
    await page.getByLabel("Priority").selectOption("HIGH");
    await page.getByLabel("Initial status").selectOption("TODO");
    await page.getByLabel("Due date").fill("2030-01-15");
    await page.getByRole("button", { name: "Create task" }).click();

    await expect(page.getByText(smokeTaskName)).toBeVisible();
  });

  test("member logs in, sees assigned task, updates status, and is blocked from admin API", async ({
    page,
  }) => {
    await login(page, "member@example.com", "Member@123");

    await page.goto("/tasks");
    const smokeHeading = page.getByRole("heading", { name: smokeTaskName, exact: true }).first();
    await expect(smokeHeading).toBeVisible();

    const smokeCard = page.locator("div").filter({ has: smokeHeading }).first();
    await smokeCard.locator("select").first().selectOption("DONE");
    await expect.poll(async () => smokeCard.locator("select").first().inputValue()).toBe("DONE");

    const forbiddenStatus = await page.evaluate(async () => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Forbidden project",
          description: "Members should not be able to create this.",
        }),
      });

      return response.status;
    });

    expect(forbiddenStatus).toBe(403);
  });

  test("admin can delete the smoke task", async ({ page }) => {
    await login(page, "admin@example.com", "Admin@123");

    await page.goto("/tasks");
    const smokeHeading = page.getByRole("heading", { name: smokeTaskName, exact: true }).first();
    const smokeCard = smokeHeading.locator(
      "xpath=ancestor::div[contains(@class,'rounded-[24px] border p-5')][1]",
    );
    await expect(smokeCard).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await smokeCard.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText(smokeTaskName)).toHaveCount(0);
  });
});

import { test, expect, Page } from "@playwright/test"
import { HOMEPAGE_URL } from "../constants"
import {
  mockHistoryEmptyResponse,
  mockHistoryOneUrlResponse,
  mockHistoryMultiplePageUrlResponse,
  mockLoginSuccessAuthResponse,
} from "./accountMocks"

async function navigateToLoginPage(page: Page) {
  await page.goto(HOMEPAGE_URL)
  await page.getByRole("link", { name: "Login" }).click()
}

async function login(page: Page, username: string) {
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible()
  await page.getByLabel("username").fill(username)
  await page.getByLabel("password").fill("test_password")
  await page.getByRole("button", { name: "Sign in" }).click()
}

// "/history" page feature - user created short urls
test.beforeEach(async ({ page, browser }) => {
  await navigateToLoginPage(page)
  const browserContext = await browser.newContext()
  await mockLoginSuccessAuthResponse(page, browserContext)
})

test("show history link and welcome message on homepage after login", async ({
  page,
}) => {
  await login(page, "test_username")
  await expect(page.getByRole("link", { name: "History" })).toBeVisible()
  await expect(
    page.getByText("👋 Welcome back test_username", { exact: true })
  ).toBeVisible()
})

test("logged out user should see 404 error when accessing /history route", async ({
  page,
}) => {
  await page.goto(HOMEPAGE_URL + "/history")
  await expect(page.getByText("Error - 404 Not Found")).toBeVisible()
  expect(page.url()).not.toContain("/history")
  expect(page.url()).toContain("/error")
})

test("shows empty history page when user has not created any short urls", async ({
  page,
}) => {
  await mockHistoryEmptyResponse(page)
  await login(page, "test_username")
  await page.getByRole("link", { name: "History" }).click()
  await expect(
    page.getByText("You have not created any short urls")
  ).toBeVisible()
})

test("shows history page with one created url", async ({ page }) => {
  const expectedData = { url: "https://github.com/", shortCode: "abcdef2" }
  await mockHistoryOneUrlResponse(page, expectedData)
  await login(page, "test_username")
  await page.getByRole("link", { name: "History" }).click()
  await expect(
    page.getByText("You have not created any short urls")
  ).not.toBeVisible()
  await expect(page.getByText(expectedData.url)).toBeVisible()
  await expect(page.getByText(expectedData.shortCode)).toBeVisible()
  await expect(page.getByText("Never Updated")).not.toBeVisible()
})

test("shows previous and next buttons on history page", async ({ page }) => {
  const expectedData = { url: "https://github.com/", shortCode: "abcdef2" }
  await mockHistoryOneUrlResponse(page, expectedData)
  await login(page, "test_username")
  await page.getByRole("link", { name: "History" }).click()
  await expect(page.getByRole("button", { name: "Previous" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Next" })).toBeVisible()
})

test("disable previous and next buttons for one url", async ({ page }) => {
  const expectedData = { url: "https://github.com/", shortCode: "abcdef2" }
  await mockHistoryOneUrlResponse(page, expectedData)
  await login(page, "test_username")
  await page.getByRole("link", { name: "History" }).click()
  await expect(page.getByRole("button", { name: "Previous" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Next" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled()
})

test("navigate to next page for 11 urls", async ({ page }) => {
  const itemsPerPage = 10
  const data = [
    { url: "https://github.com/", shortCode: "1bcdef2" },
    { url: "https://youtube.com/", shortCode: "2bcdef2" },
    {
      url: "https://www.youtube.com/watch?v=MIzNRcUz3Bk",
      shortCode: "3bcdef3",
    },
    { url: "https://example.com/", shortCode: "4bcdef4" },
    { url: "https://haveibeenpwned.com/", shortCode: "5bcdef5" },
    { url: "https://developer.mozilla.org/en-US/", shortCode: "6bcdef6" },
    {
      url: "https://www.youtube.com/watch?v=bq-xWdJrBJ0",
      shortCode: "7bcdef7",
    },
    {
      url: "https://tailwindcss.com/docs/customizing-colors",
      shortCode: "8bcdef8",
    },
    {
      url: "https://www.youtube.com/watch?v=z0nZAXyF2BU",
      shortCode: "9bcdef9",
    },
    { url: "https://vitest.dev/", shortCode: "abcdefa" },
    { url: "https://vitest.dev/guide/", shortCode: "bdddefb" },
  ]
  await mockHistoryMultiplePageUrlResponse(page, itemsPerPage, data)
  await login(page, "test_username")
  await page.getByRole("link", { name: "History", exact: true }).click()
  await expect(page.getByRole("button", { name: "Previous" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled()
  await expect(page.getByRole("button", { name: "Next" })).toBeVisible()
  await expect(page.getByRole("button", { name: "Next" })).not.toBeDisabled()
  await expect(page.getByRole("button", { name: "1" })).toBeVisible()
  await expect(page.getByRole("button", { name: "2" })).toBeVisible()

  await page.getByRole("button", { name: "Next" }).click()

  await expect(
    page.getByRole("button", { name: "Previous" })
  ).not.toBeDisabled()
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled()
})

test("navigate to page using page item button for 11 urls", async ({
  page,
}) => {
  const itemsPerPage = 10
  const data = [
    { url: "https://github.com/", shortCode: "1bcdef2" },
    { url: "https://youtube.com/", shortCode: "2bcdef2" },
    { url: "https://github.com/", shortCode: "3bcdef3" },
    { url: "https://example.com/", shortCode: "4bcdef4" },
    { url: "https://haveibeenpwned.com/", shortCode: "5bcdef5" },
    { url: "https://developer.mozilla.org/en-US/", shortCode: "6bcdef6" },
    { url: "https://github.com/", shortCode: "7bcdef7" },
    { url: "https://github.com/", shortCode: "8bcdef8" },
    { url: "https://github.com/", shortCode: "9bcdef9" },
    { url: "https://vitest.dev/", shortCode: "abcdefa" },
    { url: "https://vitest.dev/guide/", shortCode: "bdddefb" },
  ]
  await mockHistoryMultiplePageUrlResponse(page, itemsPerPage, data)
  await login(page, "test_username")
  await page.getByRole("link", { name: "History" }).click()
  await expect(page.getByRole("button", { name: "1" })).toBeVisible()
  await expect(page.getByRole("button", { name: "2" })).toBeVisible()
  await expect(page.getByText(data[9].url)).toBeVisible()
  await expect(page.getByText(data[9].shortCode)).toBeVisible()
  await expect(page.getByText(data[10].url)).not.toBeVisible()
  await expect(page.getByText(data[10].shortCode)).not.toBeVisible()

  await page.getByRole("button", { name: "2" }).click()

  await expect(
    page.getByRole("button", { name: "Previous" })
  ).not.toBeDisabled()
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled()
  await expect(page.getByRole("button", { name: "2" })).toHaveClass(
    /active-tab/
  )
  await expect(page.getByText(data[10].url)).toBeVisible()
  await expect(page.getByText(data[10].shortCode)).toBeVisible()
})

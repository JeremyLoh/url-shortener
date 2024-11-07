import { BrowserContext, expect, Page } from "@playwright/test"

async function mockLoginRateLimitExceededEndpoint(
  page: Page,
  timeoutInSeconds: number
) {
  await page.route("*/**/api/auth/users", async (route) => {
    const request = route.request()
    expect(request.method()).toBe("POST")
    await route.fulfill({
      status: 429,
      headers: { "retry-after": `${timeoutInSeconds}` },
      json: "Too many requests, please try again later.",
    })
  })
}

async function mockCreateAccountSuccessEndpoint(page: Page) {
  await page.route("*/**/api/auth/users", async (route) => {
    const request = route.request()
    expect(request.method()).toBe("POST")
    await route.fulfill({
      status: 201,
      json: "Created",
    })
  })
}

async function mockLoginSuccessAuthResponse(
  page: Page,
  browserContext: BrowserContext
) {
  await page.route("*/**/api/auth/login", async (route) => {
    const request = route.request()
    expect(request.method()).toBe("POST")
    const mockUserResponseJson = {
      id: "12",
    }
    const mockCookieHeader =
      "connect.sid=s%2testCookie123456789abcdefyaac22033.97sirrrarrdseewreerrjtt3tteeeaabbbggiedefabc; Path=/; Expires=Mon, 21 Oct 2024 06:40:22 GMT; HttpOnly"
    await route.fulfill({
      status: 200,
      json: mockUserResponseJson,
      headers: { "set-cookie": mockCookieHeader },
    })
    await browserContext.addCookies([
      {
        name: "connect.sid",
        value:
          "s%2testCookie123456789abcdefyaac22033.97sirrrarrdseewreerrjtt3tteeeaabbbggiedefabc",
        domain: "localhost",
        path: "/",
      },
    ])
  })
}

async function mockLogoutSuccessResponse(page: Page) {
  await page.route("*/**/api/auth/logout", async (route) => {
    const request = route.request()
    expect(request.method()).toBe("POST")
    const mockCookieHeader =
      "connect.sid=s%2testCookie123456789abcdefyaac22033.97sirrrarrdseewreerrjtt3tteeeaabbbggiedefabc; Path=/; Expires=Mon, 21 Oct 2024 06:40:22 GMT; HttpOnly"
    await route.fulfill({
      status: 200,
      headers: { "set-cookie": mockCookieHeader },
    })
  })
}

async function mockHistoryEmptyResponse(page: Page) {
  await page.route("*/**/api/account/history", async (route) => {
    const request = route.request()
    expect(request.method()).toBe("POST")
    await route.fulfill({
      status: 200,
      json: { urls: [] },
    })
  })
}

async function mockHistoryOneUrlResponse(
  page: Page,
  data: { url: string; shortCode: string }
) {
  await page.route("*/**/api/account/history", async (route) => {
    const request = route.request()
    expect(request.method()).toBe("POST")
    await route.fulfill({
      status: 200,
      json: {
        urls: [
          {
            id: "1",
            url: data.url,
            shortCode: data.shortCode,
            createdAt: "2024-11-06T15:26:11.314Z",
            updatedAt: "2024-11-06T15:56:41.514Z",
          },
        ],
      },
    })
  })
}

export {
  mockLoginRateLimitExceededEndpoint,
  mockCreateAccountSuccessEndpoint,
  mockLoginSuccessAuthResponse,
  mockLogoutSuccessResponse,
  mockHistoryEmptyResponse,
  mockHistoryOneUrlResponse,
}
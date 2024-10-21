import ky from "ky"

interface User {
  id: string
}

async function login(username: string, password: string): Promise<User> {
  try {
    const response = await ky.post("/api/auth/login", {
      json: { username, password },
      retry: { limit: 0 },
    })
    if (response.status !== 200) {
      throw new Error("Invalid username / password")
    }
    return response.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response.status === 401) {
      throw new Error("Invalid username / password")
    }
    if (error.response.status === 429) {
      const timeoutInSeconds = error.response.headers.get("retry-after")
      throw new Error(
        `Rate Limit Exceeded, please try again after ${timeoutInSeconds} seconds`
      )
    }
    throw error
  }
}

export { login }
export type { User }

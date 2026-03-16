declare module '#auth-utils' {
  interface User {
    name: string
    role: string
    email?: string
  }

  interface UserSession {}

  interface SecureSessionData {}
}

export {}

declare module '#auth-utils' {
  interface User {
    name: string
    role: string
  }

  interface UserSession {}

  interface SecureSessionData {}
}

export {}

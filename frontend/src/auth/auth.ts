export function isLoggedIn() {
  return Boolean(localStorage.getItem('token'))
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function getUserId(): string {
  return localStorage.getItem('userId') ?? 'u-unknown'
}

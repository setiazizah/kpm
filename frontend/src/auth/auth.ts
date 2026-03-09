export function isLoggedIn() {
  return Boolean(localStorage.getItem('token'))
}

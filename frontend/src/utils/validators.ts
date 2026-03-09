export function isEmail(s: string) {
  return /\S+@\S+\.\S+/.test(s)
}

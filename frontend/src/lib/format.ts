export function formatCurrency(n: number) {
  return n.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' })
}

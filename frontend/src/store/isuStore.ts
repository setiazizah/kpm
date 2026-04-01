export type { PlatformDist, IsuDetail } from '../types/isu'
export { ISU_DETAIL_MAP } from '../data/isuDetail'

// ── Singleton state ───────────────────────────────────────────────
import type { IsuDetail } from '../types/isu'

let _selected: IsuDetail | null = null

export function getSelectedIsu(): IsuDetail | null {
  return _selected
}

export function setSelectedIsu(isu: IsuDetail | null): void {
  _selected = isu
}

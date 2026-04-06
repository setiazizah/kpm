export interface LabelCard {
  id: number
  platform: string
  author: string
  waktu: string
  artId: string
  konten: string
  labels: string[]
  selectedLabels: string[]
  status: 'pending' | 'saved' | 'skipped'
}

export const INITIAL_CARDS: LabelCard[] = [
  {
    id: 0, platform: 'TikTok', author: '@user_xyz', waktu: '4 jam lalu', artId: 'art_20260304_0041',
    konten: '"Kemarin gue coba daftar program KIP Kuliah tapi sistemnya error terus dari pagi. Udah 3 jam nunggu antrian online ga jalan-jalan. Ini gimana sih pemerintah? Deadline pendaftaran tinggal 2 hari lagi."',
    labels: ['pemerintahan','pendidikan','keluhan','digital','kebijakan','hoaks','sosial'],
    selectedLabels: ['keluhan'], status: 'pending',
  },
  {
    id: 1, platform: 'Instagram', author: '@kominfo_watch', waktu: '6 jam lalu', artId: 'art_20260304_0038',
    konten: '"Salut sama langkah Komdigi yang akhirnya blokir konten judi online di 3 platform besar. Ini langkah konkret yang sudah ditunggu-tunggu. Semoga konsisten!"',
    labels: ['digital','kebijakan','komdigi','pemerintahan','hukum','apresiasi'],
    selectedLabels: ['digital','kebijakan'], status: 'pending',
  },
  {
    id: 2, platform: 'Twitter/X', author: '@wargadigital', waktu: '8 jam lalu', artId: 'art_20260304_0034',
    konten: '"Sinyal di kampung saya masih 2G sejak 2015 padahal kata pemerintah sudah 100% terkoneksi. Internet gratis desa itu nyata atau hanya slogan?"',
    labels: ['digital','konektivitas','keluhan','pemerintahan','infrastruktur'],
    selectedLabels: ['digital','keluhan'], status: 'pending',
  },
]

export const PLATFORM_COLOR: Record<string, string> = {
  'TikTok':    'bg-success-dim text-success',
  'Instagram': 'bg-primary-dim text-primary',
  'Twitter/X': 'bg-warning-dim text-warning',
}

import type { WorkflowChannel, WorkflowTone } from '../types/workflow'

export const CHANNEL_OPTIONS: { value: WorkflowChannel; label: string }[] = [
  { value: 'press',    label: 'Press / Media' },
  { value: 'social',   label: 'Social Media'  },
  { value: 'internal', label: 'Internal'       },
]

export const TONE_OPTIONS: { value: WorkflowTone; label: string }[] = [
  { value: 'formal',      label: 'Formal'      },
  { value: 'semi-formal', label: 'Semi-Formal' },
  { value: 'informal',    label: 'Informal'    },
]

export const QUICK_PROMPTS = [
  'Apa isu viral hari ini?',
  'Analisis sentimen kebijakan terbaru',
  'Hoaks yang perlu segera direspon',
  'Rekomendasi narasi counter-isu',
]

export const CHAT_QUICK_PROMPTS = [
  'Platform dominan?',
  'Detail sentimen',
  'Siapa penyebar?',
  'Generate narasi',
]

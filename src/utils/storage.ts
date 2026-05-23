import type { CustomTactic } from '../types/tactic'

const STORAGE_KEY = 'hoopmind-custom-tactics'

const safeParse = (value: string | null): CustomTactic[] => {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const write = (tactics: CustomTactic[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tactics))
}

export const getCustomTactics = (): CustomTactic[] => {
  if (typeof window === 'undefined') return []
  return safeParse(localStorage.getItem(STORAGE_KEY))
}

export const saveCustomTactic = (tactic: CustomTactic) => {
  const tactics = getCustomTactics()
  write([tactic, ...tactics.filter((item) => item.id !== tactic.id)])
}

export const updateCustomTactic = (tactic: CustomTactic) => {
  const tactics = getCustomTactics()
  write(tactics.map((item) => (item.id === tactic.id ? tactic : item)))
}

export const deleteCustomTactic = (id: string) => {
  write(getCustomTactics().filter((item) => item.id !== id))
}

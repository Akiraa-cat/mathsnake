import type { Theme } from './useTheme'

export const SKINS = [
  { id: 'forest', name: 'Forest', light: '#477A50', dark: '#8BBF83' },
  { id: 'ocean', name: 'Ocean', light: '#397CA5', dark: '#6BAED6' },
  { id: 'plum', name: 'Plum', light: '#8A648F', dark: '#B58FBA' },
  { id: 'amber', name: 'Amber', light: '#C58B35', dark: '#E0AE5C' },
  { id: 'coral', name: 'Coral', light: '#D96B59', dark: '#EE8B7A' }
] as const

export function useSnakeSkin() {
  const skinId = ref<string>('forest')
  onMounted(() => {
    try { const v = localStorage.getItem('mathsnake:skin'); if (SKINS.some(s => s.id === v)) skinId.value = v! } catch { /* ignore */ }
  })
  function select(id: string) {
    skinId.value = id
    try { localStorage.setItem('mathsnake:skin', id) } catch { /* ignore */ }
  }
  const color = (theme: Theme) => {
    const s = SKINS.find(k => k.id === skinId.value) ?? SKINS[0]
    return theme === 'dark' ? s.dark : s.light
  }
  return { skinId, select, color }
}

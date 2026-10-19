export type Theme = 'light' | 'dark'

export function useTheme() {
  const theme = ref<Theme>('light')
  onMounted(() => { theme.value = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light' })
  function toggle() {
    const next: Theme = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next // before ref change so Canvas redraw reads new tokens
    try { localStorage.setItem('mathsnake:theme', next) } catch { /* storage unavailable */ }
    theme.value = next
  }
  return { theme, toggle }
}

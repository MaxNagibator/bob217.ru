export const LANG_COLORS: Record<string, string> = {
  'C#': '#4caf50',
  Vue: '#42b883',
  JavaScript: '#f1e05a',
  HTML: '#e34c26',
  Go: '#00add8',
  Python: '#3572a5',
  SCSS: '#c6538c',
  PowerShell: '#5391fe',
  прочее: '#9a9a9a',
}

export const LANG_SHORT: Record<string, string> = {
  JavaScript: 'JS',
}

export const langColor = (lang: string): string => LANG_COLORS[lang] ?? '#9a9a9a'

import { Lunar } from 'lunar-javascript'

// Lunar month names
export const LUNAR_MONTHS = [
  { value: 1, label: '正月' },
  { value: 2, label: '二月' },
  { value: 3, label: '三月' },
  { value: 4, label: '四月' },
  { value: 5, label: '五月' },
  { value: 6, label: '六月' },
  { value: 7, label: '七月' },
  { value: 8, label: '八月' },
  { value: 9, label: '九月' },
  { value: 10, label: '十月' },
  { value: 11, label: '冬月' },
  { value: 12, label: '腊月' },
]

// Lunar day names
export const LUNAR_DAYS = [
  { value: 1, label: '初一' },
  { value: 2, label: '初二' },
  { value: 3, label: '初三' },
  { value: 4, label: '初四' },
  { value: 5, label: '初五' },
  { value: 6, label: '初六' },
  { value: 7, label: '初七' },
  { value: 8, label: '初八' },
  { value: 9, label: '初九' },
  { value: 10, label: '初十' },
  { value: 11, label: '十一' },
  { value: 12, label: '十二' },
  { value: 13, label: '十三' },
  { value: 14, label: '十四' },
  { value: 15, label: '十五' },
  { value: 16, label: '十六' },
  { value: 17, label: '十七' },
  { value: 18, label: '十八' },
  { value: 19, label: '十九' },
  { value: 20, label: '二十' },
  { value: 21, label: '廿一' },
  { value: 22, label: '廿二' },
  { value: 23, label: '廿三' },
  { value: 24, label: '廿四' },
  { value: 25, label: '廿五' },
  { value: 26, label: '廿六' },
  { value: 27, label: '廿七' },
  { value: 28, label: '廿八' },
  { value: 29, label: '廿九' },
  { value: 30, label: '三十' },
]

// Parse lunar date string "L:month:day"
export function parseLunarDate(dateStr: string): { month: number; day: number } | null {
  if (!dateStr.startsWith('L:')) return null
  const parts = dateStr.split(':')
  if (parts.length !== 3) return null
  const month = parseInt(parts[1], 10)
  const day = parseInt(parts[2], 10)
  if (isNaN(month) || isNaN(day)) return null
  return { month, day }
}

// Encode lunar date to string format
export function encodeLunarDate(month: number, day: number): string {
  return `L:${month}:${day}`
}

// Get lunar date display string
export function getLunarDateDisplay(month: number, day: number): string {
  const monthName = LUNAR_MONTHS.find(m => m.value === month)?.label || `${month}月`
  const dayName = LUNAR_DAYS.find(d => d.value === day)?.label || `${day}`
  return `${monthName}${dayName}`
}

// Get next solar date for a lunar yearly reminder
export function getNextLunarOccurrence(month: number, day: number): string {
  const today = new Date()
  const currentYear = today.getFullYear()

  // Try current year first
  for (let year = currentYear; year <= currentYear + 1; year++) {
    try {
      const lunar = Lunar.fromYmd(year, month, day)
      const solar = lunar.getSolar()
      const solarDate = solar.toYmd()
      const solarDateObj = new Date(solarDate + 'T00:00:00')

      if (solarDateObj >= today) {
        return solarDate
      }
    } catch {
      // Invalid lunar date, try next year
      continue
    }
  }

  // Fallback to current year solar date
  return `${currentYear}-01-01`
}

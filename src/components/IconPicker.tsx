import { useState, useMemo } from 'react'
import { ICON_REGISTRY, type IconGroup, type IconEntry } from '../lib/iconRegistry'
import { Search, Check } from 'lucide-react'

const GROUP_LABELS: Record<IconGroup, { label: string; emoji: string }> = {
  shoes:       { label: 'Обувь',       emoji: '👟' },
  clothes:     { label: 'Одежда',      emoji: '👕' },
  accessories: { label: 'Аксессуары',  emoji: '💎' },
  universal:   { label: 'Универсальные', emoji: '✨' },
}

const GROUP_ORDER: IconGroup[] = ['shoes', 'clothes', 'accessories', 'universal']

interface IconPickerProps {
  value: string | null
  onChange: (key: string) => void
  /** Опционально: показывать только иконки конкретной группы (для подкатегорий) */
  filterGroup?: IconGroup | null
}

export default function IconPicker({ value, onChange, filterGroup = null }: IconPickerProps) {
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<IconGroup | 'all'>(filterGroup || 'all')

  const filteredIcons = useMemo(() => {
    let list: IconEntry[] = ICON_REGISTRY
    if (filterGroup) {
      list = list.filter((i) => i.group === filterGroup)
    } else if (selectedGroup !== 'all') {
      list = list.filter((i) => i.group === selectedGroup)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (i) => i.labelRu.toLowerCase().includes(q) || i.key.toLowerCase().includes(q)
      )
    }
    return list
  }, [search, selectedGroup, filterGroup])

  const showGroups = !filterGroup

  return (
    <div className="space-y-3">
      {/* Поиск */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8275] dark:text-gray-400 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск иконки..."
          className="w-full pl-10 pr-4 py-2.5 border border-[#E8E2D5] dark:border-dark-border rounded-xl bg-white dark:bg-dark-accent text-sm text-[#1B2A4A] dark:text-white placeholder:text-[#8A8275] dark:placeholder:text-gray-500 focus:outline-none focus:border-[#1B2A4A] dark:focus:border-gold"
        />
      </div>

      {/* Табы групп (только если нет жёсткого фильтра) */}
      {showGroups && (
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedGroup('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedGroup === 'all'
                ? 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A]'
                : 'bg-[#F5F1E8] dark:bg-dark-accent text-[#8A8275] dark:text-gray-300 border border-[#E8E2D5] dark:border-dark-border'
            }`}
          >
            Все ({ICON_REGISTRY.length})
          </button>
          {GROUP_ORDER.map((g) => {
            const count = ICON_REGISTRY.filter((i) => i.group === g).length
            return (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
                  selectedGroup === g
                    ? 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A]'
                    : 'bg-[#F5F1E8] dark:bg-dark-accent text-[#8A8275] dark:text-gray-300 border border-[#E8E2D5] dark:border-dark-border'
                }`}
              >
                <span>{GROUP_LABELS[g].emoji}</span>
                {GROUP_LABELS[g].label} ({count})
              </button>
            )
          })}
        </div>
      )}

      {/* Сетка иконок */}
      {filteredIcons.length === 0 ? (
        <div className="text-center py-6 text-sm text-[#8A8275] dark:text-gray-400">
          Иконки не найдены
        </div>
      ) : (
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 max-h-64 overflow-y-auto p-2 bg-[#F5F1E8]/50 dark:bg-dark-accent/30 rounded-xl border border-[#E8E2D5] dark:border-dark-border">
          {filteredIcons.map((icon) => {
            const isSelected = value === icon.key
            const Icon = icon.Component
            return (
              <button
                key={icon.key}
                onClick={() => onChange(icon.key)}
                title={`${icon.labelRu} (${icon.key})`}
                className={`relative aspect-square rounded-lg flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-[#1B2A4A] dark:bg-gold text-white dark:text-[#1B2A4A] ring-2 ring-offset-2 ring-[#C9A961] dark:ring-gold'
                    : 'bg-white dark:bg-dark-card text-[#1B2A4A] dark:text-white hover:bg-[#E8E2D5] dark:hover:bg-dark-border border border-[#E8E2D5] dark:border-dark-border'
                }`}
              >
                <Icon size={20} />
                {isSelected && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C9A961] dark:bg-gold flex items-center justify-center">
                    <Check size={10} className="text-white dark:text-[#1B2A4A]" strokeWidth={3} />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Подсказка с выбранным ключом */}
      {value && (
        <p className="text-xs text-[#8A8275] dark:text-gray-400 font-mono">
          Выбрано: <span className="text-[#C9A961] dark:text-gold font-bold">{value}</span>
        </p>
      )}
    </div>
  )
}
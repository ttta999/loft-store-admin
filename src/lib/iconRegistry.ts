import {
  GiFootprint, GiRunningShoe, GiLeatherBoot, GiBallerinaShoes,
  GiSandal, GiFlipFlops, GiClothes, GiShirt, GiHoodie, GiCloak,
  GiTrousers, GiGemNecklace, GiBelt, GiBilledCap,
  GiWinterHat, GiWatch, GiBackpack, GiBriefcase,
} from 'react-icons/gi'
import { FaBox, FaStar, FaFire, FaMoneyBillWave, FaTag } from 'react-icons/fa6'
import { Sparkles as LuSparkles } from 'lucide-react'
import JeansIcon from '../components/icons/JeansIcon'

export type IconGroup = 'shoes' | 'clothes' | 'accessories' | 'universal'

// ✅ Универсальный тип: принимает react-icons, lucide и кастомные SVG
export type AnyIcon = React.ComponentType<any>

export interface IconEntry {
  /** ключ в kebab-case — хранится в БД (categories.icon, subcategories.icon) */
  key: string
  /** читаемое название для админки */
  labelRu: string
  /** группа (для фильтрации в пикере админки) */
  group: IconGroup
  /** React-компонент иконки */
  Component: AnyIcon
}

/**
 * Единый реестр иконок приложения.
 * - Приложение: рендерит по ключу из БД
 * - Админка: показывает сеткой в IconPicker
 */
export const ICON_REGISTRY: IconEntry[] = [
  // ===== ОБУВЬ =====
  { key: 'footprint',        labelRu: 'След (Обувь)',       group: 'shoes',       Component: GiFootprint },
  { key: 'running-shoe',    labelRu: 'Кроссовок',          group: 'shoes',       Component: GiRunningShoe },
  { key: 'leather-boot',    labelRu: 'Ботинок',            group: 'shoes',       Component: GiLeatherBoot },
  { key: 'ballerina-shoes', labelRu: 'Лоферы / Слипоны',   group: 'shoes',       Component: GiBallerinaShoes },
  { key: 'sandal',          labelRu: 'Сандалии',           group: 'shoes',       Component: GiSandal },
  { key: 'flip-flops',      labelRu: 'Шлёпанцы',           group: 'shoes',       Component: GiFlipFlops },

  // ===== ОДЕЖДА =====
  { key: 'clothes',         labelRu: 'Одежда (общая)',     group: 'clothes',     Component: GiClothes },
  { key: 'tshirt',          labelRu: 'Футболка',           group: 'clothes',     Component: GiShirt },
  { key: 'shirt',           labelRu: 'Рубашка',            group: 'clothes',     Component: GiShirt },
  { key: 'hoodie',          labelRu: 'Джемпер / Худи',     group: 'clothes',     Component: GiHoodie },
  { key: 'jacket',          labelRu: 'Куртка / Ветровка',  group: 'clothes',     Component: GiCloak },
  { key: 'trousers',        labelRu: 'Брюки',              group: 'clothes',     Component: GiTrousers },
  { key: 'jeans',           labelRu: 'Джинсы',             group: 'clothes',     Component: JeansIcon },

  // ===== АКСЕССУАРЫ =====
  { key: 'gem',             labelRu: 'Драгоценность',      group: 'accessories', Component: GiGemNecklace },
  { key: 'belt',            labelRu: 'Ремень',             group: 'accessories', Component: GiBelt },
  { key: 'billed-cap',      labelRu: 'Кепка',              group: 'accessories', Component: GiBilledCap },
  { key: 'winter-hat',      labelRu: 'Шапка зимняя',       group: 'accessories', Component: GiWinterHat },
  { key: 'watch',           labelRu: 'Часы',               group: 'accessories', Component: GiWatch },
  { key: 'backpack',        labelRu: 'Рюкзак',             group: 'accessories', Component: GiBackpack },
  { key: 'briefcase',       labelRu: 'Сумка',              group: 'accessories', Component: GiBriefcase },

  // ===== УНИВЕРСАЛЬНЫЕ =====
  { key: 'package',         labelRu: 'Коробка / Все',      group: 'universal',   Component: FaBox },
  { key: 'tag',             labelRu: 'Бирка / Бренд',      group: 'universal',   Component: FaTag },
  { key: 'sparkles',        labelRu: 'Искры (Новинки)',    group: 'universal',   Component: LuSparkles },
  { key: 'flame',           labelRu: 'Огонь (Хиты)',       group: 'universal',   Component: FaFire },
  { key: 'banknote',        labelRu: 'Купюра (Скидки)',    group: 'universal',   Component: FaMoneyBillWave },
  { key: 'star',            labelRu: 'Звезда',             group: 'universal',   Component: FaStar },
]

/** Быстрый поиск компонента по ключу. Фолбэк — package. */
export const getIconComponent = (key: string | null | undefined): AnyIcon => {
  if (!key) return FaBox
  const entry = ICON_REGISTRY.find((e) => e.key === key)
  return entry ? entry.Component : FaBox
}

/**
 * Маппинг старых эмодзи → новые ключи (обратная совместимость с БД).
 */
export const EMOJI_TO_KEY: Record<string, string> = {
  '👟': 'running-shoe',
  '👞': 'leather-boot',
  '👠': 'ballerina-shoes',
  '🥾': 'leather-boot',
  '👕': 'tshirt',
  '👔': 'shirt',
  '🧥': 'jacket',
  '🧢': 'billed-cap',
  '🎩': 'winter-hat',
  '👒': 'winter-hat',
  '⌚': 'watch',
  '👜': 'briefcase',
  '🎒': 'backpack',
  '💎': 'gem',
  '📦': 'package',
  '🏷️': 'tag',
  '🏷': 'tag',
  '✨': 'sparkles',
  '🔥': 'flame',
  '💰': 'banknote',
}

/** Универсальный резолвер: поддерживает и новые ключи, и старые эмодзи */
export const resolveIcon = (value: string | null | undefined): AnyIcon => {
  if (!value) return FaBox
  const byKey = ICON_REGISTRY.find((e) => e.key === value)
  if (byKey) return byKey.Component
  const mappedKey = EMOJI_TO_KEY[value]
  if (mappedKey) {
    const byMapped = ICON_REGISTRY.find((e) => e.key === mappedKey)
    if (byMapped) return byMapped.Component
  }
  return FaBox
}
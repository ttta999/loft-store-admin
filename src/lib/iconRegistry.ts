import { CATEGORY_ICONS, SUBCATEGORY_ICONS, BLOCK_ICONS, PackageIcon } from './customIcons'
import { resolveCategoryIcon } from '../components/CategoryIcon'

export type IconGroup = 'shoes' | 'clothes' | 'accessories' | 'universal'
export interface IconEntry { key: string; labelRu: string; group: IconGroup; Component: React.ComponentType<any> }

// Store the same canonical keys that the storefront renders.
export const ICON_REGISTRY: IconEntry[] = [
  { key: 'shoes', labelRu: 'Обувь', group: 'shoes', Component: CATEGORY_ICONS.shoes },
  { key: 'sneakers', labelRu: 'Кроссовки', group: 'shoes', Component: SUBCATEGORY_ICONS.sneakers },
  { key: 'boots', labelRu: 'Ботинки', group: 'shoes', Component: SUBCATEGORY_ICONS.boots },
  { key: 'loafers', labelRu: 'Лоферы', group: 'shoes', Component: SUBCATEGORY_ICONS.loafers },
  { key: 'sandals', labelRu: 'Сандалии и шлёпанцы', group: 'shoes', Component: SUBCATEGORY_ICONS.sandals },
  { key: 'clothes', labelRu: 'Одежда', group: 'clothes', Component: CATEGORY_ICONS.clothes },
  { key: 'tshirts', labelRu: 'Футболки', group: 'clothes', Component: SUBCATEGORY_ICONS.tshirts },
  { key: 'shirts', labelRu: 'Рубашки', group: 'clothes', Component: SUBCATEGORY_ICONS.shirts },
  { key: 'sweaters', labelRu: 'Джемперы и кардиганы', group: 'clothes', Component: SUBCATEGORY_ICONS.sweaters },
  { key: 'trousers', labelRu: 'Брюки', group: 'clothes', Component: SUBCATEGORY_ICONS.trousers },
  { key: 'jeans', labelRu: 'Джинсы', group: 'clothes', Component: SUBCATEGORY_ICONS.jeans },
  { key: 'tracksuits', labelRu: 'Спортивные костюмы', group: 'clothes', Component: SUBCATEGORY_ICONS.tracksuits },
  { key: 'outerwear', labelRu: 'Верхняя одежда', group: 'clothes', Component: SUBCATEGORY_ICONS.outerwear },
  { key: 'accessories', labelRu: 'Аксессуары', group: 'accessories', Component: CATEGORY_ICONS.accessories },
  { key: 'belts', labelRu: 'Ремни', group: 'accessories', Component: SUBCATEGORY_ICONS.belts },
  { key: 'caps', labelRu: 'Кепки', group: 'accessories', Component: SUBCATEGORY_ICONS.caps },
  { key: 'beanies', labelRu: 'Шапки', group: 'accessories', Component: SUBCATEGORY_ICONS.beanies },
  { key: 'bags', labelRu: 'Сумки и рюкзаки', group: 'accessories', Component: SUBCATEGORY_ICONS.bags },
  { key: 'brands', labelRu: 'Бренды', group: 'universal', Component: CATEGORY_ICONS.brands },
  { key: 'package', labelRu: 'Все товары', group: 'universal', Component: PackageIcon },
  { key: 'new', labelRu: 'Новинки', group: 'universal', Component: BLOCK_ICONS.new },
  { key: 'popular', labelRu: 'Популярные товары', group: 'universal', Component: BLOCK_ICONS.popular },
]
export function selectedIcon(value: string | null) {
  return value ? ICON_REGISTRY.find(icon => icon.key === value) || ICON_REGISTRY.find(icon => icon.Component === resolveCategoryIcon(value)) : undefined
}

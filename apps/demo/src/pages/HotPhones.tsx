import { useState } from 'react'
import './HotPhones.css'

interface Phone {
  id: number
  name: string
  brand: string
  price: number
  image: string
  description: string
  specs: {
    screen: string
    processor: string
    ram: string
    storage: string
  }
  rating: number
}

const hotPhones: Phone[] = [
  {
    id: 1,
    name: 'iPhone 15 Pro',
    brand: 'Apple',
    price: 7999,
    image: 'https://via.placeholder.com/300x400?text=iPhone+15+Pro',
    description: '钛金属设计，A17 Pro 芯片，专业级摄像系统',
    specs: {
      screen: '6.1英寸 超视网膜 XDR 显示屏',
      processor: 'A17 Pro',
      ram: '8GB',
      storage: '128GB/256GB/512GB/1TB'
    },
    rating: 4.9
  },
  {
    id: 2,
    name: 'Galaxy S24 Ultra',
    brand: 'Samsung',
    price: 8999,
    image: 'https://via.placeholder.com/300x400?text=Galaxy+S24+Ultra',
    description: 'Galaxy AI，内置 S Pen，2亿像素主摄',
    specs: {
      screen: '6.8英寸 Dynamic AMOLED 2X',
      processor: 'Snapdragon 8 Gen 3',
      ram: '12GB',
      storage: '256GB/512GB/1TB'
    },
    rating: 4.8
  },
  {
    id: 3,
    name: 'Xiaomi 14',
    brand: 'Xiaomi',
    price: 3999,
    image: 'https://via.placeholder.com/300x400?text=Xiaomi+14',
    description: '徕卡光学镜头，骁龙 8 Gen 3，小尺寸旗舰',
    specs: {
      screen: '6.36英寸 C8 OLED',
      processor: 'Snapdragon 8 Gen 3',
      ram: '12GB/16GB',
      storage: '256GB/512GB'
    },
    rating: 4.7
  },
  {
    id: 4,
    name: 'OPPO Find X7',
    brand: 'OPPO',
    price: 4499,
    image: 'https://via.placeholder.com/300x400?text=OPPO+Find+X7',
    description: '哈苏影像系统，天玑 9300，超光影三主摄',
    specs: {
      screen: '6.78英寸 AMOLED',
      processor: 'Dimensity 9300',
      ram: '12GB/16GB',
      storage: '256GB/512GB'
    },
    rating: 4.6
  },
  {
    id: 5,
    name: 'vivo X100',
    brand: 'vivo',
    price: 4299,
    image: 'https://via.placeholder.com/300x400?text=vivo+X100',
    description: '蔡司影像，天玑 9300，蓝海电池技术',
    specs: {
      screen: '6.78英寸 AMOLED',
      processor: 'Dimensity 9300',
      ram: '12GB/16GB',
      storage: '256GB/512GB'
    },
    rating: 4.6
  },
  {
    id: 6,
    name: 'HUAWEI Mate 60 Pro',
    brand: 'Huawei',
    price: 6999,
    image: 'https://via.placeholder.com/300x400?text=Mate+60+Pro',
    description: '卫星通话，昆仑玻璃，麒麟 9000S',
    specs: {
      screen: '6.82英寸 OLED',
      processor: '麒麟 9000S',
      ram: '12GB',
      storage: '256GB/512GB/1TB'
    },
    rating: 4.8
  }
]

export default function HotPhones() {
  const [sortBy, setSortBy] = useState<'price' | 'rating'>('rating')
  const [filterBrand, setFilterBrand] = useState<string>('all')

  const brands = ['all', ...Array.from(new Set(hotPhones.map(p => p.brand)))]

  const filteredAndSortedPhones = hotPhones
    .filter(phone => filterBrand === 'all' || phone.brand === filterBrand)
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      return b.rating - a.rating
    })

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + (rating % 1 >= 0.5 ? '½' : '')
  }

  return (
    <div className="hot-phones-container">
      <div className="header">
        <h1>热门手机</h1>
        <p className="subtitle">精选当下最热门的智能手机</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>品牌:</label>
          <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)}>
            {brands.map(brand => (
              <option key={brand} value={brand}>
                {brand === 'all' ? '全部品牌' : brand}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>排序:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'price' | 'rating')}>
            <option value="rating">评分最高</option>
            <option value="price">价格最低</option>
          </select>
        </div>
      </div>

      <div className="phones-grid">
        {filteredAndSortedPhones.map(phone => (
          <div key={phone.id} className="phone-card">
            <div className="phone-image">
              <img src={phone.image} alt={phone.name} />
            </div>
            <div className="phone-content">
              <div className="phone-brand">{phone.brand}</div>
              <h3 className="phone-name">{phone.name}</h3>
              <p className="phone-description">{phone.description}</p>
              <div className="phone-rating">
                <span className="stars">{renderStars(phone.rating)}</span>
                <span className="rating-number">{phone.rating}</span>
              </div>
              <div className="phone-price">¥{phone.price.toLocaleString()}</div>
              <div className="phone-specs">
                <div className="spec-item">📱 {phone.specs.screen}</div>
                <div className="spec-item">⚡ {phone.specs.processor}</div>
                <div className="spec-item">💾 {phone.specs.ram} / {phone.specs.storage}</div>
              </div>
              <button className="buy-button">立即购买</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
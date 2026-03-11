import React, { useState, useEffect } from 'react';
import './HotComputers.css';

interface Computer {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  salesCount: number;
  category: string;
}

const HotComputers: React.FC = () => {
  const [computers, setComputers] = useState<Computer[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popularity');

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      const mockData: Computer[] = [
        {
          id: 1,
          name: 'MacBook Pro 16"',
          brand: 'Apple',
          price: 19999,
          rating: 4.8,
          image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2371&q=80',
          description: 'M2 Max芯片，专业级性能，适合设计师和开发者',
          salesCount: 12500,
          category: 'professional'
        },
        {
          id: 2,
          name: 'Dell XPS 15',
          brand: 'Dell',
          price: 15999,
          rating: 4.6,
          image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2371&q=80',
          description: '轻薄设计，高性能处理器，完美便携办公',
          salesCount: 9800,
          category: 'business'
        },
        {
          id: 3,
          name: 'ThinkPad X1 Carbon',
          brand: 'Lenovo',
          price: 13999,
          rating: 4.7,
          image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2372&q=80',
          description: '商务经典，键盘手感极佳，安全性高',
          salesCount: 8700,
          category: 'business'
        },
        {
          id: 4,
          name: 'Surface Laptop 5',
          brand: 'Microsoft',
          price: 12999,
          rating: 4.5,
          image: 'https://images.unsplash.com/photo-1550009158-9ebf6917fbc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          description: '精致外观，触控屏，Windows体验优化',
          salesCount: 7600,
          category: 'creative'
        },
        {
          id: 5,
          name: 'HP Spectre x360',
          brand: 'HP',
          price: 14999,
          rating: 4.6,
          image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2371&q=80',
          description: '360度翻转屏，时尚设计，强大性能',
          salesCount: 6900,
          category: 'creative'
        },
        {
          id: 6,
          name: 'ASUS ROG Zephyrus',
          brand: 'ASUS',
          price: 17999,
          rating: 4.9,
          image: 'https://images.unsplash.com/photo-1592899677977-9c10bf2bff5b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          description: '游戏本旗舰，RTX显卡，轻薄设计',
          salesCount: 5800,
          category: 'gaming'
        },
        {
          id: 7,
          name: 'MacBook Air M2',
          brand: 'Apple',
          price: 9999,
          rating: 4.5,
          image: 'https://images.unsplash.com/photo-1656044403937-3fbfce420508?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80',
          description: '超轻薄设计，全天续航，日常办公首选',
          salesCount: 11200,
          category: 'lightweight'
        },
        {
          id: 8,
          name: 'MSI Creator Z17',
          brand: 'MSI',
          price: 21999,
          rating: 4.7,
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          description: '创意者首选，4K屏幕，强大渲染能力',
          salesCount: 4500,
          category: 'professional'
        }
      ];
      setComputers(mockData);
      setLoading(false);
    }, 800);
  }, []);

  const categories = ['all', ...new Set(computers.map(c => c.category))];

  const filteredComputers = computers.filter(computer =>
    selectedCategory === 'all' || computer.category === selectedCategory
  );

  const sortedComputers = [...filteredComputers].sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.salesCount - a.salesCount; // 默认按销量排序
  });

  if (loading) {
    return <div className="hot-computers-loading">加载中...</div>;
  }

  return (
    <div className="hot-computers-container">
      <div className="header-section">
        <h1 className="main-title">热门电脑推荐</h1>
        <p className="subtitle">精选市场上最受欢迎的电脑产品</p>
      </div>

      <div className="controls">
        <div className="filter-controls">
          <label htmlFor="category-filter">分类:</label>
          <select
            id="category-filter"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-dropdown"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? '全部' :
                 category === 'professional' ? '专业级' :
                 category === 'business' ? '商务办公' :
                 category === 'creative' ? '创意设计' :
                 category === 'gaming' ? '游戏本' : '轻薄本'}
              </option>
            ))}
          </select>
        </div>

        <div className="sort-controls">
          <label htmlFor="sort-options">排序:</label>
          <select
            id="sort-options"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown"
          >
            <option value="popularity">按销量</option>
            <option value="rating">按评分</option>
            <option value="price-low">价格从低到高</option>
            <option value="price-high">价格从高到低</option>
          </select>
        </div>
      </div>

      <div className="hot-computers-grid">
        {sortedComputers.map((computer, index) => (
          <div
            key={computer.id}
            className="computer-card"
            style={{ '--index': index } as React.CSSProperties}
          >
            <div className="badge">{computer.category === 'gaming' ? '游戏推荐' :
                                    computer.category === 'professional' ? '专业优选' :
                                    '热销产品'}</div>
            <div className="image-container">
              <img src={computer.image} alt={computer.name} className="computer-image" />
              <div className="image-overlay"></div>
            </div>
            <div className="computer-info">
              <div className="top-info">
                <h2 className="computer-name">{computer.name}</h2>
                <p className="computer-brand">{computer.brand}</p>
              </div>

              <p className="computer-description">{computer.description}</p>

              <div className="computer-stats">
                <div className="stat-item">
                  <span className="label">评分</span>
                  <div className="rating">
                    {'★'.repeat(Math.floor(computer.rating))}
                    {'☆'.repeat(5 - Math.floor(computer.rating))}
                    <span className="rating-value">{computer.rating}</span>
                  </div>
                </div>

                <div className="stat-item">
                  <span className="label">销量</span>
                  <span className="sales-count">{computer.salesCount.toLocaleString()}台</span>
                </div>
              </div>

              <div className="price-section">
                <span className="current-price">¥{computer.price.toLocaleString()}</span>
                <span className="original-price">¥{(computer.price * 1.1).toLocaleString()}</span>
              </div>
            </div>

            <button className="buy-button">
              <span className="button-text">立即购买</span>
              <span className="button-icon">→</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotComputers;
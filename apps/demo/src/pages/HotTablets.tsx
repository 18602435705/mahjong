import React, { useState, useEffect } from 'react';
import './HotTablets.css';

interface Tablet {
  id: number;
  name: string;
  brand: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  salesCount: number;
  features: string[];
}

const HotTablets: React.FC = () => {
  const [tablets, setTablets] = useState<Tablet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('all');

  useEffect(() => {
    // 模拟数据加载
    setTimeout(() => {
      const mockData: Tablet[] = [
        {
          id: 1,
          name: 'iPad Pro 12.9"',
          brand: 'Apple',
          price: 8999,
          rating: 4.8,
          image: 'https://images.unsplash.com/photo-1607853554439-0069ec0f29b8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          description: 'M2芯片驱动的专业平板，支持Apple Pencil和妙控键盘',
          salesCount: 12500,
          features: ['M2芯片', 'Liquid视网膜XDR', 'Face ID', 'Thunderbolt']
        },
        {
          id: 2,
          name: 'Samsung Galaxy Tab S9',
          brand: 'Samsung',
          price: 7499,
          rating: 4.7,
          image: 'https://images.unsplash.com/photo-1611262588024-d12430b98920?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          description: '配备S Pen，One UI 5.1，DeX模式带来桌面体验',
          salesCount: 9800,
          features: ['Snapdragon 8 Gen2', 'S Pen', 'DeX模式', 'IP68']
        },
        {
          id: 3,
          name: 'Microsoft Surface Pro 9',
          brand: 'Microsoft',
          price: 9299,
          rating: 4.6,
          image: 'https://images.unsplash.com/photo-1603302576837-37561b23a098?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          description: 'Windows 11系统，可拆卸键盘，专业生产力工具',
          salesCount: 7600,
          features: ['Intel i7', '4.5K触控屏', 'Windows 11', 'Surface Pen']
        },
        {
          id: 4,
          name: 'Huawei MatePad Pro 13.2',
          brand: 'Huawei',
          price: 6299,
          rating: 4.5,
          image: 'https://images.unsplash.com/photo-1618508088994-94176136fddf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          description: 'HarmonyOS 4，星环设计，专业创作体验',
          salesCount: 6900,
          features: ['HarmonyOS 4', 'OLED全面屏', 'M-Pencil', '星环设计']
        },
        {
          id: 5,
          name: 'Lenovo Tab P12 Pro',
          brand: 'Lenovo',
          price: 4999,
          rating: 4.4,
          image: 'https://images.unsplash.com/photo-1618389041494-5fab4de5d5c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          description: '12.6英寸OLED屏，骁龙870，ZUI定制系统',
          salesCount: 5800,
          features: ['OLED 2.5K屏', '骁龙870', 'ZUI系统', '杜比全景声']
        },
        {
          id: 6,
          name: 'Xiaomi Pad 6 Pro',
          brand: 'Xiaomi',
          price: 3499,
          rating: 4.3,
          image: 'https://images.unsplash.com/photo-1600000000000-000000000000?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2370&q=80',
          description: '11英寸3K屏，骁龙8+，澎湃OS加持',
          salesCount: 11200,
          features: ['3K LCD屏', '骁龙8+', '澎湃OS', 'MIUI for Pad']
        }
      ];
      setTablets(mockData);
      setLoading(false);
    }, 800);
  }, []);

  const brands = ['all', ...new Set(tablets.map(t => t.brand))];

  const filteredTablets = tablets.filter(tablet =>
    selectedBrand === 'all' || tablet.brand === selectedBrand
  );

  if (loading) {
    return <div className="hot-tablets-loading">加载中...</div>;
  }

  return (
    <div className="hot-tablets-container">
      <div className="neon-header">
        <h1 className="neon-title">热门平板推荐</h1>
        <p className="neon-subtitle">探索未来科技，发现极致体验</p>
      </div>

      <div className="controls">
        <div className="filter-control">
          <label htmlFor="brand-filter">品牌筛选:</label>
          <select
            id="brand-filter"
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="neon-dropdown"
          >
            {brands.map(brand => (
              <option key={brand} value={brand}>
                {brand === 'all' ? '全部品牌' : brand}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="hot-tablets-grid">
        {filteredTablets.map((tablet, index) => (
          <div
            key={tablet.id}
            className="tablet-card neon-border"
            style={{ '--index': index } as React.CSSProperties}
          >
            <div className="card-glow-effect"></div>
            <div className="tablet-badge">{tablet.brand}</div>

            <div className="tablet-image-container">
              <img src={tablet.image} alt={tablet.name} className="tablet-image" />
              <div className="image-overlay"></div>
            </div>

            <div className="tablet-info">
              <h2 className="tablet-name">{tablet.name}</h2>

              <div className="tablet-rating">
                <div className="stars">
                  {'★'.repeat(Math.floor(tablet.rating))}
                  {'☆'.repeat(5 - Math.floor(tablet.rating))}
                </div>
                <span className="rating-value">{tablet.rating}</span>
              </div>

              <p className="tablet-description">{tablet.description}</p>

              <div className="features-list">
                {tablet.features.map((feature, idx) => (
                  <span key={idx} className="feature-tag">{feature}</span>
                ))}
              </div>

              <div className="tablet-stats">
                <div className="stat">
                  <span className="stat-label">销量</span>
                  <span className="stat-value">{tablet.salesCount.toLocaleString()}台</span>
                </div>
                <div className="price">
                  <span className="current-price">¥{tablet.price.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button className="neon-button">
              <span className="button-text">立即购买</span>
              <span className="button-glow"></span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotTablets;
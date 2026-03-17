import { Link } from 'react-router-dom';
import DynamicBarChart from '../components/DynamicBarChart';

function ChartList() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>图表列表</h1>
      <p>这里是所有可用的图表类型</p>

      <div style={{ marginBottom: 24, display: 'flex', gap: 16 }}>
        <Link
          to="/life-expectancy"
          style={{
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 8,
            fontWeight: 'bold'
          }}
        >
          📈 人均寿命动态趋势图
        </Link>
      </div>

      <h2>人均收入动态排行榜</h2>
      <DynamicBarChart />
    </div>
  );
}

export default ChartList;
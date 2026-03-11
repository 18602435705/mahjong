import DynamicBarChart from '../components/DynamicBarChart';

function ChartList() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>图表列表</h1>
      <p>这里是所有可用的图表类型</p>
      <DynamicBarChart />
    </div>
  );
}

export default ChartList;
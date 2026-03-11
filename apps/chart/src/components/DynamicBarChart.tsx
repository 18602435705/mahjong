import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';

// 各国家/地区颜色
const countryColors: Record<string, string> = {
  '卢森堡': '#003580',
  '爱尔兰': '#169b62',
  '瑞士': '#ff0000',
  '挪威': '#ef2b2d',
  '美国': '#b22234',
  '新加坡': '#c8102e',
  '丹麦': '#c8102e',
  '冰岛': '#003897',
  '卡塔尔': '#8a1538',
  '澳大利亚': '#00008b',
  '瑞典': '#006aa7',
  '荷兰': '#ff6600',
  '芬兰': '#003580',
  '奥地利': '#ed2939',
  '德国': '#000000',
  '加拿大': '#ff0000',
  '英国': '#00247d',
  '法国': '#002395',
  '日本': '#bc002d',
  '韩国': '#000000',
  '中国': '#de2910'
};

// 国家/地区数据
const countries = Object.keys(countryColors);

// 生成模拟人均收入数据（单位：美元）
const generateIncomeData = (year: number) => {
  return countries.map(country => {
    const baseIncome: Record<string, number> = {
      '卢森堡': 115000,
      '爱尔兰': 95000,
      '瑞士': 90000,
      '挪威': 82000,
      '美国': 76000,
      '新加坡': 72000,
      '丹麦': 68000,
      '冰岛': 65000,
      '卡塔尔': 62000,
      '澳大利亚': 58000,
      '瑞典': 55000,
      '荷兰': 53000,
      '芬兰': 51000,
      '奥地利': 49000,
      '德国': 48000,
      '加拿大': 46000,
      '英国': 44000,
      '法国': 42000,
      '日本': 40000,
      '韩国': 35000,
      '中国': 12500
    };
    const base = baseIncome[country] || 30000;
    const growth = (year - 2010) * (Math.random() * 500 + 200);
    const fluctuation = (Math.random() - 0.5) * 5000;
    return [country, Math.round(Math.max(10000, base + growth + fluctuation)), year];
  });
};

const DynamicBarChart = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const updateFrequency = 2000;
    let currentYear = 2010;
    const endYear = 2024;

    const option: echarts.EChartsOption = {
      title: {
        text: '人均收入动态排行榜',
        subtext: '单位：美元',
        left: 'center',
        top: 20,
        textStyle: {
          fontSize: 24,
          fontWeight: 'bold'
        }
      },
      grid: {
        top: 80,
        bottom: 30,
        left: 120,
        right: 80
      },
      xAxis: {
        max: 'dataMax',
        axisLabel: {
          formatter: (n: number) => {
            return '$' + Math.round(n / 1000) + 'k';
          }
        }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        max: 10,
        axisLabel: {
          show: true,
          fontSize: 14,
          fontWeight: 'bold'
        },
        animationDuration: 300,
        animationDurationUpdate: 300
      },
      series: [
        {
          realtimeSort: true,
          type: 'bar',
          data: generateIncomeData(currentYear),
          itemStyle: {
            color: (param: echarts.DefaultLabelFormatterCallbackParams) => {
              const value = param.value as [string, number, number];
              return countryColors[value[0]] || '#5470c6';
            }
          },
          label: {
            show: true,
            position: 'right',
            valueAnimation: true,
            formatter: (params: echarts.DefaultLabelFormatterCallbackParams) => {
              const value = params.value as [string, number, number];
              return '$' + value[1].toLocaleString();
            },
            fontFamily: 'monospace',
            fontSize: 12
          },
          encode: {
            x: 1,
            y: 0
          }
        }
      ],
      animationDuration: 0,
      animationDurationUpdate: updateFrequency,
      animationEasing: 'linear',
      animationEasingUpdate: 'linear',
      graphic: {
        elements: [
          {
            type: 'text',
            right: 160,
            bottom: 80,
            style: {
              text: currentYear.toString(),
              font: 'bolder 80px monospace',
              fill: 'rgba(100, 100, 100, 0.25)'
            },
            z: 100
          }
        ]
      }
    };

    chart.setOption(option);

    // 更新函数
    const updateChart = () => {
      currentYear++;
      if (currentYear > endYear) {
        currentYear = 2010;
      }

      const newData = generateIncomeData(currentYear);
      const newOption: echarts.EChartsOption = {
        series: [
          {
            data: newData
          }
        ],
        graphic: {
          elements: [
            {
              type: 'text',
              right: 160,
              bottom: 80,
              style: {
                text: currentYear.toString(),
                font: 'bolder 80px monospace',
                fill: 'rgba(100, 100, 100, 0.25)'
              },
              z: 100
            }
          ]
        }
      };

      chart.setOption(newOption);
    };

    // 立即开始动画
    updateChart();
    const timer = setInterval(updateChart, updateFrequency);

    // 响应式
    const handleResize = () => chart.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', handleResize);
      chart.dispose();
    };
  }, []);

  return (
    <div
      ref={chartRef}
      style={{
        width: '100%',
        height: '600px'
      }}
    />
  );
};

export default DynamicBarChart;
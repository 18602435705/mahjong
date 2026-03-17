import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import rawData from "../assets/gdpDataFromCSV.json";
import { useVideoRecorder } from "../hooks/useVideoRecorder";

interface GDPData {
  countries: string[];
  countryNames: string[];
  years: string[];
  values: Record<string, Record<string, number | string>>;
}

// 国家中文名称映射（移到组件外部，避免重复创建）
const countryNameMap: Record<string, string> = {
  "United States": "美国 🇺🇸",
  USA: "美国 🇺🇸",
  China: "中国 🇨🇳",
  Japan: "日本 🇯🇵",
  Germany: "德国 🇩🇪",
  "United Kingdom": "英国 🇬🇧",
  UK: "英国 🇬🇧",
  France: "法国 🇫🇷",
  India: "印度 🇮🇳",
  Italy: "意大利 🇮🇹",
  Brazil: "巴西 🇧🇷",
  Canada: "加拿大 🇨🇦",
  Russia: "俄罗斯 🇷🇺",
  "Russian Federation": "俄罗斯 🇷🇺",
  "South Korea": "韩国 🇰🇷",
  "Korea, Rep.": "韩国 🇰🇷",
  Australia: "澳大利亚 🇦🇺",
  Spain: "西班牙 🇪🇸",
  Mexico: "墨西哥 🇲🇽",
  Indonesia: "印度尼西亚 🇮🇩",
  Netherlands: "荷兰 🇳🇱",
  "Saudi Arabia": "沙特阿拉伯 🇸🇦",
  Turkey: "土耳其 🇹🇷",
  Switzerland: "瑞士 🇨🇭",
  Poland: "波兰 🇵🇱",
  Belgium: "比利时 🇧🇪",
  Argentina: "阿根廷 🇦🇷",
  Sweden: "瑞典 🇸🇪",
  Ireland: "爱尔兰 🇮🇪",
  Austria: "奥地利 🇦🇹",
  Norway: "挪威 🇳🇴",
  Israel: "以色列 🇮🇱",
  "United Arab Emirates": "阿联酋 🇦🇪",
  UAE: "阿联酋 🇦🇪",
  Nigeria: "尼日利亚 🇳🇬",
  "South Africa": "南非 🇿🇦",
  Thailand: "泰国 🇹🇭",
  Singapore: "新加坡 🇸🇬",
  Malaysia: "马来西亚 🇲🇾",
  Philippines: "菲律宾 🇵🇭",
  Vietnam: "越南 🇻🇳",
  Bangladesh: "孟加拉国 🇧🇩",
  Egypt: "埃及 🇪🇬",
  "Egypt, Arab Rep.": "埃及 🇪🇬",
  Pakistan: "巴基斯坦 🇵🇰",
  Colombia: "哥伦比亚 🇨🇴",
  Chile: "智利 🇨🇱",
  Finland: "芬兰 🇫🇮",
  Denmark: "丹麦 🇩🇰",
  "New Zealand": "新西兰 🇳🇿",
  Portugal: "葡萄牙 🇵🇹",
  Greece: "希腊 🇬🇷",
  "Czech Republic": "捷克 🇨🇿",
  Romania: "罗马尼亚 🇷🇴",
  Hungary: "匈牙利 🇭🇺",
  Ukraine: "乌克兰 🇺🇦",
  Kazakhstan: "哈萨克斯坦 🇰🇿",
  Algeria: "阿尔及利亚 🇩🇿",
  Qatar: "卡塔尔 🇶🇦",
  Venezuela: "委内瑞拉 🇻🇪",
  "Venezuela, RB": "委内瑞拉 🇻🇪",
  Peru: "秘鲁 🇵🇪",
  Iraq: "伊拉克 🇮🇶",
  "Iran, Islamic Rep.": "伊朗 🇮🇷",
  Iran: "伊朗 🇮🇷",
  "Congo, Rep.": "刚果共和国 🇨🇬",
  "Congo, Dem. Rep.": "刚果民主共和国 🇨🇩",
  "Cote d'Ivoire": "科特迪瓦 🇨🇮",
  "Slovak Republic": "斯洛伐克 🇸🇰",
  "Kyrgyz Republic": "吉尔吉斯斯坦 🇰🇬",
  "North Macedonia": "北马其顿 🇲🇰",
  "Micronesia, Fed. Sts.": "密克罗尼西亚 🇫🇲",
  "St. Kitts and Nevis": "圣基茨和尼维斯 🇰🇳",
  "St. Lucia": "圣卢西亚 🇱🇨",
  "St. Vincent and the Grenadines": "圣文森特和格林纳丁斯 🇻🇨",
  "Trinidad and Tobago": "特立尼达和多巴哥 🇹🇹",
  "San Marino": "圣马力诺 🇸🇲",
  "South Sudan": "南苏丹 🇸🇸",
  "Sao Tome and Principe": "圣多美和普林西比 🇸🇹",
  "Papua New Guinea": "巴布亚新几内亚 🇵🇬",
  "Timor-Leste": "东帝汶 🇹🇱",
  "El Salvador": "萨尔瓦多 🇸🇻",
  "Solomon Islands": "所罗门群岛 🇸🇧",
  "Marshall Islands": "马绍尔群岛 🇲🇭",
  "Equatorial Guinea": "赤道几内亚 🇬🇶",
  "Central African Republic": "中非共和国 🇨🇫",
  "Burkina Faso": "布基纳法索 🇧🇫",
  "Bosnia and Herzegovina": "波斯尼亚和黑塞哥维那 🇧🇦",
  "Antigua and Barbuda": "安提瓜和巴布达 🇦🇬",
  "Dominican Republic": "多米尼加共和国 🇩🇴",
  "Costa Rica": "哥斯达黎加 🇨🇷",
  "Cape Verde": "佛得角 🇨🇻",
  // 世界银行数据源中的特殊国家名称
  "Brunei Darussalam": "文莱 🇧🇳",
  "Syrian Arab Republic": "叙利亚 🇸🇾",
  "Yemen, Rep.": "也门 🇾🇪",
  "Hong Kong SAR, China": "中国香港 🇭🇰",
  "Macao SAR, China": "中国澳门 🇲🇴",
  "Türkiye": "土耳其 🇹🇷",
  "Czechia": "捷克 🇨🇿",
  "Eswatini": "斯威士兰 🇸🇿",
  "Bahamas, The": "巴哈马 🇧🇸",
  "Gambia, The": "冈比亚 🇬🇲",
  "Cabo Verde": "佛得角 🇨🇻",
};

// 国家颜色映射（移到组件外部，避免重复创建）
const countryColors: Record<string, string> = {
  "中国 🇨🇳": "#de2910", // 中国红
  "美国 🇺🇸": "#002868", // 美国蓝
  "日本 🇯🇵": "#2c4a7e", // 日本蓝
  "德国 🇩🇪": "#333333", // 德国黑
  "印度 🇮🇳": "#ff9933", // 印度橙
  "英国 🇬🇧": "#00247d", // 英国蓝
  "法国 🇫🇷": "#002395", // 法国蓝
  "意大利 🇮🇹": "#008c45", // 意大利绿
  "巴西 🇧🇷": "#009c3b", // 巴西绿
  "加拿大 🇨🇦": "#002868", // 加拿大蓝
  "韩国 🇰🇷": "#003478", // 韩国蓝
  "俄罗斯 🇷🇺": "#0039a6", // 俄罗斯蓝
  "澳大利亚 🇦🇺": "#00008b", // 澳大利亚蓝
  "西班牙 🇪🇸": "#0055a5", // 西班牙蓝
  "墨西哥 🇲🇽": "#006847", // 墨西哥绿
  "印度尼西亚 🇮🇩": "#d4aa00", // 印度尼西亚金
  "荷兰 🇳🇱": "#ffaa00", // 荷兰金
  "沙特阿拉伯 🇸🇦": "#006c35", // 沙特绿
  "土耳其 🇹🇷": "#2d6a4f", // 土耳其绿
  "瑞士 🇨🇭": "#2d6a4f", // 瑞士绿
};

const GDPRanking = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const datasetSourceRef = useRef<(string | number)[][]>([]);
  const recordingFinishedRef = useRef(false);

  // 使用 state 管理当前年份索引
  const [, setCurrentYearIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const updateFrequency = 500;

  // 视频录制功能
  const { recordedVideoUrl, startRecording, stopRecording, downloadVideo } =
    useVideoRecorder({
      frameRate: 30,
      videoBitsPerSecond: 5000000,
      mimeType: "video/mp4",
    });

  // 更新图表的函数
  const updateYear = (year: string) => {
    const source = datasetSourceRef.current.slice(1).filter(function (
      d: (string | number)[],
    ) {
      return d[3] === year;
    });

    // 按 GDP 排序并取前10
    source.sort(function (a: (string | number)[], b: (string | number)[]) {
      return (b[1] as number) - (a[1] as number);
    });

    // 判断是否为预测年份
    const yearNum = parseInt(year);
    const displayYear = yearNum > 2024 ? `(预测)${year}` : year;

    return {
      dataset: {
        source: source.slice(0, 10),
      },
      graphic: {
        elements: [
          {
            type: "text",
            right: 160,
            bottom: 60,
            style: {
              text: displayYear,
              font: "bolder 100px monospace",
              fill: "rgba(100, 100, 100, 0.25)",
            },
            z: 100,
          },
        ],
      },
    };
  };

  useEffect(() => {
    if (!chartRef.current) return;

    // 如果已存在实例，先销毁
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const data = rawData as GDPData;

    // 过滤年份：只保留1990年及之后的数据
    const filteredYears = data.years.filter((year) => parseInt(year) >= 1990);

    // 将数据转换为 ECharts dataset 格式
    const datasetSource: (string | number)[][] = [];
    // 表头: ['CountryName', 'GDP', 'Country', 'Year']
    datasetSource.push(["CountryName", "GDP", "Country", "Year"]);

    // 填充数据
    data.countryNames.forEach((countryName) => {
      const countryGeo = data.countries[data.countryNames.indexOf(countryName)];
      const chineseName = countryNameMap[countryName] || countryName;
      const countryValues = data.values[countryName];
      filteredYears.forEach((year) => {
        const gdp = countryValues[year];
        if (gdp !== undefined) {
          // 将 GDP 值转换为数字
          const gdpNumber = typeof gdp === "string" ? parseFloat(gdp) : gdp;
          if (!isNaN(gdpNumber)) {
            datasetSource.push([chineseName, gdpNumber, countryGeo, year]);
          }
        }
      });
    });

    // 存储到 ref 以便在其他地方使用
    datasetSourceRef.current = datasetSource;

    const startIndex = 0;
    const startYear = filteredYears[startIndex];

    const option: echarts.EChartsOption = {
      backgroundColor: '#fff',
      title: {
        text: "世界GDP 排名（1990-2040）",
        left: "center",
        top: 20,
        textStyle: {
          fontSize: 24,
        },
      },
      grid: {
        top: 80,
        bottom: 60,
        left: 120,
        right: 150,
      },
      xAxis: {
        max: "dataMax",
        axisLabel: {
          fontSize: 14,
          formatter: function (n: number) {
            return (n / 1e12).toFixed(2) + "万亿美元";
          },
        },
      },
      dataset: updateYear(startYear).dataset,
      yAxis: {
        type: "category",
        inverse: true,
        max: 9, // 显示前10名
        axisLabel: {
          show: true,
          fontSize: 22,
          formatter: function (value: any) {
            return value;
          },
        },
        animationDuration: 300,
        animationDurationUpdate: 300,
      },
      series: [
        {
          realtimeSort: true,
          seriesLayoutBy: "column",
          type: "bar",
          itemStyle: {
            color: function (param: any) {
              const countryName = (param.value as (string | number)[])[0];
              return countryColors[countryName] || "#5470c6";
            },
          },
          encode: {
            x: 1,
            y: 0,
          },
          label: {
            show: true,
            precision: 1,
            position: "right",
            valueAnimation: true,
            fontSize: 20,
            fontFamily: "monospace",
            formatter: function (params: any) {
              const value = params.value as (string | number)[];
              const gdp = value[1] as number;
              return (gdp / 1e12).toFixed(2) + "万亿美元";
            },
          },
        },
      ],
      animationDuration: 0,
      animationDurationUpdate: updateFrequency,
      animationEasing: "linear",
      animationEasingUpdate: "linear",
      graphic: updateYear(startYear).graphic,
    };

    chart.setOption(option);

    // 响应式
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    // 将 updateYear 函数暴露给外部使用
    (chartInstance.current as any).updateYear = updateYear;

    // 获取 canvas 并开始录制
    const canvas = chartRef.current.querySelector("canvas");
    const totalAnimationDuration = filteredYears.length * updateFrequency;

    if (canvas && !recordingFinishedRef.current) {
      startRecording(canvas);
    }

    // 动画结束后停止录制
    setTimeout(() => {
      if (!recordingFinishedRef.current) {
        stopRecording();
        recordingFinishedRef.current = true;
      }
    }, totalAnimationDuration + 500);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      recordingFinishedRef.current = false;
    };
  }, [startRecording, stopRecording]);

  // 使用 useEffect 管理动画循环
  useEffect(() => {
    if (!isPlaying || !chartInstance.current) return;

    const data = rawData as GDPData;
    const filteredYears = data.years.filter((year) => parseInt(year) >= 1990);

    const timer = setInterval(() => {
      setCurrentYearIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;

        if (nextIndex < filteredYears.length) {
          // 调用 updateYear 更新图表
          const year = filteredYears[nextIndex];
          const updateData = updateYear(year);
          chartInstance.current?.setOption(updateData);
          return nextIndex;
        } else {
          // 动画结束
          setIsPlaying(false);
          return prevIndex;
        }
      });
    }, updateFrequency);

    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div>
      {recordedVideoUrl && (
        <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
          <button
            onClick={() => downloadVideo("gdp-ranking-1990-2024.mp4")}
            style={{
              padding: "8px 16px",
              background: "#52c41a",
              color: "white",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            📥 下载视频
          </button>
          <a
            href={recordedVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 16px",
              background: "#722ed1",
              color: "white",
              textDecoration: "none",
              borderRadius: 4,
            }}
          >
            ▶️ 预览视频
          </a>
        </div>
      )}
      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: "100vh",
        }}
      />
    </div>
  );
};

export default GDPRanking;

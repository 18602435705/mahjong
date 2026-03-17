import { useEffect, useRef } from "react";
import * as echarts from "echarts";
import rawData from "../assets/lifeExpectancyData.json";
import { useVideoRecorder } from "../hooks/useVideoRecorder";

interface LifeExpectancyData {
  countries: string[];
  countryNames: string[];
  years: string[];
  values: Record<string, Record<string, number>>;
}

const LifeExpectancy = () => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const animationDuration = 12000; // 动画时长 10 秒
  const recordingFinishedRef = useRef(false);

  const { recordedVideoUrl, startRecording, stopRecording, downloadVideo } =
    useVideoRecorder({
      frameRate: 30,
      videoBitsPerSecond: 5000000,
      mimeType: "video/mp4",
    });

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = echarts.init(chartRef.current);
    chartInstance.current = chart;

    const data = rawData as LifeExpectancyData;

    // 将数据转换为 ECharts dataset 格式
    const datasetSource: (string | number)[][] = [];
    // 表头: ['Country', 'Year', 'LifeExpectancy']
    datasetSource.push(["Country", "Year", "LifeExpectancy"]);

    // 填充数据（只保留1845-2030年的数据）
    data.countries.forEach((country) => {
      const countryValues = data.values[country];
      data.years.forEach((year) => {
        const yearNum = parseInt(year, 10);
        if (yearNum >= 1845 && yearNum <= 2030) {
          const lifeExpectancy = countryValues[year];
          if (lifeExpectancy !== undefined) {
            datasetSource.push([country, yearNum, lifeExpectancy]);
          }
        }
      });
    });

    // 选择要显示的国家（使用中文国名）
    const countries = ["中国", "美国", "俄罗斯"];

    // 国家颜色映射
    const countryColors: Record<string, string> = {
      中国: "#e74c3c",
      美国: "#3498db",
      俄罗斯: "#2c3e50",
    };

    // 创建数据集过滤器
    const datasetWithFilters: echarts.DatasetComponentOption[] = [];
    const seriesList: echarts.SeriesOption[] = [];

    countries.forEach((country) => {
      const datasetId = "dataset_" + country;
      datasetWithFilters.push({
        id: datasetId,
        fromDatasetId: "dataset_raw",
        transform: {
          type: "filter",
          config: {
            and: [
              { dimension: "Year", gte: 1845 },
              { dimension: "Country", "=": country },
            ],
          },
        },
      });
      seriesList.push({
        type: "line",
        datasetId: datasetId,
        showSymbol: false,
        name: country,
        itemStyle: {
          color: countryColors[country],
        },
        lineStyle: {
          color: countryColors[country],
        },
        endLabel: {
          show: true,
          fontSize: 20,
          color: countryColors[country],
          formatter: function (
            params: echarts.DefaultLabelFormatterCallbackParams,
          ) {
            const value = params.value as (string | number)[];
            return value[0] + ": " + (value[2] as number).toFixed(1);
          },
        },
        labelLayout: {
          moveOverlap: "shiftY",
        },
        emphasis: {
          focus: "series",
        },
        encode: {
          x: "Year",
          y: "LifeExpectancy",
          label: ["Country", "LifeExpectancy"],
          itemName: "Year",
          tooltip: ["LifeExpectancy"],
        },
      });
    });

    const option: echarts.EChartsOption = {
      backgroundColor: "#fff",
      animationDuration: animationDuration,
      dataset: [
        {
          id: "dataset_raw",
          source: datasetSource,
        },
        ...datasetWithFilters,
      ],
      title: {
        text: "各国人均寿命变化趋势 (1845-2030年)",
        left: "center",
      },
      tooltip: {
        order: "valueDesc",
        trigger: "axis",
      },
      xAxis: {
        type: "category",
        nameLocation: "middle",
        name: "年份",
        axisLabel: {
          rotate: 45,
        },
      },
      yAxis: {
        name: "人均寿命 (岁)",
        min: 20,
        max: 100,
      },
      grid: {
        right: 100,
        left: 60,
        bottom: 60,
      },
      legend: {
        data: countries,
        top: 40,
      },
      series: seriesList,
    };

    chart.setOption(option);

    // 获取 canvas 并开始录制
    const canvas = chartRef.current.querySelector("canvas");
    if (canvas) {
      startRecording(canvas);
    }

    // 动画结束后停止录制
    setTimeout(() => {
      if (!recordingFinishedRef.current) {
        stopRecording();
        recordingFinishedRef.current = true;
      }
    }, animationDuration + 100);

    // 响应式
    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
      recordingFinishedRef.current = false;
    };
  }, []);

  return (
    <div>
      {recordedVideoUrl && (
        <div style={{ marginBottom: 16, display: "flex", gap: 8 }}>
          <button
            onClick={() => downloadVideo()}
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

      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        人均寿命变化趋势图
      </h2>
      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: "100vh",
        }}
      />

      {/* {recordedVideoUrl && (
        <div style={{ marginTop: 16 }}>
          <h4>录制预览：</h4>
          <video
            src={recordedVideoUrl}
            controls
            style={{ maxWidth: "100%", border: "1px solid #d9d9d9" }}
          />
        </div>
      )} */}
    </div>
  );
};

export default LifeExpectancy;

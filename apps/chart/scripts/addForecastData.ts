import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface GDPData {
  countries: string[];
  countryNames: string[];
  years: string[];
  values: Record<string, Record<string, number | string>>;
}

// 预测数据（单位：万亿美元）
const forecastData: Record<string, Record<string, number>> = {
  "中国": {
    "2025": 21.9, "2026": 23.1, "2027": 24.4, "2028": 25.8, "2029": 27.3,
    "2030": 28.9, "2031": 30.7, "2032": 32.6, "2033": 34.6, "2034": 36.8,
    "2035": 39.2, "2036": 41.8, "2037": 44.6, "2038": 47.6, "2039": 50.9, "2040": 54.4
  },
  "美国": {
    "2025": 30.3, "2026": 31.0, "2027": 31.8, "2028": 32.6, "2029": 33.4,
    "2030": 34.2, "2031": 35.1, "2032": 36.0, "2033": 36.9, "2034": 37.9,
    "2035": 38.9, "2036": 39.9, "2037": 41.0, "2038": 42.1, "2039": 43.2, "2040": 44.4
  },
  "印度": {
    "2025": 4.6, "2026": 5.0, "2027": 5.5, "2028": 6.1, "2029": 6.7,
    "2030": 7.3, "2031": 8.0, "2032": 8.8, "2033": 9.7, "2034": 10.7,
    "2035": 11.8, "2036": 13.0, "2037": 14.3, "2038": 15.8, "2039": 17.4, "2040": 19.2
  },
  "德国": {
    "2025": 5.1, "2026": 5.2, "2027": 5.3, "2028": 5.4, "2029": 5.5,
    "2030": 5.6, "2031": 5.7, "2032": 5.8, "2033": 5.9, "2034": 6.0,
    "2035": 6.1, "2036": 6.2, "2037": 6.3, "2038": 6.4, "2039": 6.5, "2040": 6.6
  },
  "英国": {
    "2025": 4.2, "2026": 4.3, "2027": 4.5, "2028": 4.6, "2029": 4.8,
    "2030": 5.0, "2031": 5.2, "2032": 5.4, "2033": 5.6, "2034": 5.8,
    "2035": 6.0, "2036": 6.2, "2037": 6.4, "2038": 6.6, "2039": 6.8, "2040": 7.1
  },
  "日本": {
    "2025": 4.7, "2026": 4.6, "2027": 4.6, "2028": 4.5, "2029": 4.5,
    "2030": 4.4, "2031": 4.4, "2032": 4.3, "2033": 4.3, "2034": 4.2,
    "2035": 4.2, "2036": 4.1, "2037": 4.1, "2038": 4.0, "2039": 4.0, "2040": 3.9
  },
  "法国": {
    "2025": 3.5, "2026": 3.6, "2027": 3.7, "2028": 3.7, "2029": 3.8,
    "2030": 3.9, "2031": 4.0, "2032": 4.0, "2033": 4.1, "2034": 4.2,
    "2035": 4.3, "2036": 4.3, "2037": 4.4, "2038": 4.5, "2039": 4.6, "2040": 4.7
  },
  "巴西": {
    "2025": 2.6, "2026": 2.7, "2027": 2.9, "2028": 3.0, "2029": 3.2,
    "2030": 3.4, "2031": 3.6, "2032": 3.8, "2033": 4.0, "2034": 4.2,
    "2035": 4.5, "2036": 4.7, "2037": 5.0, "2038": 5.3, "2039": 5.6, "2040": 5.9
  },
  "俄罗斯": {
    "2025": 2.6, "2026": 2.7, "2027": 2.8, "2028": 2.9, "2029": 3.0,
    "2030": 3.1, "2031": 3.2, "2032": 3.3, "2033": 3.4, "2034": 3.5,
    "2035": 3.6, "2036": 3.7, "2037": 3.8, "2038": 3.9, "2039": 4.0, "2040": 4.1
  },
  "意大利": {
    "2025": 2.7, "2026": 2.7, "2027": 2.8, "2028": 2.8, "2029": 2.9,
    "2030": 2.9, "2031": 3.0, "2032": 3.0, "2033": 3.1, "2034": 3.1,
    "2035": 3.2, "2036": 3.2, "2037": 3.3, "2038": 3.3, "2039": 3.4, "2040": 3.4
  },
  "加拿大": {
    "2025": 2.5, "2026": 2.6, "2027": 2.6, "2028": 2.7, "2029": 2.8,
    "2030": 2.8, "2031": 2.9, "2032": 3.0, "2033": 3.0, "2034": 3.1,
    "2035": 3.2, "2036": 3.2, "2037": 3.3, "2038": 3.4, "2039": 3.4, "2040": 3.5
  },
  "韩国": {
    "2025": 2.2, "2026": 2.3, "2027": 2.4, "2028": 2.5, "2029": 2.6,
    "2030": 2.7, "2031": 2.8, "2032": 2.9, "2033": 3.0, "2034": 3.1,
    "2035": 3.2, "2036": 3.3, "2037": 3.4, "2038": 3.5, "2039": 3.6, "2040": 3.7
  },
  "墨西哥": {
    "2025": 2.2, "2026": 2.3, "2027": 2.4, "2028": 2.5, "2029": 2.6,
    "2030": 2.7, "2031": 2.8, "2032": 2.9, "2033": 3.0, "2034": 3.1,
    "2035": 3.2, "2036": 3.3, "2037": 3.4, "2038": 3.5, "2039": 3.6, "2040": 3.7
  },
  "澳大利亚": {
    "2025": 2.1, "2026": 2.2, "2027": 2.2, "2028": 2.3, "2029": 2.3,
    "2030": 2.4, "2031": 2.4, "2032": 2.5, "2033": 2.5, "2034": 2.6,
    "2035": 2.6, "2036": 2.7, "2037": 2.7, "2038": 2.8, "2039": 2.8, "2040": 2.9
  },
  "西班牙": {
    "2025": 2.0, "2026": 2.0, "2027": 2.1, "2028": 2.1, "2029": 2.2,
    "2030": 2.2, "2031": 2.3, "2032": 2.3, "2033": 2.4, "2034": 2.4,
    "2035": 2.5, "2036": 2.5, "2037": 2.6, "2038": 2.6, "2039": 2.7, "2040": 2.7
  }
};

// 中文名称到英文国家名称的映射
const chineseToEnglishMap: Record<string, string[]> = {
  "中国": ["China"],
  "美国": ["United States"],
  "印度": ["India"],
  "德国": ["Germany"],
  "英国": ["United Kingdom"],
  "日本": ["Japan"],
  "法国": ["France"],
  "巴西": ["Brazil"],
  "俄罗斯": ["Russia", "Russian Federation"],
  "意大利": ["Italy"],
  "加拿大": ["Canada"],
  "韩国": ["South Korea", "Korea, Rep."],
  "墨西哥": ["Mexico"],
  "澳大利亚": ["Australia"],
  "西班牙": ["Spain"],
};

function addForecastData() {
  // 读取现有的 GDP 数据
  const dataPath = path.resolve(__dirname, '../src/assets/gdpDataFromCSV.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8')) as GDPData;

  console.log('=== 添加预测数据到 GDP 数据源 ===\n');
  console.log(`原始年份范围: ${data.years[0]} - ${data.years[data.years.length - 1]}`);

  // 添加预测年份 (2025-2040)
  const forecastYears = Object.keys(forecastData["中国"]); // 使用中国的年份作为基准
  const currentLastYear = parseInt(data.years[data.years.length - 1]);

  // 添加新的年份到 years 数组
  forecastYears.forEach(year => {
    const yearNum = parseInt(year);
    if (yearNum > currentLastYear && !data.years.includes(year)) {
      data.years.push(year);
    }
  });

  // 对年份进行排序
  data.years.sort((a, b) => parseInt(a) - parseInt(b));

  console.log(`更新后年份范围: ${data.years[0]} - ${data.years[data.years.length - 1]}`);
  console.log(`新增年份数量: ${forecastYears.length}`);

  // 将预测数据添加到对应的国家
  let addedCount = 0;
  let matchedCountries = 0;

  Object.entries(forecastData).forEach(([chineseName, yearData]) => {
    const possibleNames = chineseToEnglishMap[chineseName];
    if (!possibleNames) {
      console.log(`⚠️  警告: 未找到 ${chineseName} 的英文名称映射`);
      return;
    }

    // 尝试匹配现有的国家名称
    for (const englishName of possibleNames) {
      if (data.values[englishName]) {
        // 找到匹配的国家，添加预测数据
        Object.entries(yearData).forEach(([year, valueInTrillions]) => {
          // 将万亿美元转换为美元
          const valueInDollars = valueInTrillions * 1e12;
          data.values[englishName][year] = valueInDollars;
          addedCount++;
        });
        matchedCountries++;
        console.log(`✅ 已添加 ${chineseName} (${englishName}) 的预测数据`);
        break;
      }
    }
  });

  console.log(`\n=== 总结 ===`);
  console.log(`匹配国家数量: ${matchedCountries}/${Object.keys(forecastData).length}`);
  console.log(`添加数据点数量: ${addedCount}`);

  // 保存更新后的数据
  const outputPath = path.resolve(__dirname, '../src/assets/gdpDataFromCSV.json');
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8');

  console.log(`\n数据已保存到: ${outputPath}`);
  console.log(`文件大小: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
}

// 执行添加预测数据
addForecastData();

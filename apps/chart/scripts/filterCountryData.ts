import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 需要过滤的非国家实体（大洲、地区、收入分组等）
const excludePatterns = [
  // 大洲和地区
  'Africa',
  'Asia',
  'America',
  'Europe',
  'Oceania',
  'Pacific',
  'Arab World',
  'Euro area',
  'European Union',
  'North America',
  'South Asia',
  'Central Europe',
  'Caribbean',
  'Baltics',
  'Middle East',
  'North Africa',
  'Sub-Saharan',
  'Latin America',
  'East Asia',
  'West Africa',

  // 收入分组
  'income',
  'High income',
  'Low income',
  'Lower middle income',
  'Middle income',
  'Upper middle income',
  'Low & middle income',

  // 世界银行分组
  'IDA',
  'IBRD',
  'IBD',
  'OECD',
  'HIPC',
  'FCS',
  'SSA',

  // 地区分组代码
  'EAP',
  'ECA',
  'LAC',
  'MNA',
  'SAR',
  'EMU',

  // 其他分组
  'Small states',
  'Heavily indebted',
  'World',
  'countries',
  'excluding',
  'aggregate',

  // 人口学分组
  'demographic',
  'dividend',
  'Pre-demographic',
  'Post-demographic',
  'Early-demographic',
  'Late-demographic',

  // 特别行政区（根据需要保留或删除）
  // 'Hong Kong SAR',
  // 'Macao SAR',
  // 'Channel Islands',
  // 'Isle of Man',
  // 'Puerto Rico',

  // 领土
  'American Samoa',
  'Northern Mariana Islands',
  'Virgin Islands',
  'St.',
  'Sao Tome',
  'Mayotte',
  'New Caledonia',
  'French Polynesia',
  'Guam',
  'Cook Islands',
  'Wallis',
  'Futuna',
  'Martinique',
  'Guadeloupe',
  'Réunion',
];

// 判断是否为真实的国家
function isRealCountry(countryName: string): boolean {
  // 保留真正的国家
  const keepCountries = [
    // 保留主要国家
    'United States', 'China', 'Japan', 'Germany', 'United Kingdom',
    'France', 'India', 'Italy', 'Brazil', 'Canada', 'Russia',
    'South Korea', 'Australia', 'Spain', 'Mexico', 'Indonesia',
    'Netherlands', 'Saudi Arabia', 'Turkey', 'Switzerland', 'Poland',

    // 保留包含 "Africa", "America", "Arab", "South" 等词的真实国家
    'South Africa', 'South Sudan', 'Central African Republic',
    'Egypt, Arab Rep.', 'Syrian Arab Republic', 'Saudi Arabia',
    'United Arab Emirates', 'North Macedonia',
    'American Samoa', 'Northern Mariana Islands', // 实际上这些是领土，可以选择删除

    // 保留香港和澳门（如果需要）
    'Hong Kong SAR, China', 'Macao SAR, China',
  ];

  // 检查是否在保留列表中
  if (keepCountries.includes(countryName)) {
    return true;
  }

  // 检查是否匹配排除模式
  for (const pattern of excludePatterns) {
    if (countryName.includes(pattern)) {
      return false;
    }
  }

  // 排除三个字母的代码（通常是地区代码）
  if (/^[A-Z]{3}$/.test(countryName)) {
    return false;
  }

  return true;
}

interface GDPData {
  countries: string[];
  countryNames: string[];
  years: string[];
  values: Record<string, Record<string, number | string>>;
}

// 读取 JSON 文件
const inputPath = path.resolve(__dirname, '../src/assets/gdpDataFromCSV.json');
const jsonData = JSON.parse(fs.readFileSync(inputPath, 'utf-8')) as GDPData;

// 过滤数据
const filteredCountryNames: string[] = [];
const filteredCountries: string[] = [];
const filteredValues: Record<string, Record<string, number | string>> = {};

jsonData.countryNames.forEach((countryName, index) => {
  if (isRealCountry(countryName)) {
    filteredCountryNames.push(countryName);
    filteredCountries.push(jsonData.countries[index]);
    filteredValues[countryName] = jsonData.values[countryName];
  }
});

// 构建过滤后的数据
const filteredData: GDPData = {
  countries: filteredCountries,
  countryNames: filteredCountryNames,
  years: jsonData.years,
  values: filteredValues,
};

// 输出结果
const outputPath = path.resolve(__dirname, '../src/assets/gdpDataFromCSV.json');
fs.writeFileSync(outputPath, JSON.stringify(filteredData, null, 2), 'utf-8');

console.log(`数据过滤完成!`);
console.log(`原始国家数量: ${jsonData.countryNames.length}`);
console.log(`过滤后国家数量: ${filteredCountryNames.length}`);
console.log(`移除的非国家实体: ${jsonData.countryNames.length - filteredCountryNames.length}`);
console.log(`\n输出文件: ${outputPath}`);

// 显示被移除的一些实体
const removedEntities = jsonData.countryNames.filter(name => !isRealCountry(name));
console.log(`\n移除的实体示例 (前20个):`);
removedEntities.slice(0, 20).forEach(entity => {
  console.log(`  - ${entity}`);
});

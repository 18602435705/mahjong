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

interface CountryMetadata {
  code: string;
  region: string;
  incomeGroup: string;
  tableName: string;
  isAggregate: boolean;
}

/**
 * 解析 CSV 行，正确处理带引号的字段
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

/**
 * 读取国家元数据，用于识别聚合实体
 */
function readCountryMetadata(): Map<string, CountryMetadata> {
  const metadataPath = path.resolve(
    __dirname,
    '../src/assets/API_NY.GDP.MKTP.CD_DS2_en_csv_v2_133326/Metadata_Country_API_NY.GDP.MKTP.CD_DS2_en_csv_v2_133326.csv'
  );

  const metadataContent = fs.readFileSync(metadataPath, 'utf-8');
  const lines = metadataContent.split('\n').filter(line => line.trim());

  const metadata = new Map<string, CountryMetadata>();

  // 跳过表头
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVLine(lines[i]);
    if (fields.length < 2) continue;

    const code = fields[0].replace(/"/g, '').trim();
    const region = fields[1] ? fields[1].replace(/"/g, '').trim() : '';
    const incomeGroup = fields[2] ? fields[2].replace(/"/g, '').trim() : '';
    const specialNotes = fields[3] ? fields[3].replace(/"/g, '').trim() : '';
    const tableName = fields[4] ? fields[4].replace(/"/g, '').trim() : '';

    // 判断是否为聚合实体
    // 1. Region 为空通常是聚合实体
    // 2. SpecialNotes 中包含 "aggregate" 关键词
    // 3. 某些特定的代码模式
    const isAggregate =
      region === '' ||
      specialNotes.toLowerCase().includes('aggregate') ||
      code.startsWith('XF_') ||
      code.startsWith('X_') ||
      ['WLD', 'LMY', 'HIC', 'MIC', 'LIC', 'UMC', 'LMC'].includes(code);

    metadata.set(code, {
      code,
      region,
      incomeGroup,
      tableName,
      isAggregate,
    });
  }

  return metadata;
}

/**
 * 转换 GDP 数据
 */
function convertGDPData() {
  // 读取 CSV 文件
  const csvFilePath = path.resolve(
    __dirname,
    '../src/assets/API_NY.GDP.MKTP.CD_DS2_en_csv_v2_133326/API_NY.GDP.MKTP.CD_DS2_en_csv_v2_133326.csv'
  );
  const csvContent = fs.readFileSync(csvFilePath, 'utf-8');

  // 读取国家元数据
  const countryMetadata = readCountryMetadata();

  // 解析 CSV
  const lines = csvContent.split('\n').filter(line => line.trim());

  // 跳过前两行元数据，从第3行开始
  const headerLine = lines[2]; // 数据列名行
  const dataLines = lines.slice(3); // 数据行

  // 解析表头，提取年份列
  const headers = parseCSVLine(headerLine);
  const years = headers.slice(4).map(h => h.replace(/"/g, '').trim()); // 从第5列开始都是年份

  // 过滤有效年份（非空且是数字）
  const validYears = years.filter(year => year && /^\d{4}$/.test(year));

  // 解析数据
  const countryNames: string[] = [];
  const countries: string[] = [];
  const values: Record<string, Record<string, number | string>> = {};

  let skippedCount = 0;
  let aggregateCount = 0;

  dataLines.forEach(line => {
    if (!line.trim()) return;

    const fields = parseCSVLine(line);
    if (fields.length < 4) return;

    const countryName = fields[0].replace(/"/g, '').trim();
    const countryCode = fields[1].replace(/"/g, '').trim();
    const indicatorName = fields[2].replace(/"/g, '').trim();

    // 只处理 GDP 数据
    if (indicatorName !== 'GDP (current US$)') return;

    // 检查是否为聚合实体
    const metadata = countryMetadata.get(countryCode);
    if (metadata?.isAggregate) {
      aggregateCount++;
      console.log(`跳过聚合实体: ${countryName} (${countryCode})`);
      return;
    }

    // 解析每年的数据
    const countryValues: Record<string, number | string> = {};
    let dataCount = 0;

    validYears.forEach((year, index) => {
      const rawValue = fields[4 + index];
      if (rawValue && rawValue !== '""') {
        const value = parseFloat(rawValue.replace(/"/g, ''));
        if (!isNaN(value) && value > 0) {
          countryValues[year] = value;
          dataCount++;
        }
      }
    });

    // 只保留有足够数据的国家（至少有20年的数据）
    if (dataCount >= 20) {
      countryNames.push(countryName);
      countries.push(countryCode);
      values[countryName] = countryValues;
    } else {
      console.log(`跳过数据不足的国家: ${countryName} (${dataCount} 年数据)`);
      skippedCount++;
    }
  });

  // 构建最终数据结构
  const gdpData: GDPData = {
    countries,
    countryNames,
    years: validYears,
    values,
  };

  // 输出到 JSON 文件
  const outputPath = path.resolve(__dirname, '../src/assets/gdpDataFromCSV.json');
  fs.writeFileSync(outputPath, JSON.stringify(gdpData, null, 2), 'utf-8');

  console.log('\n=== GDP 数据转换完成 ===');
  console.log(`总国家数量: ${countryNames.length}`);
  console.log(`跳过的聚合实体: ${aggregateCount}`);
  console.log(`跳过的数据不足国家: ${skippedCount}`);
  console.log(`年份范围: ${validYears[0]} - ${validYears[validYears.length - 1]}`);
  console.log(`输出文件: ${outputPath}`);
  console.log(`文件大小: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
}

// 执行转换
convertGDPData();

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const EXCEL_DUMPS_DIR = path.join(__dirname, '../excel-dumps');
const TEMPLATES_DIR = path.join(__dirname, '../data-templates');

/**
 * Excel 날짜를 JavaScript Date로 변환
 */
function excelDateToJSDate(excelDate) {
  if (typeof excelDate === 'number') {
    // Excel의 날짜는 1900-01-01부터의 일수
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date;
  }
  if (typeof excelDate === 'string') {
    return new Date(excelDate);
  }
  return excelDate;
}

/**
 * 날짜가 고정된 연중 행사인지 판단 (1~2월 날짜)
 */
function isFixedYearlyEvent(date) {
  if (!(date instanceof Date)) return false;
  const month = date.getMonth(); // 0-indexed
  return month === 0 || month === 1; // January or February
}

/**
 * 날짜를 템플릿 규칙으로 변환
 */
function convertToDateRule(dateValue, baseDate = new Date()) {
  if (!dateValue) return dateValue;

  let date;
  if (dateValue instanceof Date) {
    date = dateValue;
  } else if (typeof dateValue === 'string') {
    date = new Date(dateValue);
  } else if (typeof dateValue === 'number') {
    date = excelDateToJSDate(dateValue);
  } else {
    return dateValue;
  }

  if (isNaN(date.getTime())) {
    return dateValue;
  }

  // 고정된 연중 행사 (1~2월)
  if (isFixedYearlyEvent(date)) {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // 시간이 00:00이면 날짜만
    if (hours === '00' && minutes === '00') {
      return `fixed:${month}-${day}`;
    }
    return `fixed:${month}-${day}T${hours}:${minutes}`;
  }

  // 상대 날짜 계산
  const diffMs = date.getTime() - baseDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'today';
  } else if (diffDays > 0) {
    return `relative:+${diffDays}d`;
  } else {
    return `relative:${diffDays}d`;
  }
}

/**
 * 값의 타입을 적절하게 변환
 */
function convertValueType(key, value) {
  // Boolean 필드 처리
  const booleanFields = ['requiresApproval', 'isRead', 'isUrgent', 'isPinned', 'isAvailable', 'isRecurring'];
  if (booleanFields.includes(key)) {
    if (value === 'TRUE' || value === true) return true;
    if (value === 'FALSE' || value === false) return false;
  }

  // 배열 필드 처리 (파이프로 구분된 문자열을 배열로 변환)
  const arrayFields = ['closedDates', 'tags', 'categories'];
  if (arrayFields.includes(key) && typeof value === 'string' && value.trim()) {
    return value.split('|').map(item => item.trim());
  }

  // 빈 배열 필드 처리
  if (arrayFields.includes(key) && (!value || value === '')) {
    return [];
  }

  return value;
}

/**
 * 객체의 날짜 필드를 템플릿 규칙으로 변환
 */
function convertDatesToRules(obj, baseDate = new Date()) {
  if (Array.isArray(obj)) {
    return obj.map(item => convertDatesToRules(item, baseDate));
  }

  if (obj !== null && typeof obj === 'object') {
    const converted = {};

    for (const [key, value] of Object.entries(obj)) {
      const isDateField = ['date', 'createdAt', 'updatedAt', 'dueDate', 'rentalDate'].includes(key);

      if (isDateField && value) {
        converted[key] = convertToDateRule(value, baseDate);
      } else if (key === 'closedDates') {
        // closedDates는 배열로 변환 후 각 항목을 날짜 규칙으로 변환
        const closedDatesArray = convertValueType(key, value);
        if (Array.isArray(closedDatesArray) && closedDatesArray.length > 0) {
          converted[key] = closedDatesArray.map(dateVal => {
            const rule = convertToDateRule(dateVal, baseDate);
            return rule;
          });
        } else {
          converted[key] = [];
        }
      } else if (typeof value === 'object' && value !== null) {
        converted[key] = convertDatesToRules(value, baseDate);
      } else {
        // 타입 변환 적용
        converted[key] = convertValueType(key, value);
      }
    }

    return converted;
  }

  return obj;
}

/**
 * Excel 파일을 JSON 템플릿으로 변환
 */
function convertExcelToTemplate(excelPath, outputPath, baseDate = new Date()) {
  try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Excel을 JSON으로 변환
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // 날짜를 문자열로 유지
      dateNF: 'yyyy-mm-dd"T"hh:mm:ss' // 날짜 형식
    });

    // 날짜를 템플릿 규칙으로 변환
    const templateData = convertDatesToRules(jsonData, baseDate);

    // JSON 파일로 저장
    fs.writeFileSync(outputPath, JSON.stringify(templateData, null, 2), 'utf-8');
    console.log(`✓ Converted: ${path.basename(excelPath)} -> ${path.relative(process.cwd(), outputPath)}`);
  } catch (error) {
    console.error(`✗ Error converting ${excelPath}:`, error.message);
  }
}

/**
 * 디렉토리 재귀 처리
 */
function processDirectory(excelDir, templateDir, baseDate = new Date()) {
  if (!fs.existsSync(excelDir)) {
    console.log(`Skipping ${excelDir} (not found)`);
    return;
  }

  const entries = fs.readdirSync(excelDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === '.DS_Store') continue;

    const excelPath = path.join(excelDir, entry.name);
    const templatePath = path.join(templateDir, entry.name);

    if (entry.isDirectory()) {
      // 하위 디렉토리 처리
      if (!fs.existsSync(templatePath)) {
        fs.mkdirSync(templatePath, { recursive: true });
      }
      processDirectory(excelPath, templatePath, baseDate);
    } else if (entry.isFile() && entry.name.endsWith('.xlsx')) {
      // Excel 파일 변환
      const jsonFileName = entry.name.replace('.xlsx', '.json');
      const outputPath = path.join(templateDir, jsonFileName);
      convertExcelToTemplate(excelPath, outputPath, baseDate);
    }
  }
}

/**
 * 메인 실행
 */
function main() {
  console.log('📥 Importing data from Excel files...\n');

  const baseDate = new Date();
  console.log(`📅 Base date: ${baseDate.toISOString()}\n`);

  if (!fs.existsSync(EXCEL_DUMPS_DIR)) {
    console.error(`❌ Excel dumps directory not found: ${EXCEL_DUMPS_DIR}`);
    console.log('Please create the directory and add Excel files to import.');
    process.exit(1);
  }

  processDirectory(EXCEL_DUMPS_DIR, TEMPLATES_DIR, baseDate);

  console.log('\n✅ Excel import complete!');
  console.log('\n💡 Next step: Run `npm run dev` to generate data from updated templates.');
}

main();

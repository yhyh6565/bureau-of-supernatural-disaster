const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '../data-templates');
const OUTPUT_DIR = path.join(__dirname, '../src/data');

/**
 * 날짜 규칙을 실제 날짜로 변환
 * @param {string} rule - 날짜 규칙 (예: "today", "relative:+3d", "fixed:01-15")
 * @param {Date} baseDate - 기준 날짜 (기본값: 오늘)
 * @returns {string} ISO 8601 형식 날짜 문자열
 */
function applyDateRule(rule, baseDate = new Date()) {
  if (rule === 'today') {
    return baseDate.toISOString();
  }

  // relative 규칙: relative:+3d, relative:-2w
  if (rule.startsWith('relative:')) {
    const match = rule.match(/relative:([+-]\d+)([dwMy])/);
    if (!match) {
      console.warn(`Invalid relative date rule: ${rule}`);
      return baseDate.toISOString();
    }

    const [, offset, unit] = match;
    const offsetNum = parseInt(offset, 10);
    const newDate = new Date(baseDate);

    switch (unit) {
      case 'd': // days
        newDate.setDate(newDate.getDate() + offsetNum);
        break;
      case 'w': // weeks
        newDate.setDate(newDate.getDate() + offsetNum * 7);
        break;
      case 'M': // months
        newDate.setMonth(newDate.getMonth() + offsetNum);
        break;
      case 'y': // years
        newDate.setFullYear(newDate.getFullYear() + offsetNum);
        break;
    }

    return newDate.toISOString();
  }

  // fixed 규칙: fixed:01-15, fixed:01-15T10:00, fixed:2025-01-15
  if (rule.startsWith('fixed:')) {
    const dateStr = rule.replace('fixed:', '');

    // 이미 연도가 포함된 경우 (YYYY-MM-DD 체크)
    const hasYear = /^\d{4}-\d{2}-\d{2}/.test(dateStr);

    if (hasYear) {
      // 시간 포함 여부 체크
      if (dateStr.includes('T')) {
        return `${dateStr}:00`; // 초 단위 추가
      }
      return `${dateStr}T00:00:00`;
    }

    const currentYear = baseDate.getFullYear();

    // fixed:01-15T10:00 형식
    if (dateStr.includes('T')) {
      return `${currentYear}-${dateStr}:00`;
    }

    // fixed:01-15 형식 (시간 없음)
    return `${currentYear}-${dateStr}T00:00:00`;
  }

  // 규칙이 아닌 경우 그대로 반환
  return rule;
}

/**
 * 객체 내의 날짜 규칙을 재귀적으로 변환
 * @param {any} obj - 변환할 객체
 * @param {Date} baseDate - 기준 날짜
 * @returns {any} 변환된 객체
 */
function transformDates(obj, baseDate = new Date()) {
  if (Array.isArray(obj)) {
    return obj.map(item => transformDates(item, baseDate));
  }

  if (obj !== null && typeof obj === 'object') {
    const transformed = {};

    for (const [key, value] of Object.entries(obj)) {
      // 날짜 관련 필드 감지
      const isDateField = ['date', 'createdAt', 'updatedAt', 'dueDate', 'rentalDate'].includes(key);

      if (isDateField && typeof value === 'string') {
        // 날짜 규칙 적용
        transformed[key] = applyDateRule(value, baseDate);
      } else if (key === 'closedDates' && Array.isArray(value)) {
        // closedDates 배열 처리
        transformed[key] = value.map(dateRule => {
          const isoDate = applyDateRule(dateRule, baseDate);
          // YYYY-MM-DD 형식만 추출
          return isoDate.split('T')[0];
        });
      } else {
        // 재귀적으로 처리
        transformed[key] = transformDates(value, baseDate);
      }
    }

    return transformed;
  }

  return obj;
}

/**
 * 디렉토리 재귀적으로 생성
 */
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 템플릿 파일을 읽어서 날짜를 변환한 후 저장
 */
function processTemplates(templateDir, outputDir, baseDate = new Date()) {
  ensureDirectoryExists(outputDir);

  const entries = fs.readdirSync(templateDir, { withFileTypes: true });

  for (const entry of entries) {
    const templatePath = path.join(templateDir, entry.name);
    const outputPath = path.join(outputDir, entry.name);

    if (entry.isDirectory()) {
      // _base 디렉토리는 출력하지 않음
      if (entry.name === '_base') continue;

      // 하위 디렉토리 재귀 처리
      processTemplates(templatePath, outputPath, baseDate);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      // JSON 파일 처리
      try {
        let finalData;
        const currentContent = JSON.parse(fs.readFileSync(templatePath, 'utf-8'));

        // 페르소나 디렉토리 내부인 경우 (경로에 'personas'가 포함되고, '_base'가 아닌 경우)
        // 주의: templateDir 자체가 personas/choiyowon 형태일 수 있음.
        const isInPersonas = templatePath.includes(`${path.sep}personas${path.sep}`) && !templatePath.includes(`${path.sep}_base${path.sep}`);

        if (isInPersonas) {
          // 해당 파일의 base 파일 경로 찾기
          // 예: .../personas/choiyowon/schedules.json -> .../personas/_base/schedules.json
          // 현재 디렉토리 구조상 templatePath에서 부모 디렉토리 이름(choiyowon)을 _base로 치환해야 함

          const parentDir = path.dirname(templatePath);
          const parentDirName = path.basename(parentDir); // choiyowon
          const baseFilePath = templatePath.replace(
            `${path.sep}${parentDirName}${path.sep}`,
            `${path.sep}_base${path.sep}`
          );

          if (fs.existsSync(baseFilePath)) {
            const baseContent = JSON.parse(fs.readFileSync(baseFilePath, 'utf-8'));

            if (Array.isArray(baseContent) && Array.isArray(currentContent)) {
              // 배열인 경우 합침 (Base + Specific)
              finalData = [...baseContent, ...currentContent];
            } else if (typeof baseContent === 'object' && typeof currentContent === 'object') {
              // 객체인 경우 병합 (Specific이 Base를 덮어씀)
              finalData = { ...baseContent, ...currentContent };
            } else {
              finalData = currentContent;
            }
          } else {
            finalData = currentContent;
          }
        } else {
          finalData = currentContent;
        }

        const transformedData = transformDates(finalData, baseDate);

        fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2), 'utf-8');
        console.log(`✓ Generated: ${path.relative(process.cwd(), outputPath)}`);
      } catch (error) {
        console.error(`✗ Error processing ${templatePath}:`, error.message);
      }
    }
  }
}

/**
 * 메인 실행
 */
function main() {
  console.log('🔄 Generating dynamic data from templates...\n');

  const baseDate = new Date();
  console.log(`📅 Base date: ${baseDate.toISOString()}\n`);

  if (!fs.existsSync(TEMPLATES_DIR)) {
    console.error(`❌ Templates directory not found: ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  processTemplates(TEMPLATES_DIR, OUTPUT_DIR, baseDate);

  console.log('\n✅ Dynamic data generation complete!');
}

main();

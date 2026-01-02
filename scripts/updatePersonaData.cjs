const fs = require('fs');
const path = require('path');

const PERSONAS_DIR = path.join(__dirname, '../data-templates/personas');
const ORDINARY_DIR = path.join(__dirname, '../data-templates/ordinary');

// 페르소나 목록
const PERSONAS = [
  'choiyowon',
  'haegeum',
  'janghyeowoon',
  'koyoungeun',
  'parkhonglim',
  'ryujaegwan',
  'solum'
];

/**
 * 'me'를 페르소나 ID로 교체
 */
function replaceMeWithPersona(data, personaId) {
  const jsonString = JSON.stringify(data, null, 2);
  const replaced = jsonString.replace(/"me"/g, `"${personaId}"`);
  return JSON.parse(replaced);
}

/**
 * 페르소나별 데이터 업데이트
 */
function updatePersonaData(personaId) {
  const personaDir = path.join(PERSONAS_DIR, personaId);

  if (!fs.existsSync(personaDir)) {
    console.log(`⚠ Skipping ${personaId} (directory not found)`);
    return;
  }

  console.log(`\n📝 Processing ${personaId}...`);

  // 업데이트할 파일 목록
  const files = ['messages.json', 'approvals.json', 'schedules.json', 'notifications.json'];

  for (const fileName of files) {
    const filePath = path.join(personaDir, fileName);

    if (!fs.existsSync(filePath)) {
      console.log(`  ⊘ ${fileName} not found, skipping`);
      continue;
    }

    try {
      // 파일 읽기
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);

      // 'me'를 페르소나 ID로 교체
      const updated = replaceMeWithPersona(data, personaId);

      // 파일 쓰기
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
      console.log(`  ✓ Updated ${fileName}`);
    } catch (error) {
      console.error(`  ✗ Error updating ${fileName}:`, error.message);
    }
  }
}

/**
 * 메인 실행
 */
function main() {
  console.log('🔄 Updating persona data with actual IDs...\n');
  console.log('Replacing "me" with persona IDs in persona-specific files...');

  for (const personaId of PERSONAS) {
    updatePersonaData(personaId);
  }

  console.log('\n✅ Persona data update complete!');
}

main();

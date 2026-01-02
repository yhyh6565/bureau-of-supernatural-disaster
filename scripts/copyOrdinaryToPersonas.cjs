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
 * Ordinary 데이터를 페르소나별로 복사하고 'me' 교체
 */
function copyOrdinaryToPersona(personaId) {
  const personaDir = path.join(PERSONAS_DIR, personaId);

  if (!fs.existsSync(personaDir)) {
    fs.mkdirSync(personaDir, { recursive: true });
  }

  console.log(`\n📝 Processing ${personaId}...`);

  // 복사할 파일 목록
  const files = ['messages.json', 'approvals.json', 'schedules.json'];

  for (const fileName of files) {
    const ordinaryFilePath = path.join(ORDINARY_DIR, fileName);
    const personaFilePath = path.join(personaDir, fileName);

    if (!fs.existsSync(ordinaryFilePath)) {
      console.log(`  ⊘ ${fileName} not found in ordinary, skipping`);
      continue;
    }

    try {
      // Ordinary 파일 읽기
      const content = fs.readFileSync(ordinaryFilePath, 'utf-8');
      const data = JSON.parse(content);

      // 'me'를 페르소나 ID로 교체
      const updated = replaceMeWithPersona(data, personaId);

      // 페르소나 폴더에 저장
      fs.writeFileSync(personaFilePath, JSON.stringify(updated, null, 2), 'utf-8');
      console.log(`  ✓ Copied and updated ${fileName}`);
    } catch (error) {
      console.error(`  ✗ Error processing ${fileName}:`, error.message);
    }
  }

  // incidents.json도 복사 (교체 없이)
  const incidentsSource = path.join(ORDINARY_DIR, 'incidents.json');
  const incidentsDest = path.join(personaDir, 'incidents.json');
  if (fs.existsSync(incidentsSource)) {
    fs.copyFileSync(incidentsSource, incidentsDest);
    console.log(`  ✓ Copied incidents.json`);
  }
}

/**
 * 메인 실행
 */
function main() {
  console.log('📋 Copying ordinary data to persona folders...\n');
  console.log('This will overwrite existing messages, approvals, and schedules files.');

  for (const personaId of PERSONAS) {
    copyOrdinaryToPersona(personaId);
  }

  console.log('\n✅ Copy complete!');
}

main();

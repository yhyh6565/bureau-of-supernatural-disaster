import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

interface BureauBuildConfig {
  inputDir: string;
  outputDir: string;
  personas: string[];
}

const config: BureauBuildConfig = {
  inputDir: 'initial_data',
  outputDir: 'src/data',
  personas: ['choiyowon', 'haegeum', 'janghyeowoon', 'koyoungeun', 'parkhonglim', 'ryujaegwan', 'solum']
};

function loadCSV(filename: string): any[] {
  const csvPath = path.join(config.inputDir, filename);
  if (!fs.existsSync(csvPath)) {
    console.warn(`⚠️  File not found: ${filename}`);
    return [];
  }
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });
  return parsed.data;
}

function loadConfig(): any {
  const configPath = path.join(config.inputDir, '_meta/config.json');
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

function buildGlobal() {
  console.log('\n📝 Building Global data...');

  const globalDir = path.join(config.outputDir, 'global');
  if (!fs.existsSync(globalDir)) {
    fs.mkdirSync(globalDir, { recursive: true });
  }

  const globalFiles = [
    { csv: 'Global_approvals.csv', json: 'approvals.json' },
    { csv: 'Global_messages.csv', json: 'messages.json' },
    { csv: 'Global_notifications.csv', json: 'notifications.json' },
    { csv: 'Global_schedules.csv', json: 'schedules.json' },
    { csv: 'Global_manuals.csv', json: 'manuals.json' },
    { csv: 'Global_equipment.csv', json: 'equipment.json' },
    { csv: 'Global_locations.csv', json: 'locations.json' },
  ];

  for (const file of globalFiles) {
    const data = loadCSV(file.csv);
    const outputPath = path.join(globalDir, file.json);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`  ✓ ${file.csv} → global/${file.json}`);
  }
}

function buildPersona(personaId: string) {
  console.log(`\n👤 Building Persona: ${personaId}...`);

  const personaDir = path.join(config.outputDir, 'personas', personaId);
  if (!fs.existsSync(personaDir)) {
    fs.mkdirSync(personaDir, { recursive: true });
  }

  // Approvals
  const allApprovals = loadCSV('Persona_approvals.csv');
  const personaApprovals = allApprovals.filter(a => a.ownerId === personaId);
  fs.writeFileSync(
    path.join(personaDir, 'approvals.json'),
    JSON.stringify(personaApprovals, null, 2)
  );
  console.log(`  ✓ ${personaApprovals.length} approvals`);

  // Messages
  const allMessages = loadCSV('Persona_messages.csv');
  const personaMessages = allMessages.filter(m => m.ownerId === personaId);
  fs.writeFileSync(
    path.join(personaDir, 'messages.json'),
    JSON.stringify(personaMessages, null, 2)
  );
  console.log(`  ✓ ${personaMessages.length} messages`);

  // Schedules
  const allSchedules = loadCSV('Persona_schedules.csv');
  const personaSchedules = allSchedules.filter(s => s.ownerId === personaId);
  fs.writeFileSync(
    path.join(personaDir, 'schedules.json'),
    JSON.stringify(personaSchedules, null, 2)
  );
  console.log(`  ✓ ${personaSchedules.length} schedules`);

  // Notifications
  const allNotifications = loadCSV('Persona_notifications.csv');
  const personaNotifications = allNotifications.filter(n => n.ownerId === personaId);
  fs.writeFileSync(
    path.join(personaDir, 'notifications.json'),
    JSON.stringify(personaNotifications, null, 2)
  );
  console.log(`  ✓ ${personaNotifications.length} notifications`);

  // Inspections
  const allInspections = loadCSV('Persona_inspections.csv');
  const personaInspections = allInspections.filter(i => i.ownerId === personaId);
  fs.writeFileSync(
    path.join(personaDir, 'inspections.json'),
    JSON.stringify(personaInspections, null, 2)
  );
  console.log(`  ✓ ${personaInspections.length} inspections`);

  // Profile
  const allProfiles = loadCSV('_meta/persona_profiles.csv');
  const profile = allProfiles.find(p => p.personaId === personaId);
  if (profile) {
    fs.writeFileSync(
      path.join(personaDir, 'profile.json'),
      JSON.stringify(profile, null, 2)
    );
    console.log(`  ✓ profile`);
  }
}

function buildSegwang() {
  console.log('\n🚨 Building Segwang data...');

  const segwangDir = path.join(config.outputDir, 'segwang');
  if (!fs.existsSync(segwangDir)) {
    fs.mkdirSync(segwangDir, { recursive: true });
  }

  // Agents
  const allAgents = loadCSV('agents.csv');
  const segwangAgents = allAgents.filter(a => a.type === 'segwang');
  fs.writeFileSync(
    path.join(segwangDir, 'agents.json'),
    JSON.stringify(segwangAgents, null, 2)
  );
  console.log(`  ✓ ${segwangAgents.length} agents`);

  // Approvals
  const data = loadCSV('Segwang_approvals.csv');
  fs.writeFileSync(
    path.join(segwangDir, 'approvals.json'),
    JSON.stringify(data, null, 2)
  );
  console.log(`  ✓ Segwang_approvals.csv → approvals.json`);

  // Schedules
  const schedules = loadCSV('Segwang_schedules.csv');
  fs.writeFileSync(
    path.join(segwangDir, 'schedules.json'),
    JSON.stringify(schedules, null, 2)
  );
  console.log(`  ✓ Segwang_schedules.csv → schedules.json`);

  // Notices
  const notices = loadCSV('Segwang_notices.csv');
  fs.writeFileSync(
    path.join(segwangDir, 'notices.json'),
    JSON.stringify(notices, null, 2)
  );
  console.log(`  ✓ Segwang_notices.csv → notices.json`);

  // Messages
  const messages = loadCSV('Segwang_messages.csv');
  fs.writeFileSync(
    path.join(segwangDir, 'messages.json'),
    JSON.stringify(messages, null, 2)
  );
  console.log(`  ✓ Segwang_messages.csv → messages.json`);
}

function buildOrdinary() {
  console.log('\n👥 Building Ordinary agents data...');

  const ordinaryDir = path.join(config.outputDir, 'ordinary');
  if (!fs.existsSync(ordinaryDir)) {
    fs.mkdirSync(ordinaryDir, { recursive: true });
  }

  const allAgents = loadCSV('agents.csv');
  const ordinaryAgents = allAgents.filter(a => a.type === 'ordinary');
  fs.writeFileSync(
    path.join(ordinaryDir, 'agents.json'),
    JSON.stringify(ordinaryAgents, null, 2)
  );
  console.log(`  ✓ ${ordinaryAgents.length} agents`);

  // Approvals
  const approvals = loadCSV('Ordinary_approvals.csv');
  fs.writeFileSync(
    path.join(ordinaryDir, 'approvals.json'),
    JSON.stringify(approvals, null, 2)
  );
  console.log(`  ✓ Ordinary_approvals.csv → approvals.json`);

  // Messages
  const messages = loadCSV('Ordinary_messages.csv');
  fs.writeFileSync(
    path.join(ordinaryDir, 'messages.json'),
    JSON.stringify(messages, null, 2)
  );
  console.log(`  ✓ Ordinary_messages.csv → messages.json`);

  // Schedules
  const schedules = loadCSV('Ordinary_schedules.csv');
  fs.writeFileSync(
    path.join(ordinaryDir, 'schedules.json'),
    JSON.stringify(schedules, null, 2)
  );
  console.log(`  ✓ Ordinary_schedules.csv → schedules.json`);

  // Inspections
  const inspections = loadCSV('Ordinary_inspections.csv');
  fs.writeFileSync(
    path.join(ordinaryDir, 'inspections.json'),
    JSON.stringify(inspections, null, 2)
  );
  console.log(`  ✓ Ordinary_inspections.csv → inspections.json`);
}

function buildShared() {
  console.log('\n📚 Building Shared data...');

  // Agents (all)
  const allAgents = loadCSV('agents.csv');
  fs.writeFileSync(
    path.join(config.outputDir, 'agents.json'),
    JSON.stringify(allAgents, null, 2)
  );
  console.log(`  ✓ agents.csv → agents.json (${allAgents.length} agents)`);

  // Incidents
  const incidents = loadCSV('incidents.csv');
  fs.writeFileSync(
    path.join(config.outputDir, 'incidents.json'),
    JSON.stringify(incidents, null, 2)
  );
  console.log(`  ✓ incidents.csv → incidents.json (${incidents.length} incidents)`);

  // Config
  const configData = loadConfig();
  fs.writeFileSync(
    path.join(config.outputDir, 'config.json'),
    JSON.stringify(configData, null, 2)
  );
  console.log(`  ✓ _meta/config.json → config.json`);
}

async function buildBureauData() {
  console.log('🚀 Building Bureau data from CSV to JSON...\n');

  // Create output directory
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  // Build Global
  buildGlobal();

  // Build Personas
  for (const persona of config.personas) {
    buildPersona(persona);
  }

  // Build Segwang
  buildSegwang();

  // Build Ordinary
  buildOrdinary();

  // Build Shared
  buildShared();

  console.log('\n✅ Bureau data build completed successfully!');
}

buildBureauData().catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});

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
  /* Existing code */
  const parsed = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true,
  });

  // Convert boolean strings to actual booleans
  const fixedData = parsed.data.map((item: any) => {
    const newItem = { ...item };
    Object.keys(newItem).forEach(key => {
      if (newItem[key] === 'true') newItem[key] = true;
      if (newItem[key] === 'false') newItem[key] = false;
    });
    return newItem;
  });

  return fixedData;
}

function loadConfig(): any {
  // Try root config.json in initial_data
  const rootConfigPath = path.join(config.inputDir, 'config.json');
  if (fs.existsSync(rootConfigPath)) {
    return JSON.parse(fs.readFileSync(rootConfigPath, 'utf-8'));
  }

  // Default fallback if no config is found
  return {
    "version": "1.0.0",
    "lastUpdated": new Date().toISOString()
  };
}

// ---------------------------------------------------------------------------
// Helpers for Data Enrichment
// ---------------------------------------------------------------------------
let AGENT_MAP: Record<string, any> = {};

function buildAgentMap(allAgents: any[]) {
  allAgents.forEach(agent => {
    AGENT_MAP[agent.id] = agent; // ID lookup (e.g., '1002')
    if (agent.employeeId) AGENT_MAP[agent.employeeId] = agent; // Employee ID lookup
    // If agent has a personaKey (e.g., 'solum') which is actually equal to id in agents.csv currently?
    // In agents.csv 'id' is 'solum', 'parkhonglim'. 'employeeId' is '1002'.
    // So mapping agent.id covers 'solum'.
  });
}

function getAgentName(id: string): string {
  if (!id) return '';
  if (id === 'me' || id === 'user') return '본인'; // Placeholder, resolved at runtime usually but safe here
  const agent = AGENT_MAP[id];
  return agent ? agent.name : id; // Fallback to ID if not found
}

function getAgentDepartment(id: string): string {
  if (!id) return '';
  const agent = AGENT_MAP[id];
  return agent ? agent.department : '';
}

function enrichApprovals(approvals: any[]): any[] {
  return approvals.map(doc => ({
    ...doc,
    createdByName: getAgentName(doc.createdBy),
    approverName: getAgentName(doc.approver)
  }));
}

function enrichMessages(messages: any[]): any[] {
  return messages.map(msg => ({
    ...msg,
    senderName: getAgentName(msg.senderId),
    senderDepartment: getAgentDepartment(msg.senderId)
  }));
}
// ---------------------------------------------------------------------------


function buildGlobal() {
  console.log('\n📝 Building Global data...');

  const globalDir = path.join(config.outputDir, 'global');
  if (!fs.existsSync(globalDir)) {
    fs.mkdirSync(globalDir, { recursive: true });
  }

  // Approvals
  const approvals = loadCSV('Global_approvals.csv');
  const enrichedApprovals = enrichApprovals(approvals);
  fs.writeFileSync(path.join(globalDir, 'approvals.json'), JSON.stringify(enrichedApprovals, null, 2));
  console.log(`  ✓ Global_approvals.csv → global/approvals.json`);

  // Messages
  const messages = loadCSV('Global_messages.csv');
  const enrichedMessages = enrichMessages(messages);
  fs.writeFileSync(path.join(globalDir, 'messages.json'), JSON.stringify(enrichedMessages, null, 2));
  console.log(`  ✓ Global_messages.csv → global/messages.json`);

  // Others
  const otherFiles = [
    { csv: 'Global_notifications.csv', json: 'notifications.json' },
    { csv: 'Global_schedules.csv', json: 'schedules.json' },
    { csv: 'Global_manuals.csv', json: 'manuals.json' },
    { csv: 'Global_equipment.csv', json: 'equipment.json' },
    { csv: 'Global_locations.csv', json: 'locations.json' },
  ];

  for (const file of otherFiles) {
    const data = loadCSV(file.csv);
    const outputPath = path.join(globalDir, file.json);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`  ✓ ${file.csv} → global/${file.json}`);
  }
}

function buildPersona(personaId: string, allAgents: any[]) {
  console.log(`\n👤 Building Persona: ${personaId}...`);

  const personaDir = path.join(config.outputDir, 'personas', personaId);
  if (!fs.existsSync(personaDir)) {
    fs.mkdirSync(personaDir, { recursive: true });
  }

  const agentData = allAgents.find(a => a.id === personaId);

  if (agentData) {
    const profile = {
      id: agentData.id, // Use agents.csv 'id' column (personaKey)
      name: agentData.name,
      personaKey: agentData.id,
      codename: agentData.codename || "",
      department: agentData.department === '출동구조반' ? 'hyunmu' :
        agentData.department === '현장정리반' ? 'jujak' :
          agentData.department === '신규조사반' ? 'baekho' :
            agentData.department === '자재과' ? 'materials' : agentData.department,
      team: agentData.team,
      organization: agentData.organization, // [NEW] Map organization field
      rank: agentData.rank,
      extension: agentData.extension,
      status: agentData.status,
      contamination: parseInt(agentData.contamination || '0', 10),
      isImmuneToContamination: agentData.isImmuneToContamination === 'true' || agentData.isImmuneToContamination === true,
      grade: parseInt(agentData.grade || '0', 10),
      funeralPreference: agentData.funeralPreference || "",
      profileImage: `/avatars/${personaId}.png`,
      rentals: []
    };

    fs.writeFileSync(path.join(personaDir, 'profile.json'), JSON.stringify(profile, null, 2));
    console.log(`  ✓ Generated profile.json from agents.csv`);
  } else {
    console.warn(`  ⚠️  Agent ${personaId} not found in agents.csv`);
  }

  // Approvals
  const allApprovals = loadCSV('Persona_approvals.csv');
  const personaApprovals = enrichApprovals(allApprovals.filter(a => a.ownerId === personaId));
  fs.writeFileSync(path.join(personaDir, 'approvals.json'), JSON.stringify(personaApprovals, null, 2));
  console.log(`  ✓ ${personaApprovals.length} approvals`);

  // Messages
  const allMessages = loadCSV('Persona_messages.csv');
  const personaMessages = enrichMessages(allMessages.filter(m => m.ownerId === personaId));
  fs.writeFileSync(path.join(personaDir, 'messages.json'), JSON.stringify(personaMessages, null, 2));
  console.log(`  ✓ ${personaMessages.length} messages`);

  // Schedules
  const allSchedules = loadCSV('Persona_schedules.csv');
  const personaSchedules = allSchedules.filter(s => s.ownerId === personaId);
  fs.writeFileSync(path.join(personaDir, 'schedules.json'), JSON.stringify(personaSchedules, null, 2));
  console.log(`  ✓ ${personaSchedules.length} schedules`);

  // Notifications
  const allNotifications = loadCSV('Persona_notifications.csv');
  const personaNotifications = allNotifications.filter(n => n.ownerId === personaId);
  fs.writeFileSync(path.join(personaDir, 'notifications.json'), JSON.stringify(personaNotifications, null, 2));
  console.log(`  ✓ ${personaNotifications.length} notifications`);

  // Inspections
  const allInspections = loadCSV('Persona_inspections.csv');
  const personaInspections = allInspections.filter(i => i.ownerId === personaId);
  fs.writeFileSync(path.join(personaDir, 'inspections.json'), JSON.stringify(personaInspections, null, 2));
  console.log(`  ✓ ${personaInspections.length} inspections`);
}

function buildSegwang() {
  console.log('\n🚨 Building Segwang data...');

  const segwangDir = path.join(config.outputDir, 'segwang');
  if (!fs.existsSync(segwangDir)) {
    fs.mkdirSync(segwangDir, { recursive: true });
  }

  const allAgents = loadCSV('agents.csv');
  const segwangAgents = allAgents.filter(a => a.type === 'segwang');
  fs.writeFileSync(path.join(segwangDir, 'agents.json'), JSON.stringify(segwangAgents, null, 2));
  console.log(`  ✓ ${segwangAgents.length} agents`);

  const approvals = loadCSV('Segwang_approvals.csv');
  const enrichedApprovals = enrichApprovals(approvals);
  fs.writeFileSync(path.join(segwangDir, 'approvals.json'), JSON.stringify(enrichedApprovals, null, 2));
  console.log(`  ✓ Segwang_approvals.csv → approvals.json`);

  const schedules = loadCSV('Segwang_schedules.csv');
  fs.writeFileSync(path.join(segwangDir, 'schedules.json'), JSON.stringify(schedules, null, 2));
  console.log(`  ✓ Segwang_schedules.csv → schedules.json`);

  const notices = loadCSV('Segwang_notices.csv');
  fs.writeFileSync(path.join(segwangDir, 'notices.json'), JSON.stringify(notices, null, 2));
  console.log(`  ✓ Segwang_notices.csv → notices.json`);

  const messages = loadCSV('Segwang_messages.csv');
  const enrichedMessages = enrichMessages(messages);
  fs.writeFileSync(path.join(segwangDir, 'messages.json'), JSON.stringify(enrichedMessages, null, 2));
  console.log(`  ✓ Segwang_messages.csv → messages.json`);

  // Incidents (NEW)
  const incidents = loadCSV('Segwang_incidents.csv');
  fs.writeFileSync(path.join(segwangDir, 'incidents.json'), JSON.stringify(incidents, null, 2));
  console.log(`  ✓ Segwang_incidents.csv → incidents.json`);
}

function buildOrdinary() {
  console.log('\n👥 Building Ordinary agents data...');

  const ordinaryDir = path.join(config.outputDir, 'ordinary');
  if (!fs.existsSync(ordinaryDir)) {
    fs.mkdirSync(ordinaryDir, { recursive: true });
  }

  const allAgents = loadCSV('agents.csv');
  const ordinaryAgents = allAgents.filter(a => a.type === 'ordinary');
  fs.writeFileSync(path.join(ordinaryDir, 'agents.json'), JSON.stringify(ordinaryAgents, null, 2));
  console.log(`  ✓ ${ordinaryAgents.length} agents`);

  const approvals = loadCSV('Ordinary_approvals.csv');
  const enrichedApprovals = enrichApprovals(approvals);
  fs.writeFileSync(path.join(ordinaryDir, 'approvals.json'), JSON.stringify(enrichedApprovals, null, 2));
  console.log(`  ✓ Ordinary_approvals.csv → approvals.json`);

  const messages = loadCSV('Ordinary_messages.csv');
  const enrichedMessages = enrichMessages(messages);
  fs.writeFileSync(path.join(ordinaryDir, 'messages.json'), JSON.stringify(enrichedMessages, null, 2));
  console.log(`  ✓ Ordinary_messages.csv → messages.json`);

  const schedules = loadCSV('Ordinary_schedules.csv');
  fs.writeFileSync(path.join(ordinaryDir, 'schedules.json'), JSON.stringify(schedules, null, 2));
  console.log(`  ✓ Ordinary_schedules.csv → schedules.json`);

  const inspections = loadCSV('Ordinary_inspections.csv');
  fs.writeFileSync(path.join(ordinaryDir, 'inspections.json'), JSON.stringify(inspections, null, 2));
  console.log(`  ✓ Ordinary_inspections.csv → inspections.json`);
}

function buildShared() {
  console.log('\n📚 Building Shared data...');
  const allAgents = loadCSV('agents.csv');
  fs.writeFileSync(path.join(config.outputDir, 'agents.json'), JSON.stringify(allAgents, null, 2));
  console.log(`  ✓ agents.csv → agents.json (${allAgents.length} agents)`);

  const incidents = loadCSV('incidents.csv');
  fs.writeFileSync(path.join(config.outputDir, 'incidents.json'), JSON.stringify(incidents, null, 2));
  console.log(`  ✓ incidents.csv → incidents.json (${incidents.length} incidents)`);

  const configData = loadConfig();
  fs.writeFileSync(path.join(config.outputDir, 'config.json'), JSON.stringify(configData, null, 2));
  console.log(`  ✓ config.json`);
}

async function buildBureauData() {
  console.log('🚀 Building Bureau data from CSV to JSON...\n');

  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  // Load agents first to build map
  const allAgents = loadCSV('agents.csv');
  buildAgentMap(allAgents);

  buildGlobal();
  for (const persona of config.personas) {
    buildPersona(persona, allAgents);
  }
  buildSegwang();
  buildOrdinary();
  buildShared();

  console.log('\n✅ Bureau data build completed successfully!');
}

buildBureauData().catch((error) => {
  console.error('❌ Build failed:', error);
  process.exit(1);
});

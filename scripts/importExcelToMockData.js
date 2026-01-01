const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Read the Excel file
const workbook = XLSX.readFile(path.join(__dirname, '../data/haetae_personalized_data_v2.xlsx'));

// Helper function to convert Excel date to JavaScript Date string
function excelDateToJSDate(excelDate) {
  if (!excelDate) return null;

  // If it's already a string, return it
  if (typeof excelDate === 'string') {
    return `new Date('${excelDate}')`;
  }

  // Excel dates are stored as days since 1900-01-01
  const date = XLSX.SSF.parse_date_code(excelDate);
  if (!date) return null;

  const jsDate = new Date(date.y, date.m - 1, date.d, date.H || 0, date.M || 0, date.S || 0);
  return `new Date('${jsDate.toISOString()}')`;
}

// Helper function to parse array fields
function parseArrayField(value) {
  if (!value) return '[]';
  if (Array.isArray(value)) return JSON.stringify(value);
  if (typeof value === 'string') {
    // Try to parse as JSON
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed);
    } catch {
      // If not JSON, split by comma
      const items = value.split(',').map(item => item.trim()).filter(item => item);
      return JSON.stringify(items);
    }
  }
  return '[]';
}

// Helper function to parse boolean
function parseBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value === '1';
  }
  return !!value;
}

// Helper function to escape strings for TypeScript
function escapeString(str) {
  if (!str) return '';
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

// Parse Agents sheet
function parseAgents() {
  const sheet = workbook.Sheets['Agents'];
  const data = XLSX.utils.sheet_to_json(sheet);

  const agents = data.map(row => {
    const purificationHistory = parseArrayField(row.purificationHistory);
    const equipmentInUse = parseArrayField(row.equipmentInUse);

    return `  {
    id: '${row.id}',
    name: '${row.name}',
    code: '${row.code}',
    codename: '${row.codename}',
    department: '${row.department}',
    team: '${row.team}',
    rank: '${row.rank}',
    grade: ${row.grade},
    extension: '${row.extension}',
    status: '${row.status}',
    contamination: ${row.contamination},
    totalIncidents: ${row.totalIncidents},
    specialCases: ${row.specialCases},
    equipmentInUse: ${equipmentInUse},
    purificationHistory: ${purificationHistory.replace(/"/g, '').replace(/\[/g, '[').replace(/\]/g, ']')},
    funeralPreference: '${escapeString(row.funeralPreference || '')}',
  }`;
  });

  return `export const MOCK_AGENTS: Agent[] = [\n${agents.join(',\n')}\n];`;
}

// Parse Incidents sheet
function parseIncidents() {
  const sheet = workbook.Sheets['Incidents'];
  const data = XLSX.utils.sheet_to_json(sheet);

  const incidents = data.map(row => {
    return `  {
    id: '${row.id}',
    caseNumber: '${row.caseNumber}',
    location: '${escapeString(row.location)}',
    dangerLevel: '${row.dangerLevel}',
    status: '${row.status}',
    reportContent: '${escapeString(row.reportContent)}',
    ${row.countermeasure ? `countermeasure: '${escapeString(row.countermeasure)}',` : ''}
    ${row.entryRestrictions ? `entryRestrictions: '${escapeString(row.entryRestrictions)}',` : ''}
    requiresPatrol: ${parseBoolean(row.requiresPatrol)},
    ${row.assignedAgent ? `assignedAgent: '${row.assignedAgent}',` : ''}
    createdAt: ${excelDateToJSDate(row.createdAt)},
    updatedAt: ${excelDateToJSDate(row.updatedAt)},
  }`;
  });

  return `export const MOCK_INCIDENTS: Incident[] = [\n${incidents.join(',\n')}\n];`;
}

// Parse Messages sheet
function parseMessages() {
  const sheet = workbook.Sheets['Messages'];
  const data = XLSX.utils.sheet_to_json(sheet);

  const messages = data.map(row => {
    return `  {
    id: '${row.id}',
    senderId: '${row.senderId}',
    senderName: '${row.senderName}',
    receiverId: '${row.receiverId}',
    receiverName: '${row.receiverName}',
    content: '${escapeString(row.content)}',
    isRead: ${parseBoolean(row.isRead)},
    createdAt: ${excelDateToJSDate(row.createdAt)},
  }`;
  });

  return `export const MOCK_MESSAGES: Message[] = [\n${messages.join(',\n')}\n];`;
}

// Parse Schedules sheet
function parseSchedules() {
  const sheet = workbook.Sheets['Schedules'];
  const data = XLSX.utils.sheet_to_json(sheet);

  const schedules = data.map(row => {
    return `  {
    id: '${row.id}',
    title: '${escapeString(row.title)}',
    type: '${row.type}',
    date: ${excelDateToJSDate(row.date)},
    ${row.agentId ? `agentId: '${row.agentId}',` : ''}
  }`;
  });

  return `export const MOCK_SCHEDULES: Schedule[] = [\n${schedules.join(',\n')}\n];`;
}

// Parse Approvals sheet
function parseApprovals() {
  const sheet = workbook.Sheets['Approvals'];
  const data = XLSX.utils.sheet_to_json(sheet);

  const approvals = data.map(row => {
    return `  {
    id: '${row.id}',
    title: '${escapeString(row.title)}',
    category: '${row.category}',
    status: '${row.status}',
    ${row.agentId ? `agentId: '${row.agentId}',` : ''}
    submittedBy: '${row.submittedBy}',
    deadline: ${excelDateToJSDate(row.deadline)},
    createdAt: ${excelDateToJSDate(row.createdAt)},
  }`;
  });

  return `export const MOCK_APPROVALS: Approval[] = [\n${approvals.join(',\n')}\n];`;
}

// Parse Notifications sheet
function parseNotifications() {
  const sheet = workbook.Sheets['Notifications'];
  const data = XLSX.utils.sheet_to_json(sheet);

  const notifications = data.map(row => {
    return `  {
    id: '${row.id}',
    title: '${escapeString(row.title)}',
    content: '${escapeString(row.content)}',
    isUrgent: ${parseBoolean(row.isUrgent)},
    ${row.targetAgent ? `targetAgent: '${row.targetAgent}',` : ''}
    createdAt: ${excelDateToJSDate(row.createdAt)},
    isRead: ${parseBoolean(row.isRead)},
  }`;
  });

  return `export const MOCK_NOTIFICATIONS: Notification[] = [\n${notifications.join(',\n')}\n];`;
}

// Parse Equipment sheet
function parseEquipment() {
  const sheet = workbook.Sheets['Equipment'];
  const data = XLSX.utils.sheet_to_json(sheet);

  const equipment = data.map(row => {
    return `  {
    id: '${row.id}',
    name: '${escapeString(row.name)}',
    category: '${row.category}',
    dangerLevel: '${row.dangerLevel}',
    status: '${row.status}',
    description: '${escapeString(row.description)}',
    ${row.currentUser ? `currentUser: '${row.currentUser}',` : ''}
  }`;
  });

  return `export const MOCK_EQUIPMENT: Equipment[] = [\n${equipment.join(',\n')}\n];`;
}

// Parse Locations sheet
function parseLocations() {
  const sheet = workbook.Sheets['Locations'];
  const data = XLSX.utils.sheet_to_json(sheet);

  const locations = data.map(row => {
    return `  {
    id: '${row.id}',
    name: '${escapeString(row.name)}',
    category: '${row.category}',
    address: '${escapeString(row.address)}',
    status: '${row.status}',
    dangerLevel: '${row.dangerLevel}',
    description: '${escapeString(row.description)}',
  }`;
  });

  return `export const MOCK_LOCATIONS: Location[] = [\n${locations.join(',\n')}\n];`;
}

// Generate the TypeScript file
function generateMockData() {
  const imports = `import {
  Agent,
  Incident,
  Message,
  Schedule,
  Approval,
  Notification,
  Equipment,
  Location
} from '@/types/haetae';

`;

  const agents = parseAgents();
  const incidents = parseIncidents();
  const messages = parseMessages();
  const schedules = parseSchedules();
  const approvals = parseApprovals();
  const notifications = parseNotifications();
  const equipment = parseEquipment();
  const locations = parseLocations();

  const stats = `
// 통계 데이터
export const MOCK_STATS = {
  baekho: {
    received: 12,
    investigating: 3,
    completed: 9,
  },
  hyunmu: {
    requests: 28,
    rescuing: 2,
    completed: 26,
  },
  jujak: {
    requests: 15,
    cleaning: 1,
    completed: 14,
  },
};
`;

  const content = imports +
    '\n// 요원 데이터\n' + agents +
    '\n\n// 재난 데이터\n' + incidents +
    '\n\n// 쪽지 데이터\n' + messages +
    '\n\n// 일정 데이터\n' + schedules +
    '\n\n// 결재 데이터\n' + approvals +
    '\n\n// 공지사항 데이터\n' + notifications +
    '\n\n// 장비 데이터\n' + equipment +
    '\n\n// 장소 데이터\n' + locations +
    stats;

  // Write to file
  const outputPath = path.join(__dirname, '../src/data/mockData.ts');
  fs.writeFileSync(outputPath, content);
  console.log('✅ Mock data generated successfully at:', outputPath);
}

// Run the generator
try {
  generateMockData();
} catch (error) {
  console.error('❌ Error generating mock data:', error);
  process.exit(1);
}

import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

interface BureauValidationError {
  file: string;
  row: number;
  column: string;
  message: string;
}

interface BureauValidationRule {
  name: string;
  validate: (data: any[], allData: Record<string, any[]>) => BureauValidationError[];
}

const config = {
  inputDir: 'initial_data',
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

// Date validation helper
function isValidISODate(dateStr: string): boolean {
  if (!dateStr) return false;
  const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/;
  return isoRegex.test(dateStr);
}

// Validation rules for agents.csv
const agentsRules: BureauValidationRule[] = [
  {
    name: 'Unique agent IDs',
    validate: (agents) => {
      const ids = agents.map(a => a.id);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      return [...new Set(duplicates)].map(id => ({
        file: 'agents.csv',
        row: agents.findIndex(a => a.id === id) + 2,
        column: 'id',
        message: `Duplicate agent ID: ${id}`,
      }));
    },
  },
  {
    name: 'Valid agent types',
    validate: (agents) => {
      const AGENT_TYPES = ['persona', 'ordinary', 'system', 'segwang'];
      return agents
        .map((a, i) => ({ agent: a, row: i + 2 }))
        .filter(({ agent }) => !AGENT_TYPES.includes(agent.type))
        .map(({ agent, row }) => ({
          file: 'agents.csv',
          row,
          column: 'type',
          message: `Invalid agent type: ${agent.type}`,
        }));
    },
  },
  {
    name: 'Valid agent status',
    validate: (agents) => {
      const validStatuses = ['active', 'inactive', 'missing', 'retired', 'deceased', 'resigned', 'leave'];
      return agents
        .map((a, i) => ({ agent: a, row: i + 2 }))
        .filter(({ agent }) => agent.status && !validStatuses.includes(agent.status))
        .map(({ agent, row }) => ({
          file: 'agents.csv',
          row,
          column: 'status',
          message: `Invalid status: ${agent.status}`,
        }));
    },
  },
];

// Validation rules for incidents.csv
const incidentsRules: BureauValidationRule[] = [
  {
    name: 'Unique incident IDs',
    validate: (incidents) => {
      const ids = incidents.map(i => i.id);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      return [...new Set(duplicates)].map(id => ({
        file: 'incidents.csv',
        row: incidents.findIndex(i => i.id === id) + 2,
        column: 'id',
        message: `Duplicate incident ID: ${id}`,
      }));
    },
  },
  {
    name: 'Valid ISO 8601 dates',
    validate: (incidents) => {
      const errors: BureauValidationError[] = [];
      incidents.forEach((inc, i) => {
        if (inc.occurredAt && !isValidISODate(inc.occurredAt)) {
          errors.push({
            file: 'incidents.csv',
            row: i + 2,
            column: 'occurredAt',
            message: `Invalid date format: ${inc.occurredAt}`,
          });
        }
        if (inc.reportedAt && !isValidISODate(inc.reportedAt)) {
          errors.push({
            file: 'incidents.csv',
            row: i + 2,
            column: 'reportedAt',
            message: `Invalid date format: ${inc.reportedAt}`,
          });
        }
      });
      return errors;
    },
  },
];

// Validation rules for Persona_approvals.csv
const personaApprovalsRules: BureauValidationRule[] = [
  {
    name: 'Valid ownerId FK',
    validate: (approvals, allData) => {
      const agents = allData['agents.csv'];
      const agentIds = agents.map(a => a.id);
      return approvals
        .map((a, i) => ({ approval: a, row: i + 2 }))
        .filter(({ approval }) => approval.ownerId && !agentIds.includes(approval.ownerId))
        .map(({ approval, row }) => ({
          file: 'Persona_approvals.csv',
          row,
          column: 'ownerId',
          message: `Agent not found: ${approval.ownerId}`,
        }));
    },
  },
  {
    name: 'Valid createdBy FK',
    validate: (approvals, allData) => {
      const agents = allData['agents.csv'];
      const agentIds = agents.map(a => a.id);
      return approvals
        .map((a, i) => ({ approval: a, row: i + 2 }))
        .filter(({ approval }) => approval.createdBy && !agentIds.includes(approval.createdBy))
        .map(({ approval, row }) => ({
          file: 'Persona_approvals.csv',
          row,
          column: 'createdBy',
          message: `Agent not found: ${approval.createdBy}`,
        }));
    },
  },
  {
    name: 'Valid status values',
    validate: (approvals) => {
      const validStatuses = ['작성중', '결재대기', '승인', '반려', '보류'];
      return approvals
        .map((a, i) => ({ approval: a, row: i + 2 }))
        .filter(({ approval }) => approval.status && !validStatuses.includes(approval.status))
        .map(({ approval, row }) => ({
          file: 'Persona_approvals.csv',
          row,
          column: 'status',
          message: `Invalid status: ${approval.status}`,
        }));
    },
  },
  {
    name: 'Valid ISO 8601 dates',
    validate: (approvals) => {
      const errors: BureauValidationError[] = [];
      approvals.forEach((appr, i) => {
        if (appr.createdAt && !isValidISODate(appr.createdAt)) {
          errors.push({
            file: 'Persona_approvals.csv',
            row: i + 2,
            column: 'createdAt',
            message: `Invalid date format: ${appr.createdAt}`,
          });
        }
        if (appr.processedAt && !isValidISODate(appr.processedAt)) {
          errors.push({
            file: 'Persona_approvals.csv',
            row: i + 2,
            column: 'processedAt',
            message: `Invalid date format: ${appr.processedAt}`,
          });
        }
      });
      return errors;
    },
  },
];

// Validation rules for Persona_messages.csv
const personaMessagesRules: BureauValidationRule[] = [
  {
    name: 'Valid ownerId FK',
    validate: (messages, allData) => {
      const agents = allData['agents.csv'];
      const agentIds = agents.map(a => a.id);
      return messages
        .map((m, i) => ({ message: m, row: i + 2 }))
        .filter(({ message }) => message.ownerId && !agentIds.includes(message.ownerId))
        .map(({ message, row }) => ({
          file: 'Persona_messages.csv',
          row,
          column: 'ownerId',
          message: `Agent not found: ${message.ownerId}`,
        }));
    },
  },
  {
    name: 'Valid senderId FK',
    validate: (messages, allData) => {
      const agents = allData['agents.csv'];
      const agentIds = agents.map(a => a.id);
      return messages
        .map((m, i) => ({ message: m, row: i + 2 }))
        .filter(({ message }) => message.senderId && !agentIds.includes(message.senderId))
        .map(({ message, row }) => ({
          file: 'Persona_messages.csv',
          row,
          column: 'senderId',
          message: `Agent not found: ${message.senderId}`,
        }));
    },
  },
  {
    name: 'Valid ISO 8601 dates',
    validate: (messages) => {
      const errors: BureauValidationError[] = [];
      messages.forEach((msg, i) => {
        if (msg.createdAt && !isValidISODate(msg.createdAt)) {
          errors.push({
            file: 'Persona_messages.csv',
            row: i + 2,
            column: 'createdAt',
            message: `Invalid date format: ${msg.createdAt}`,
          });
        }
        if (msg.readAt && !isValidISODate(msg.readAt)) {
          errors.push({
            file: 'Persona_messages.csv',
            row: i + 2,
            column: 'readAt',
            message: `Invalid date format: ${msg.readAt}`,
          });
        }
      });
      return errors;
    },
  },
];

// Validation rules for Persona_schedules.csv
const personaSchedulesRules: BureauValidationRule[] = [
  {
    name: 'Valid ownerId FK',
    validate: (schedules, allData) => {
      const agents = allData['agents.csv'];
      const agentIds = agents.map(a => a.id);
      return schedules
        .map((s, i) => ({ schedule: s, row: i + 2 }))
        .filter(({ schedule }) => schedule.ownerId && !agentIds.includes(schedule.ownerId))
        .map(({ schedule, row }) => ({
          file: 'Persona_schedules.csv',
          row,
          column: 'ownerId',
          message: `Agent not found: ${schedule.ownerId}`,
        }));
    },
  },
  {
    name: 'Valid ISO 8601 dates',
    validate: (schedules) => {
      return schedules
        .map((s, i) => ({ schedule: s, row: i + 2 }))
        .filter(({ schedule }) => schedule.date && !isValidISODate(schedule.date))
        .map(({ schedule, row }) => ({
          file: 'Persona_schedules.csv',
          row,
          column: 'date',
          message: `Invalid date format: ${schedule.date}`,
        }));
    },
  },
];

// Validation rules for Persona_notifications.csv
const personaNotificationsRules: BureauValidationRule[] = [
  {
    name: 'Valid ownerId FK',
    validate: (notifications, allData) => {
      const agents = allData['agents.csv'];
      const agentIds = agents.map(a => a.id);
      return notifications
        .map((n, i) => ({ notification: n, row: i + 2 }))
        .filter(({ notification }) => notification.ownerId && !agentIds.includes(notification.ownerId))
        .map(({ notification, row }) => ({
          file: 'Persona_notifications.csv',
          row,
          column: 'ownerId',
          message: `Agent not found: ${notification.ownerId}`,
        }));
    },
  },
  {
    name: 'Valid boolean fields',
    validate: (notifications) => {
      const errors: BureauValidationError[] = [];
      notifications.forEach((notif, i) => {
        if (notif.isRead && notif.isRead !== 'true' && notif.isRead !== 'false') {
          errors.push({
            file: 'Persona_notifications.csv',
            row: i + 2,
            column: 'isRead',
            message: `Invalid boolean: ${notif.isRead}`,
          });
        }
        if (notif.isUrgent && notif.isUrgent !== 'true' && notif.isUrgent !== 'false') {
          errors.push({
            file: 'Persona_notifications.csv',
            row: i + 2,
            column: 'isUrgent',
            message: `Invalid boolean: ${notif.isUrgent}`,
          });
        }
      });
      return errors;
    },
  },
  {
    name: 'Valid ISO 8601 dates',
    validate: (notifications) => {
      return notifications
        .map((n, i) => ({ notification: n, row: i + 2 }))
        .filter(({ notification }) => notification.createdAt && !isValidISODate(notification.createdAt))
        .map(({ notification, row }) => ({
          file: 'Persona_notifications.csv',
          row,
          column: 'createdAt',
          message: `Invalid date format: ${notification.createdAt}`,
        }));
    },
  },
];

// Validation rules for Persona_inspections.csv
const personaInspectionsRules: BureauValidationRule[] = [
  {
    name: 'Valid ownerId FK',
    validate: (inspections, allData) => {
      const agents = allData['agents.csv'];
      const agentIds = agents.map(a => a.id);
      return inspections
        .map((i, idx) => ({ inspection: i, row: idx + 2 }))
        .filter(({ inspection }) => inspection.ownerId && !agentIds.includes(inspection.ownerId))
        .map(({ inspection, row }) => ({
          file: 'Persona_inspections.csv',
          row,
          column: 'ownerId',
          message: `Agent not found: ${inspection.ownerId}`,
        }));
    },
  },
  {
    name: 'Valid ISO 8601 dates',
    validate: (inspections) => {
      const errors: BureauValidationError[] = [];
      inspections.forEach((insp, i) => {
        if (insp.scheduledDate && !isValidISODate(insp.scheduledDate)) {
          errors.push({
            file: 'Persona_inspections.csv',
            row: i + 2,
            column: 'scheduledDate',
            message: `Invalid date format: ${insp.scheduledDate}`,
          });
        }
        if (insp.createdAt && !isValidISODate(insp.createdAt)) {
          errors.push({
            file: 'Persona_inspections.csv',
            row: i + 2,
            column: 'createdAt',
            message: `Invalid date format: ${insp.createdAt}`,
          });
        }
      });
      return errors;
    },
  },
];

async function validateBureauData() {
  console.log('🔍 Validating Bureau data...\n');

  // Load all CSV files
  const allData: Record<string, any[]> = {
    'agents.csv': loadCSV('agents.csv'),
    'incidents.csv': loadCSV('incidents.csv'),
    'Persona_approvals.csv': loadCSV('Persona_approvals.csv'),
    'Persona_messages.csv': loadCSV('Persona_messages.csv'),
    'Persona_schedules.csv': loadCSV('Persona_schedules.csv'),
    'Persona_notifications.csv': loadCSV('Persona_notifications.csv'),
    'Persona_inspections.csv': loadCSV('Persona_inspections.csv'),
  };

  const validationSets = [
    { file: 'agents.csv', rules: agentsRules },
    { file: 'incidents.csv', rules: incidentsRules },
    { file: 'Persona_approvals.csv', rules: personaApprovalsRules },
    { file: 'Persona_messages.csv', rules: personaMessagesRules },
    { file: 'Persona_schedules.csv', rules: personaSchedulesRules },
    { file: 'Persona_notifications.csv', rules: personaNotificationsRules },
    { file: 'Persona_inspections.csv', rules: personaInspectionsRules },
  ];

  let totalErrors = 0;

  for (const { file, rules } of validationSets) {
    console.log(`📄 Validating ${file}...`);
    const data = allData[file];

    if (!data || data.length === 0) {
      console.log(`  ⚠️  No data found\n`);
      continue;
    }

    let fileErrors: BureauValidationError[] = [];

    for (const rule of rules) {
      const errors = rule.validate(data, allData);
      fileErrors = fileErrors.concat(errors);
    }

    if (fileErrors.length === 0) {
      console.log(`  ✓ All validations passed (${data.length} rows)\n`);
    } else {
      console.log(`  ❌ Found ${fileErrors.length} error(s):`);
      fileErrors.forEach(err => {
        console.log(`     Row ${err.row}, Column "${err.column}": ${err.message}`);
      });
      console.log('');
      totalErrors += fileErrors.length;
    }
  }

  if (totalErrors > 0) {
    console.log(`\n❌ Validation failed with ${totalErrors} error(s)`);
    process.exit(1);
  } else {
    console.log('✅ All Bureau data validations passed successfully!');
  }
}

validateBureauData().catch((error) => {
  console.error('❌ Validation failed:', error);
  process.exit(1);
});

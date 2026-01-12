import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { format } from 'date-fns';

const AGENTS_CSV_PATH = path.join(process.cwd(), 'initial_data', 'agents.csv');

interface AgentRow {
    [key: string]: string;
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDate(start: Date, end: Date) {
    const timeDiff = end.getTime() - start.getTime();
    const randomTime = Math.random() * timeDiff;
    return new Date(start.getTime() + randomTime);
}

function generatePurificationHistory(agentId: string): string {
    // Targeted rule: solum, janghyeowoon, koyoungeun -> 2 dates between 2024-03 and 2024-08
    if (['solum', 'janghyeowoon', 'koyoungeun'].includes(agentId)) {
        const dates: Date[] = [];
        for (let i = 0; i < 2; i++) {
            dates.push(getRandomDate(new Date('2024-03-01'), new Date('2024-08-31')));
        }
        return dates
            .sort((a, b) => a.getTime() - b.getTime()) // Sort chronological
            .map(d => format(d, 'yyyy-MM-dd'))
            .join('|');
    }

    // Default rule: Random 0-3 dates within last 2 years
    const count = getRandomInt(0, 3);
    const dates: Date[] = [];
    const end = new Date();
    const start = new Date();
    start.setFullYear(end.getFullYear() - 2);

    for (let i = 0; i < count; i++) {
        dates.push(getRandomDate(start, end));
    }
    return dates
        .sort((a, b) => a.getTime() - b.getTime())
        .map(d => format(d, 'yyyy-MM-dd'))
        .join('|');
}

function enrichAgents() {
    console.log('✨ Enriching agents.csv...');

    if (!fs.existsSync(AGENTS_CSV_PATH)) {
        console.error('❌ agents.csv not found');
        process.exit(1);
    }

    const csvContent = fs.readFileSync(AGENTS_CSV_PATH, 'utf-8');
    const result = Papa.parse<AgentRow>(csvContent, {
        header: true,
        skipEmptyLines: true,
    });

    const enrichedData = result.data.map((row) => {
        // Grade Logic
        let grade = row.grade;
        if (!grade) {
            if (row.rank === '팀장') grade = '6';
            else if (row.rank === '선임주무관') grade = '7';
            else if (row.rank === '주무관') grade = '8';
            else grade = '9'; // Default for 요원/others
        }

        // Stats Logic
        const totalIncidents = row.totalIncidents || String(getRandomInt(50, 200));
        const specialCases = row.specialCases || String(getRandomInt(0, 20));

        // History Logic
        const purificationHistory = row.purificationHistory || generatePurificationHistory(row.id);

        return {
            ...row,
            bio: row.bio || '', // Keep empty as requested
            specialAbility: row.specialAbility || '', // Keep empty
            grade,
            funeralPreference: row.funeralPreference || '화장',
            totalIncidents,
            specialCases,
            purificationHistory,
        };
    });

    const csvOutput = Papa.unparse(enrichedData);
    fs.writeFileSync(AGENTS_CSV_PATH, csvOutput, 'utf-8');

    console.log('✅ agents.csv enriched successfully!');
}

enrichAgents();

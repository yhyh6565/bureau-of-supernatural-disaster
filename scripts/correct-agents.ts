import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const AGENTS_CSV_PATH = path.join(process.cwd(), 'initial_data', 'agents.csv');

interface AgentRow {
    [key: string]: string;
}

function correctAgents() {
    console.log('✨ Correcting agents.csv...');

    if (!fs.existsSync(AGENTS_CSV_PATH)) {
        console.error('❌ agents.csv not found');
        process.exit(1);
    }

    const csvContent = fs.readFileSync(AGENTS_CSV_PATH, 'utf-8');
    const result = Papa.parse<AgentRow>(csvContent, {
        header: true,
        skipEmptyLines: true,
    });

    const correctedData = result.data.map((row) => {
        // 1. Park Honglim Correction
        if (row.id === 'parkhonglim') {
            return {
                ...row,
                department: '출동구조반',
                team: '1팀',
                rank: '팀장',
                grade: '6' // Team leader is grade 6
            };
        }

        // 2. Segwang Agents Correction
        if (row.type === 'segwang') {
            let department = row.department;
            if (department === '현무반') department = '출동구조반';
            else if (department === '백호반') department = '신규조사반';
            else if (department === '주작반') department = '현장정리반';

            let rank = row.rank;
            // Grade-based Rank mapping: 9=실무관, 8=주무관, 7=선임주무관, 6=팀장
            if (row.grade === '9') rank = '실무관';
            else if (row.grade === '8') rank = '주무관';
            else if (row.grade === '7') rank = '선임주무관';
            else if (row.grade === '6') rank = '팀장';

            return {
                ...row,
                department,
                rank
            };
        }

        return row;
    });

    const csvOutput = Papa.unparse(correctedData);
    fs.writeFileSync(AGENTS_CSV_PATH, csvOutput, 'utf-8');

    console.log('✅ agents.csv corrected successfully!');
}

correctAgents();

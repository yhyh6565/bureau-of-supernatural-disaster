import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const AGENTS_CSV_PATH = path.join(process.cwd(), 'initial_data', 'agents.csv');

interface AgentRow {
    id: string;
    codename?: string;
    [key: string]: string | undefined;
}

const CODENAME_MAP: Record<string, string> = {
    'solum': '포도',
    'ryujaegwan': '청동',
    'parkhonglim': '홍화',
    'haegeum': '해금',
    'janghyeowoon': '화각',
    'koyoungeun': '박하'
};

function updateCodenames() {
    console.log('✨ Updating codenames in agents.csv...');

    if (!fs.existsSync(AGENTS_CSV_PATH)) {
        console.error('❌ agents.csv not found');
        process.exit(1);
    }

    const csvContent = fs.readFileSync(AGENTS_CSV_PATH, 'utf-8');
    const result = Papa.parse<AgentRow>(csvContent, {
        header: true,
        skipEmptyLines: true,
    });

    let updatedCount = 0;
    const updatedData = result.data.map((row) => {
        if (row.id && CODENAME_MAP[row.id]) {
            console.log(`✅ Updating ${row.id} -> ${CODENAME_MAP[row.id]}`);
            updatedCount++;
            return {
                ...row,
                codename: CODENAME_MAP[row.id]
            };
        }
        return row;
    });

    const csvOutput = Papa.unparse(updatedData);
    fs.writeFileSync(AGENTS_CSV_PATH, csvOutput, 'utf-8');

    console.log(`🎉 Updated ${updatedCount} agents successfully!`);
}

updateCodenames();

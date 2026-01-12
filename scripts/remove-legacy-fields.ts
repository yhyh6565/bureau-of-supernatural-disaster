import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const AGENTS_CSV_PATH = path.join(process.cwd(), 'initial_data', 'agents.csv');

interface AgentRow {
    bio?: string;
    specialAbility?: string;
    [key: string]: string | undefined;
}

function removeFields() {
    console.log('✨ Removing legacy fields from agents.csv...');

    if (!fs.existsSync(AGENTS_CSV_PATH)) {
        console.error('❌ agents.csv not found');
        process.exit(1);
    }

    const csvContent = fs.readFileSync(AGENTS_CSV_PATH, 'utf-8');
    const result = Papa.parse<AgentRow>(csvContent, {
        header: true,
        skipEmptyLines: true,
    });

    const cleanedData = result.data.map((row) => {
        const newRow = { ...row };
        delete newRow.bio;
        delete newRow.specialAbility;
        return newRow;
    });

    const csvOutput = Papa.unparse(cleanedData);
    fs.writeFileSync(AGENTS_CSV_PATH, csvOutput, 'utf-8');

    console.log('✅ agents.csv cleaned successfully!');
}

removeFields();

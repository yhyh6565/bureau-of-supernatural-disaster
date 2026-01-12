import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'src/data');
const OUT_DIR = path.join(ROOT_DIR, 'initial_data');

async function jsonToCsv(data, csvPath, extraColumn = null) {
    if (!data || !data.length) return;

    let headers = Object.keys(data[0]);
    if (extraColumn) {
        headers = [extraColumn.key, ...headers];
    }

    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            let val;
            if (extraColumn && header === extraColumn.key) {
                val = extraColumn.value;
            } else {
                val = row[header] === undefined ? '' : row[header];
            }

            if (typeof val === 'object' && val !== null) {
                val = JSON.stringify(val); // Handle nested arrays/objects simple
            }

            if (typeof val === 'string') {
                val = val.replace(/"/g, '""'); // Escape double quotes
                if (val.includes(',') || val.includes('\n') || val.includes('"')) {
                    val = `"${val}"`;
                }
            }
            return val;
        });
        csvRows.push(values.join(','));
    }

    // Append to file if exists (for merging), otherwise write new
    try {
        await fs.mkdir(path.dirname(csvPath), { recursive: true });
        // Reading existing to check if we need to append or write header
        // For simplicity in this merge script, we'll accumulate data in memory instead of appending to file multiple times to avoid header issues
    } catch (e) { }

    return csvRows; // Return rows instead of writing immediately to handle merging
}

async function exportBureauData() {
    console.log('📦 Starting Bureau Data Export...');
    await fs.mkdir(OUT_DIR, { recursive: true });

    // 1. Global Data (Simple 1:1)
    const globalFiles = [
        'manuals.json', 'equipment.json', 'incidents.json', 'locations.json',
        'notifications.json', 'schedules.json', 'inspections.json', 'approvals.json', 'messages.json'
    ];

    for (const file of globalFiles) {
        try {
            const raw = await fs.readFile(path.join(DATA_DIR, 'global', file), 'utf-8');
            const data = JSON.parse(raw);
            const rows = await jsonToCsv(data, '');
            if (rows) {
                await fs.writeFile(path.join(OUT_DIR, `Global_${file.replace('.json', '.csv')}`), rows.join('\n'));
                console.log(`✅ Exported Global_${file.replace('.json', '.csv')}`);
            }
        } catch (e) {
            console.warn(`⚠️  Skipped Global ${file} (Empty or not found)`);
        }
    }

    // 2. Persona Data (Merged N:1)
    // We want to merge messages.json from ALL personas into one Bureau_Persona_Messages.csv
    const personasDir = path.join(DATA_DIR, 'personas');
    const personas = await fs.readdir(personasDir);

    // Define what files we want to merge
    const mergeTargets = ['messages', 'approvals', 'schedules', 'inspections', 'notifications'];

    for (const target of mergeTargets) {
        let allRows = [];
        let headers = null;

        for (const persona of personas) {
            const filePath = path.join(personasDir, persona, `${target}.json`);
            try {
                const raw = await fs.readFile(filePath, 'utf-8');
                const data = JSON.parse(raw);

                // Convert to CSV lines, adding 'owner_persona' column
                const rows = await jsonToCsv(data, '', { key: 'owner_persona', value: persona });

                if (rows && rows.length > 1) {
                    if (!headers) {
                        headers = rows[0]; // Keep header from first successful file
                        allRows.push(headers);
                    }
                    // Push data rows only (skip header)
                    allRows.push(...rows.slice(1));
                }
            } catch (e) {
                // strict check not needed, some personas might miss some files
            }
        }

        if (allRows.length > 0) {
            await fs.writeFile(path.join(OUT_DIR, `Persona_${target}_All.csv`), allRows.join('\n'));
            console.log(`✅ Exported Persona_${target}_All.csv (Merged ${personas.length} personas)`);
        }
    }

    // 3. Segwang Data
    const segwangDir = path.join(DATA_DIR, 'segwang');
    try {
        const segwangFiles = await fs.readdir(segwangDir);
        for (const file of segwangFiles) {
            if (!file.endsWith('.json')) continue;
            const raw = await fs.readFile(path.join(segwangDir, file), 'utf-8');
            const data = JSON.parse(raw);
            const rows = await jsonToCsv(data, '');
            if (rows) {
                await fs.writeFile(path.join(OUT_DIR, `Segwang_${file.replace('.json', '.csv')}`), rows.join('\n'));
                console.log(`✅ Exported Segwang_${file.replace('.json', '.csv')}`);
            }
        }
    } catch (e) {
        console.warn(`⚠️  Skipped Segwang (Directory not found)`);
    }

    // 4. Ordinary Data
    const ordinaryDir = path.join(DATA_DIR, 'ordinary');
    try {
        const ordinaryFiles = await fs.readdir(ordinaryDir);
        for (const file of ordinaryFiles) {
            if (!file.endsWith('.json')) continue;
            const raw = await fs.readFile(path.join(ordinaryDir, file), 'utf-8');
            const data = JSON.parse(raw);
            const rows = await jsonToCsv(data, '');
            if (rows) {
                await fs.writeFile(path.join(OUT_DIR, `Ordinary_${file.replace('.json', '.csv')}`), rows.join('\n'));
                console.log(`✅ Exported Ordinary_${file.replace('.json', '.csv')}`);
            }
        }
    } catch (e) {
        console.warn(`⚠️  Skipped Ordinary (Directory not found)`);
    }

    console.log('✨ Export Completed! Check "initial_data" folder.');
}

exportBureauData();

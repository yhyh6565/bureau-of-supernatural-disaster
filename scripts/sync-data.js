import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const CONFIG_PATH = path.join(ROOT_DIR, 'sync-config.json');
const DATA_DIR = path.join(ROOT_DIR, 'src/data');

// Simple CSV Parser (Same as Dream Corp)
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i];
        if (!currentLine.trim()) continue;

        const values = [];
        let inQuotes = false;
        let currentValue = '';

        for (let char of currentLine) {
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue);
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue);

        const obj = {};
        headers.forEach((header, index) => {
            let value = values[index] ? values[index].trim() : '';
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1).replace(/""/g, '"');
            }
            if (value === 'TRUE') value = true;
            else if (value === 'FALSE') value = false;
            // Prevent ID strings like '001' becoming numbers
            else if (!isNaN(Number(value)) && value !== '' && !header.toLowerCase().includes('id') && !header.includes('date')) {
                value = Number(value);
            }
            if (header.includes('List') || header.includes('Tags')) {
                value = value.split(',').map(s => s.trim());
            }

            obj[header] = value;
        });
        result.push(obj);
    }
    return result;
}

async function syncData() {
    try {
        console.log('🔄 Starting Bureau Data Sync...');

        try {
            await fs.access(CONFIG_PATH);
        } catch {
            console.error('❌ Error: sync-config.json not found!');
            return;
        }

        const configContent = await fs.readFile(CONFIG_PATH, 'utf-8');
        const config = JSON.parse(configContent);

        for (const [key, settings] of Object.entries(config)) {
            // Handle simple URL string config (backward compatibility)
            const url = typeof settings === 'string' ? settings : settings.url;
            const partitionBy = typeof settings === 'object' ? settings.partitionBy : null;
            const targetDirRaw = typeof settings === 'object' ? settings.targetDir : null;

            if (!url) {
                console.warn(`⚠️ Skipped ${key}: No URL provided.`);
                continue;
            }

            console.log(`📥 Fetching ${key}...`);
            const response = await fetch(url);
            if (!response.ok) {
                console.error(`❌ Failed to fetch ${key}: ${response.statusText}`);
                continue;
            }

            const csvText = await response.text();
            const jsonData = parseCSV(csvText);

            // PARTITION LOGIC (splitting data into multiple files)
            if (partitionBy) {
                console.log(`🔀 Partitioning ${key} by '${partitionBy}'...`);

                // Group data by the partition key
                const groups = {};
                jsonData.forEach(item => {
                    const partitionValue = item[partitionBy];
                    if (!partitionValue) return; // Skip if key is missing

                    if (!groups[partitionValue]) groups[partitionValue] = [];

                    // Remove the partition key from the actual data object to keep it clean
                    const { [partitionBy]: _, ...cleanItem } = item;
                    groups[partitionValue].push(cleanItem);
                });

                // Write each group to a file
                for (const [groupName, items] of Object.entries(groups)) {
                    // Supports dynamic paths like "src/data/personas/{groupName}/messages.json"
                    const targetPath = path.join(ROOT_DIR, targetDirRaw.replace('{partition}', groupName));

                    // Create directory if it doesn't exist
                    await fs.mkdir(path.dirname(targetPath), { recursive: true });

                    await fs.writeFile(targetPath, JSON.stringify(items, null, 2));
                    console.log(`   - Saved ${items.length} items to ${path.relative(ROOT_DIR, targetPath)}`);
                }

            } else {
                // STANDARD LOGIC (Single File)
                const outputPath = path.join(DATA_DIR, `${key}.json`);
                // Check if key is a subpath like "global/manuals"
                if (key.includes('/')) {
                    const subDir = path.dirname(outputPath);
                    await fs.mkdir(subDir, { recursive: true });
                }

                await fs.writeFile(outputPath, JSON.stringify(jsonData, null, 2));
                console.log(`✅ Saved ${jsonData.length} items to ${key}.json`);
            }
        }

        console.log('✨ Bureau Sync Completed!');

    } catch (error) {
        console.error('❌ Fatal Error:', error);
    }
}

syncData();

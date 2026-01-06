const fs = require('fs');
const path = require('path');

const PERSONAS = [
    'parkhonglim',
    'choiyowon',
    'ryujaegwan',
    'solum',
    'haegeum',
    'koyoungeun',
    'janghyeowoon'
];

const BASE_DIR = path.join(__dirname, '../src/data/personas');

function loadJson(persona, type) {
    const p = path.join(BASE_DIR, persona, `${type}.json`);
    if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf-8'));
    }
    return [];
}

const allMessages = {};
// Load all messages
PERSONAS.forEach(p => {
    allMessages[p] = loadJson(p, 'messages');
});

console.log('--- Verifying Message Consistency ---');

const errors = [];

// Verify Consistency
PERSONAS.forEach(persona => {
    const myData = allMessages[persona] || [];
    const myInbox = myData.filter(m => m.receiverId === persona);
    const mySent = myData.filter(m => m.senderId === persona);

    // 1. Check if my Received messages exist in Sender's Sent items
    myInbox.forEach(msg => {
        const sender = msg.senderId;
        if (PERSONAS.includes(sender)) {
            const senderData = allMessages[sender] || [];
            const senderSent = senderData.filter(m => m.senderId === sender);

            // Match criteria
            const match = senderSent.find(sm =>
                sm.receiverId === persona &&
                (sm.id === msg.id || (sm.createdAt === msg.createdAt && sm.content === msg.content))
            );

            if (!match) {
                errors.push(`[MISSING IN SENDER'S BOX] ${sender} -> ${persona}: "${msg.title}" (Receiver has it, Sender missing)`);
            }
        }
    });

    // 2. Check if my Sent messages exist in Receiver's Inbox
    mySent.forEach(msg => {
        const receiver = msg.receiverId;
        if (PERSONAS.includes(receiver)) {
            const receiverData = allMessages[receiver] || [];
            const receiverInbox = receiverData.filter(m => m.receiverId === receiver);

            // Match criteria
            const match = receiverInbox.find(rm =>
                rm.senderId === persona &&
                (rm.id === msg.id || (rm.createdAt === msg.createdAt && rm.content === msg.content))
            );

            if (!match) {
                errors.push(`[MISSING IN RECEIVER'S BOX] ${persona} -> ${receiver}: "${msg.title}" (Sender has it, Receiver missing)`);
            }
        }
    });
});

if (errors.length > 0) {
    console.log(`Found ${errors.length} inconsistencies:`);
    errors.forEach(e => console.log(e));
} else {
    console.log('✅ Message relationships are consistent across all personas.');
}

/**
 * 데이터 유효성 검증 스크립트
 * 
 * 이 스크립트는 data-templates 내의 모든 JSON 파일이
 * src/types/haetae.ts에 정의된 타입과 일치하는지 검증합니다.
 * 
 * 실행 시점: npm run dev / npm run build 이전 (predev, prebuild)
 */

const fs = require('fs');
const path = require('path');

// ============================================================
// 유효한 Enum 값 정의 (src/types/haetae.ts와 동기화 필수!)
// ============================================================

const VALID_DANGER_LEVELS = ['멸형', '파형', '뇌형', '고형'];
const VALID_INCIDENT_STATUSES = ['접수', '조사중', '구조대기', '구조중', '정리대기', '정리중', '종결', '봉인'];
const VALID_AGENT_STATUSES = ['정상', '부상', '오염', '실종', '사망', '퇴사', '휴직'];
const VALID_DEPARTMENTS = ['baekho', 'hyunmu', 'jujak'];
const VALID_APPROVAL_STATUSES = ['작성중', '결재대기', '승인', '반려'];
const VALID_SCHEDULE_TYPES = ['작전', '훈련', '휴가', '당직', '방문예약', '검사', '행사'];
const VALID_EQUIPMENT_CATEGORIES = ['대여', '지급'];

// ============================================================
// 검증 함수들
// ============================================================

const errors = [];

function validateIncident(incident, filePath) {
    if (incident.dangerLevel && !VALID_DANGER_LEVELS.includes(incident.dangerLevel)) {
        errors.push({
            file: filePath,
            id: incident.id,
            field: 'dangerLevel',
            value: incident.dangerLevel,
            expected: VALID_DANGER_LEVELS.join(' | ')
        });
    }

    if (incident.status && !VALID_INCIDENT_STATUSES.includes(incident.status)) {
        errors.push({
            file: filePath,
            id: incident.id,
            field: 'status',
            value: incident.status,
            expected: VALID_INCIDENT_STATUSES.join(' | ')
        });
    }
}

function validateApproval(approval, filePath) {
    if (approval.status && !VALID_APPROVAL_STATUSES.includes(approval.status)) {
        errors.push({
            file: filePath,
            id: approval.id,
            field: 'status',
            value: approval.status,
            expected: VALID_APPROVAL_STATUSES.join(' | ')
        });
    }
}

function validateSchedule(schedule, filePath) {
    if (schedule.type && !VALID_SCHEDULE_TYPES.includes(schedule.type)) {
        errors.push({
            file: filePath,
            id: schedule.id,
            field: 'type',
            value: schedule.type,
            expected: VALID_SCHEDULE_TYPES.join(' | ')
        });
    }
}

function validateEquipment(equipment, filePath) {
    if (equipment.category && !VALID_EQUIPMENT_CATEGORIES.includes(equipment.category)) {
        errors.push({
            file: filePath,
            id: equipment.id,
            field: 'category',
            value: equipment.category,
            expected: VALID_EQUIPMENT_CATEGORIES.join(' | ')
        });
    }
}

// ============================================================
// 파일 검증 로직
// ============================================================

function validateJsonFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    let data;

    try {
        data = JSON.parse(content);
    } catch (e) {
        errors.push({
            file: filePath,
            id: 'N/A',
            field: 'JSON Parse',
            value: e.message,
            expected: 'Valid JSON'
        });
        return;
    }

    const fileName = path.basename(filePath);
    const items = Array.isArray(data) ? data : [data];

    items.forEach(item => {
        if (fileName === 'incidents.json') {
            validateIncident(item, filePath);
        } else if (fileName === 'approvals.json') {
            validateApproval(item, filePath);
        } else if (fileName === 'schedules.json') {
            validateSchedule(item, filePath);
        } else if (fileName === 'equipment.json') {
            validateEquipment(item, filePath);
        }
    });
}

function walkDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // _base 디렉토리도 검증
            walkDirectory(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            validateJsonFile(fullPath);
        }
    }
}

// ============================================================
// 메인 실행
// ============================================================

function main() {
    const templatesDir = path.join(__dirname, '../data-templates');

    console.log('🔍 데이터 유효성 검증 시작...\n');

    if (!fs.existsSync(templatesDir)) {
        console.error(`❌ 템플릿 디렉토리를 찾을 수 없습니다: ${templatesDir}`);
        process.exit(1);
    }

    walkDirectory(templatesDir);

    if (errors.length > 0) {
        console.error('❌ 데이터 검증 실패! 다음 오류를 수정하세요:\n');

        errors.forEach((err, idx) => {
            console.error(`  ${idx + 1}. [${err.file}]`);
            console.error(`     ID: ${err.id}`);
            console.error(`     필드: ${err.field}`);
            console.error(`     잘못된 값: "${err.value}"`);
            console.error(`     허용된 값: ${err.expected}`);
            console.error('');
        });

        console.error(`\n총 ${errors.length}개의 오류가 발견되었습니다.`);
        console.error('DATA_SPECIFICATION.md를 참고하여 올바른 값을 사용하세요.\n');
        process.exit(1);
    }

    console.log('✅ 모든 데이터가 유효합니다!\n');
}

main();

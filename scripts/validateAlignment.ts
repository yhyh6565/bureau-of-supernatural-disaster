#!/usr/bin/env tsx
/**
 * 초자연재난관리국 인트라넷 시스템 "해태" - Specification Alignment Validator
 *
 * 이 스크립트는 코드베이스가 specification.md, data_specification.md,
 * 그리고 원작 리서치 자료와 잘 align되어 있는지 검증합니다.
 *
 * 실행 방법: npx tsx scripts/validateAlignment.ts
 */

import fs from 'fs';
import path from 'path';

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
};

interface ValidationIssue {
    category: string;
    severity: 'error' | 'warning' | 'info';
    message: string;
    location?: string;
    suggestion?: string;
}

class AlignmentValidator {
    private issues: ValidationIssue[] = [];
    private projectRoot: string;

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
    }

    /**
     * 이슈 추가
     */
    private addIssue(issue: ValidationIssue) {
        this.issues.push(issue);
    }

    /**
     * 파일 읽기 헬퍼
     */
    private readFile(relativePath: string): string | null {
        try {
            const fullPath = path.join(this.projectRoot, relativePath);
            return fs.readFileSync(fullPath, 'utf-8');
        } catch (error) {
            this.addIssue({
                category: 'File System',
                severity: 'error',
                message: `파일을 읽을 수 없습니다: ${relativePath}`,
                location: relativePath,
            });
            return null;
        }
    }

    /**
     * 폴더 존재 여부 확인
     */
    private directoryExists(relativePath: string): boolean {
        try {
            const fullPath = path.join(this.projectRoot, relativePath);
            return fs.existsSync(fullPath) && fs.statSync(fullPath).isDirectory();
        } catch {
            return false;
        }
    }

    /**
     * 파일 존재 여부 확인
     */
    private fileExists(relativePath: string): boolean {
        try {
            const fullPath = path.join(this.projectRoot, relativePath);
            return fs.existsSync(fullPath) && fs.statSync(fullPath).isFile();
        } catch {
            return false;
        }
    }

    /**
     * 1. 타입 정의 검증 (src/types/haetae.ts)
     */
    validateTypes() {
        console.log(`\n${colors.cyan}${colors.bold}[1] 타입 정의 검증${colors.reset}`);

        const typesContent = this.readFile('src/types/haetae.ts');
        if (!typesContent) return;

        // 1.1 부서 타입 검증
        const departmentTypeMatch = typesContent.match(/export type Department = (.+);/);
        if (departmentTypeMatch) {
            const deptTypes = departmentTypeMatch[1];
            const expectedDepts = ['baekho', 'hyunmu', 'jujak'];

            expectedDepts.forEach(dept => {
                if (!deptTypes.includes(`'${dept}'`)) {
                    this.addIssue({
                        category: 'Type Definition',
                        severity: 'error',
                        message: `부서 타입에 '${dept}'가 정의되어 있지 않습니다`,
                        location: 'src/types/haetae.ts',
                        suggestion: `Department 타입에 '${dept}'를 추가하세요`,
                    });
                }
            });

            // 청룡이 있으면 경고
            if (deptTypes.includes('chungryong') || deptTypes.includes('청룡')) {
                this.addIssue({
                    category: 'Type Definition',
                    severity: 'warning',
                    message: '청룡(chungryong) 부서가 정의되어 있습니다',
                    location: 'src/types/haetae.ts',
                    suggestion: 'specification.md에는 백호, 현무, 주작 3개 부서만 정의되어 있습니다. 원작에는 청룡이 있지만 현재 spec에는 제외되었습니다.',
                });
            }
        } else {
            this.addIssue({
                category: 'Type Definition',
                severity: 'error',
                message: 'Department 타입이 정의되어 있지 않습니다',
                location: 'src/types/haetae.ts',
            });
        }

        // 1.2 재난 등급 검증 (형刑 시스템)
        const dangerLevelMatch = typesContent.match(/export type DangerLevel = (.+);/);
        if (dangerLevelMatch) {
            const levels = dangerLevelMatch[1];
            const expectedLevels = ['멸형', '파형', '뇌형', '고형'];

            expectedLevels.forEach(level => {
                if (!levels.includes(`'${level}'`)) {
                    this.addIssue({
                        category: 'Type Definition',
                        severity: 'error',
                        message: `재난 등급에 '${level}'이 정의되어 있지 않습니다`,
                        location: 'src/types/haetae.ts',
                        suggestion: `DangerLevel 타입에 '${level}'을 추가하세요 (형刑 시스템)`,
                    });
                }
            });
        } else {
            this.addIssue({
                category: 'Type Definition',
                severity: 'error',
                message: 'DangerLevel 타입이 정의되어 있지 않습니다',
                location: 'src/types/haetae.ts',
            });
        }

        // 1.3 재난 상태 검증
        const statusMatch = typesContent.match(/export type IncidentStatus = (.+);/);
        if (statusMatch) {
            const statuses = statusMatch[1];
            const expectedStatuses = ['접수', '조사중', '구조대기', '구조중', '정리대기', '정리중', '종결'];

            expectedStatuses.forEach(status => {
                if (!statuses.includes(`'${status}'`)) {
                    this.addIssue({
                        category: 'Type Definition',
                        severity: 'error',
                        message: `재난 상태에 '${status}'가 정의되어 있지 않습니다`,
                        location: 'src/types/haetae.ts',
                        suggestion: 'specification.md의 재난 처리 워크플로우를 확인하세요',
                    });
                }
            });
        }

        console.log(`${colors.green}✓${colors.reset} 타입 정의 검증 완료`);
    }

    /**
     * 2. 상수 정의 검증 (src/constants/haetae.tsx)
     */
    validateConstants() {
        console.log(`\n${colors.cyan}${colors.bold}[2] 상수 정의 검증${colors.reset}`);

        const constantsContent = this.readFile('src/constants/haetae.tsx');
        if (!constantsContent) return;

        // 2.1 부서별 표시 정보 검증
        if (!constantsContent.includes('DEPARTMENT_INFO')) {
            this.addIssue({
                category: 'Constants',
                severity: 'error',
                message: 'DEPARTMENT_INFO 상수가 정의되어 있지 않습니다',
                location: 'src/constants/haetae.tsx',
            });
        } else {
            const expectedDepts = [
                { key: 'baekho', name: '백호', fullName: '신규조사반' },
                { key: 'hyunmu', name: '현무', fullName: '출동구조반' },
                { key: 'jujak', name: '주작', fullName: '현장정리반' },
            ];

            expectedDepts.forEach(dept => {
                if (!constantsContent.includes(dept.key)) {
                    this.addIssue({
                        category: 'Constants',
                        severity: 'error',
                        message: `DEPARTMENT_INFO에 '${dept.key}' 부서 정보가 없습니다`,
                        location: 'src/constants/haetae.tsx',
                    });
                }
            });
        }

        // 2.2 아이콘 import 검증
        const expectedIcons = ['BaekhoIcon', 'HyunmuIcon', 'JujakIcon'];
        expectedIcons.forEach(icon => {
            if (!constantsContent.includes(icon)) {
                this.addIssue({
                    category: 'Constants',
                    severity: 'error',
                    message: `커스텀 부서 아이콘 '${icon}'이 import되지 않았습니다`,
                    location: 'src/constants/haetae.tsx',
                    suggestion: '@/components/icons/DeptIcons에서 import하세요',
                });
            }
        });

        // 2.3 lucide-react 아이콘 사용 확인
        if (!constantsContent.includes("from 'lucide-react'")) {
            this.addIssue({
                category: 'Constants',
                severity: 'warning',
                message: 'lucide-react 아이콘을 사용하지 않습니다',
                location: 'src/constants/haetae.tsx',
                suggestion: 'specification.md에 따르면 일반 아이콘은 lucide-react를 사용해야 합니다',
            });
        }

        // 2.4 장례법 옵션 검증
        if (!constantsContent.includes('FUNERAL_OPTIONS')) {
            this.addIssue({
                category: 'Constants',
                severity: 'warning',
                message: 'FUNERAL_OPTIONS 상수가 정의되어 있지 않습니다',
                location: 'src/constants/haetae.tsx',
                suggestion: 'specification.md의 "장례법 지정 신청" 섹션을 참고하세요',
            });
        }

        console.log(`${colors.green}✓${colors.reset} 상수 정의 검증 완료`);
    }

    /**
     * 3. 데이터 아키텍처 검증 (src/data/)
     */
    validateDataArchitecture() {
        console.log(`\n${colors.cyan}${colors.bold}[3] 데이터 아키텍처 검증${colors.reset}`);

        // 3.1 폴더 구조 검증
        const expectedFolders = ['global', 'ordinary', 'personas'];
        expectedFolders.forEach(folder => {
            if (!this.directoryExists(`src/data/${folder}`)) {
                this.addIssue({
                    category: 'Data Architecture',
                    severity: 'error',
                    message: `데이터 폴더가 존재하지 않습니다: src/data/${folder}`,
                    location: `src/data/${folder}`,
                    suggestion: 'DATA_SPECIFICATION.md의 3계층 구조를 확인하세요',
                });
            }
        });

        // 3.2 Global 데이터 파일 검증
        const globalFiles = ['incidents.json', 'notifications.json', 'equipment.json', 'locations.json'];
        globalFiles.forEach(file => {
            if (!this.fileExists(`src/data/global/${file}`)) {
                this.addIssue({
                    category: 'Data Architecture',
                    severity: 'error',
                    message: `전사 공통 데이터 파일이 없습니다: ${file}`,
                    location: `src/data/global/${file}`,
                });
            }
        });

        // 3.3 Ordinary 데이터 파일 검증
        const ordinaryFiles = ['messages.json', 'approvals.json', 'schedules.json', 'incidents.json'];
        ordinaryFiles.forEach(file => {
            if (!this.fileExists(`src/data/ordinary/${file}`)) {
                this.addIssue({
                    category: 'Data Architecture',
                    severity: 'error',
                    message: `일반 요원 데이터 파일이 없습니다: ${file}`,
                    location: `src/data/ordinary/${file}`,
                });
            }
        });

        // 3.4 페르소나 데이터 검증
        const personas = [
            'parkhonglim',
            'choiyowon',
            'ryujaegwan',
            'solum',
            'haegeum',
            'koyoungeun',
            'janghyeowoon',
        ];

        personas.forEach(persona => {
            if (!this.directoryExists(`src/data/personas/${persona}`)) {
                this.addIssue({
                    category: 'Data Architecture',
                    severity: 'error',
                    message: `페르소나 폴더가 없습니다: ${persona}`,
                    location: `src/data/personas/${persona}`,
                });
            } else {
                // 각 페르소나는 5개 파일 필요
                const personaFiles = ['incidents.json', 'messages.json', 'notifications.json', 'approvals.json', 'schedules.json'];
                personaFiles.forEach(file => {
                    if (!this.fileExists(`src/data/personas/${persona}/${file}`)) {
                        this.addIssue({
                            category: 'Data Architecture',
                            severity: 'error',
                            message: `페르소나 데이터 파일이 없습니다: ${persona}/${file}`,
                            location: `src/data/personas/${persona}/${file}`,
                        });
                    }
                });
            }
        });

        // 3.5 DataManager 검증
        const dataManagerContent = this.readFile('src/data/dataManager.ts');
        if (dataManagerContent) {
            // 병합 로직 확인
            const expectedMethods = [
                'getIncidents',
                'getNotifications',
                'getMessages',
                'getApprovals',
                'getSchedules',
                'getEquipment',
                'getLocations',
            ];

            expectedMethods.forEach(method => {
                if (!dataManagerContent.includes(method)) {
                    this.addIssue({
                        category: 'Data Manager',
                        severity: 'error',
                        message: `DataManager에 ${method} 메서드가 없습니다`,
                        location: 'src/data/dataManager.ts',
                    });
                }
            });

            // 페르소나 이름 확인
            const personaNames = ['박홍림', '최요원', '류재관', '김솔음', '해금', '고영은', '장허운'];
            personaNames.forEach(name => {
                if (!dataManagerContent.includes(name)) {
                    this.addIssue({
                        category: 'Data Manager',
                        severity: 'warning',
                        message: `DataManager에 페르소나 이름이 없습니다: ${name}`,
                        location: 'src/data/dataManager.ts',
                        suggestion: 'specification.md의 페르소나 목록을 확인하세요',
                    });
                }
            });
        }

        console.log(`${colors.green}✓${colors.reset} 데이터 아키텍처 검증 완료`);
    }

    /**
     * 4. UI 컴포넌트 검증
     */
    validateUIComponents() {
        console.log(`\n${colors.cyan}${colors.bold}[4] UI 컴포넌트 검증${colors.reset}`);

        // 4.1 부서 아이콘 검증
        const deptIconsContent = this.readFile('src/components/icons/DeptIcons.tsx');
        if (deptIconsContent) {
            const expectedIcons = ['BaekhoIcon', 'HyunmuIcon', 'JujakIcon'];
            expectedIcons.forEach(icon => {
                if (!deptIconsContent.includes(`export const ${icon}`)) {
                    this.addIssue({
                        category: 'UI Components',
                        severity: 'error',
                        message: `부서 아이콘이 정의되지 않았습니다: ${icon}`,
                        location: 'src/components/icons/DeptIcons.tsx',
                        suggestion: 'specification.md에 따르면 Heavy/Solid 스타일의 커스텀 SVG를 사용해야 합니다',
                    });
                }
            });

            // SVG 확인
            if (!deptIconsContent.includes('<svg')) {
                this.addIssue({
                    category: 'UI Components',
                    severity: 'error',
                    message: '부서 아이콘이 SVG 형식이 아닙니다',
                    location: 'src/components/icons/DeptIcons.tsx',
                });
            }
        } else {
            this.addIssue({
                category: 'UI Components',
                severity: 'error',
                message: '부서 아이콘 파일이 없습니다',
                location: 'src/components/icons/DeptIcons.tsx',
            });
        }

        // 4.2 이모티콘 사용 금지 검증
        const componentsToCheck = [
            'src/components/layout/GNBHeader.tsx',
            'src/components/dashboard/DepartmentStats.tsx',
            'src/pages/Dashboard.tsx',
            'src/pages/MyPage.tsx',
        ];

        componentsToCheck.forEach(file => {
            const content = this.readFile(file);
            if (content) {
                // 이모티콘 정규식 (유니코드 범위)
                const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

                if (emojiRegex.test(content)) {
                    this.addIssue({
                        category: 'UI Components',
                        severity: 'warning',
                        message: '컴포넌트에 이모티콘이 사용되었습니다',
                        location: file,
                        suggestion: 'specification.md에 따르면 공공기관 신뢰성을 위해 이모티콘 사용을 배제해야 합니다',
                    });
                }
            }
        });

        console.log(`${colors.green}✓${colors.reset} UI 컴포넌트 검증 완료`);
    }

    /**
     * 5. 페이지 구조 검증
     */
    validatePageStructure() {
        console.log(`\n${colors.cyan}${colors.bold}[5] 페이지 구조 검증${colors.reset}`);

        const expectedPages = [
            { path: 'src/pages/Dashboard.tsx', name: '메인 대시보드', route: '/' },
            { path: 'src/pages/MyPage.tsx', name: '개인정보', route: '/mypage' },
            { path: 'src/pages/NoticesPage.tsx', name: '공지사항', route: '/notices' },
            { path: 'src/pages/MessagesPage.tsx', name: '쪽지함', route: '/messages' },
            { path: 'src/pages/ApprovalsPage.tsx', name: '결재', route: '/approvals' },
            { path: 'src/pages/TasksPage.tsx', name: '담당업무', route: '/tasks' },
        ];

        expectedPages.forEach(page => {
            if (!this.fileExists(page.path)) {
                this.addIssue({
                    category: 'Page Structure',
                    severity: 'error',
                    message: `페이지가 없습니다: ${page.name} (${page.route})`,
                    location: page.path,
                    suggestion: 'specification.md의 "GNB 7대 메뉴" 섹션을 확인하세요',
                });
            }
        });

        // ResourcesPage는 새로운 페이지 (장비/서비스 + 방문 신청 통합)
        const resourcesPageExists = this.fileExists('src/pages/ResourcesPage.tsx');
        const equipmentPageExists = this.fileExists('src/pages/EquipmentPage.tsx');
        const visitsPageExists = this.fileExists('src/pages/VisitsPage.tsx');

        if (!resourcesPageExists && (!equipmentPageExists || !visitsPageExists)) {
            this.addIssue({
                category: 'Page Structure',
                severity: 'warning',
                message: '장비/서비스 및 방문 신청 페이지가 없습니다',
                location: 'src/pages/',
                suggestion: 'ResourcesPage.tsx (통합) 또는 EquipmentPage.tsx + VisitsPage.tsx (분리) 중 하나가 필요합니다',
            });
        }

        console.log(`${colors.green}✓${colors.reset} 페이지 구조 검증 완료`);
    }

    /**
     * 6. 원작 설정 준수 검증
     */
    validateWorldbuildingAlignment() {
        console.log(`\n${colors.cyan}${colors.bold}[6] 원작 설정 준수 검증${colors.reset}`);

        // 6.1 장비 데이터 확인
        const equipmentContent = this.readFile('src/data/global/equipment.json');
        if (equipmentContent) {
            try {
                const equipment = JSON.parse(equipmentContent);

                // 원작에 등장하는 주요 장비
                const expectedEquipment = [
                    '은심장',
                    '도깨비불',
                    '악의 저울',
                    '간이 유리감옥',
                    '해태상',
                    '줄잡이',
                    '신발끈',
                    '도깨비 초롱',
                    '도깨비 감투',
                    '유리 손포',
                ];

                const equipmentNames = equipment.map((e: any) => e.name);

                expectedEquipment.forEach(item => {
                    const found = equipmentNames.some((name: string) => name.includes(item));
                    if (!found) {
                        this.addIssue({
                            category: 'Worldbuilding',
                            severity: 'info',
                            message: `원작 장비가 데이터에 없습니다: ${item}`,
                            location: 'src/data/global/equipment.json',
                            suggestion: 'RESEARCH_초자연재난관리국.md의 "주요 장비 목록" 섹션을 참고하세요',
                        });
                    }
                });
            } catch (error) {
                this.addIssue({
                    category: 'Worldbuilding',
                    severity: 'error',
                    message: 'equipment.json 파일이 유효한 JSON 형식이 아닙니다',
                    location: 'src/data/global/equipment.json',
                });
            }
        }

        // 6.2 방문 장소 확인
        const locationsContent = this.readFile('src/data/global/locations.json');
        if (locationsContent) {
            try {
                const locations = JSON.parse(locationsContent);

                const expectedLocations = [
                    '도깨비 공방',
                    '바리데기 세공소',
                    '이정 책방',
                    '용천 선녀탕',
                ];

                const locationNames = locations.map((l: any) => l.name);

                expectedLocations.forEach(place => {
                    const found = locationNames.some((name: string) => name.includes(place));
                    if (!found) {
                        this.addIssue({
                            category: 'Worldbuilding',
                            severity: 'info',
                            message: `원작 방문 장소가 데이터에 없습니다: ${place}`,
                            location: 'src/data/global/locations.json',
                            suggestion: 'specification.md의 "방문 가능 장소" 섹션을 참고하세요',
                        });
                    }
                });
            } catch (error) {
                this.addIssue({
                    category: 'Worldbuilding',
                    severity: 'error',
                    message: 'locations.json 파일이 유효한 JSON 형식이 아닙니다',
                    location: 'src/data/global/locations.json',
                });
            }
        }

        console.log(`${colors.green}✓${colors.reset} 원작 설정 준수 검증 완료`);
    }

    /**
     * 모든 검증 실행
     */
    async runAllValidations() {
        console.log(`${colors.bold}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.bold}${colors.blue}  초자연재난관리국 인트라넷 시스템 "해태" - Alignment Validator  ${colors.reset}`);
        console.log(`${colors.bold}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

        this.validateTypes();
        this.validateConstants();
        this.validateDataArchitecture();
        this.validateUIComponents();
        this.validatePageStructure();
        this.validateWorldbuildingAlignment();

        this.printReport();
    }

    /**
     * 검증 리포트 출력
     */
    printReport() {
        console.log(`\n${colors.bold}${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.bold}검증 결과 리포트${colors.reset}`);
        console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

        const errors = this.issues.filter(i => i.severity === 'error');
        const warnings = this.issues.filter(i => i.severity === 'warning');
        const infos = this.issues.filter(i => i.severity === 'info');

        console.log(`\n${colors.bold}요약:${colors.reset}`);
        console.log(`  ${colors.red}오류 (Error):${colors.reset}   ${errors.length}건`);
        console.log(`  ${colors.yellow}경고 (Warning):${colors.reset} ${warnings.length}건`);
        console.log(`  ${colors.cyan}정보 (Info):${colors.reset}    ${infos.length}건`);

        if (this.issues.length === 0) {
            console.log(`\n${colors.green}${colors.bold}✓ 모든 검증을 통과했습니다!${colors.reset}`);
            console.log(`코드베이스가 specification.md, data_specification.md, 그리고 원작 리서치 자료와 잘 align되어 있습니다.`);
            return;
        }

        // 카테고리별 이슈 그룹화
        const issuesByCategory = this.issues.reduce((acc, issue) => {
            if (!acc[issue.category]) {
                acc[issue.category] = [];
            }
            acc[issue.category].push(issue);
            return acc;
        }, {} as Record<string, ValidationIssue[]>);

        console.log(`\n${colors.bold}상세 내역:${colors.reset}\n`);

        Object.entries(issuesByCategory).forEach(([category, issues]) => {
            console.log(`${colors.bold}[${category}]${colors.reset}`);

            issues.forEach((issue, index) => {
                const severityColor =
                    issue.severity === 'error' ? colors.red :
                    issue.severity === 'warning' ? colors.yellow :
                    colors.cyan;

                const severityLabel =
                    issue.severity === 'error' ? '오류' :
                    issue.severity === 'warning' ? '경고' :
                    '정보';

                console.log(`  ${index + 1}. ${severityColor}[${severityLabel}]${colors.reset} ${issue.message}`);

                if (issue.location) {
                    console.log(`     위치: ${colors.blue}${issue.location}${colors.reset}`);
                }

                if (issue.suggestion) {
                    console.log(`     제안: ${issue.suggestion}`);
                }

                console.log('');
            });
        });

        console.log(`${colors.blue}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
    }
}

// 메인 실행
const projectRoot = process.cwd();
const validator = new AlignmentValidator(projectRoot);
validator.runAllValidations();

#!/usr/bin/env tsx
/**
 * 초자연재난관리국 인트라넷 시스템 "해태" - UX/UI Design Validator
 *
 * 베테랑 프런트엔드 디자이너 관점에서 PC와 모바일 디자인의 최적성을 검증합니다.
 * - 한 눈에 들어오는 정보 배치
 * - 불필요한 스크롤 최소화
 * - 반응형 디자인 품질
 * - 사용자 편의성 극대화
 *
 * 실행 방법: npx tsx scripts/validateUXDesign.ts
 */

import fs from 'fs';
import path from 'path';

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    bold: '\x1b[1m',
};

interface UXIssue {
    component: string;
    category: 'viewport' | 'scroll' | 'responsive' | 'hierarchy' | 'accessibility' | 'space' | 'interaction';
    severity: 'critical' | 'major' | 'minor' | 'suggestion';
    device: 'mobile' | 'tablet' | 'desktop' | 'all';
    issue: string;
    impact: string;
    solution: string;
    codeLocation?: string;
}

// 뷰포트 크기 정의
const VIEWPORTS = {
    mobile: { width: 375, height: 667, name: 'Mobile (iPhone SE)' },
    tablet: { width: 768, height: 1024, name: 'Tablet (iPad)' },
    desktop: { width: 1920, height: 1080, name: 'Desktop (1080p)' },
};

class UXDesignValidator {
    private issues: UXIssue[] = [];
    private projectRoot: string;

    constructor(projectRoot: string) {
        this.projectRoot = projectRoot;
    }

    /**
     * 이슈 추가
     */
    private addIssue(issue: UXIssue) {
        this.issues.push(issue);
    }

    /**
     * 파일 읽기
     */
    private readFile(relativePath: string): string | null {
        try {
            const fullPath = path.join(this.projectRoot, relativePath);
            return fs.readFileSync(fullPath, 'utf-8');
        } catch {
            return null;
        }
    }

    /**
     * 폴더 내 모든 TSX 파일 찾기
     */
    private findTsxFiles(dir: string): string[] {
        const files: string[] = [];
        try {
            const fullPath = path.join(this.projectRoot, dir);
            const items = fs.readdirSync(fullPath);

            for (const item of items) {
                const itemPath = path.join(fullPath, item);
                const stat = fs.statSync(itemPath);

                if (stat.isDirectory()) {
                    const relativePath = path.relative(this.projectRoot, itemPath);
                    files.push(...this.findTsxFiles(relativePath));
                } else if (item.endsWith('.tsx')) {
                    files.push(path.relative(this.projectRoot, itemPath));
                }
            }
        } catch (error) {
            // 폴더 접근 실패 무시
        }

        return files;
    }

    /**
     * Tailwind 반응형 클래스 분석
     */
    private analyzeResponsiveClasses(content: string): {
        hasMobile: boolean;
        hasTablet: boolean;
        hasDesktop: boolean;
        classes: string[];
    } {
        const responsivePatterns = {
            mobile: /className="[^"]*(?:^|\s)(?!sm:|md:|lg:|xl:)[\w-]+/g,
            tablet: /className="[^"]*(?:sm:|md:)[\w-]+/g,
            desktop: /className="[^"]*(?:lg:|xl:|2xl:)[\w-]+/g,
        };

        return {
            hasMobile: responsivePatterns.mobile.test(content),
            hasTablet: responsivePatterns.tablet.test(content),
            hasDesktop: responsivePatterns.desktop.test(content),
            classes: content.match(/className="[^"]+"/g) || [],
        };
    }

    /**
     * 컴포넌트 높이 추정
     */
    private estimateComponentHeight(content: string): number {
        let height = 0;

        // h- 클래스에서 높이 추출
        const heightMatches = content.match(/h-(\d+|screen|full|auto)/g);
        if (heightMatches) {
            heightMatches.forEach(match => {
                if (match.includes('screen')) height += 1080;
                else if (match.includes('full')) height += 800;
                else {
                    const num = parseInt(match.replace('h-', ''));
                    if (!isNaN(num)) height += num * 4; // Tailwind: 1 = 0.25rem = 4px
                }
            });
        }

        // 대략적인 콘텐츠 높이 추정
        const lines = content.split('\n').length;
        const textElements = (content.match(/<p|<h1|<h2|<h3|<div/g) || []).length;
        height += textElements * 24; // 평균 텍스트 높이

        return height;
    }

    /**
     * 스크롤 깊이 분석
     */
    private analyzeScrollDepth(componentName: string, content: string) {
        const estimatedHeight = this.estimateComponentHeight(content);

        // 모바일에서 667px(1 screen) 이상이면 경고
        if (estimatedHeight > VIEWPORTS.mobile.height * 1.5) {
            const screens = Math.ceil(estimatedHeight / VIEWPORTS.mobile.height);
            this.addIssue({
                component: componentName,
                category: 'scroll',
                severity: screens > 3 ? 'major' : 'minor',
                device: 'mobile',
                issue: `모바일에서 약 ${screens}화면 스크롤이 필요합니다 (추정 높이: ${estimatedHeight}px)`,
                impact: '사용자가 주요 정보를 찾기 위해 과도한 스크롤을 해야 합니다.',
                solution: '주요 정보를 상단에 배치하고, 접을 수 있는 섹션(Accordion) 또는 탭(Tabs)을 사용하여 수직 공간을 절약하세요.',
                codeLocation: componentName,
            });
        }

        // 데스크탑에서도 과도한 스크롤 체크
        if (estimatedHeight > VIEWPORTS.desktop.height * 2) {
            this.addIssue({
                component: componentName,
                category: 'scroll',
                severity: 'minor',
                device: 'desktop',
                issue: `데스크탑에서도 과도한 스크롤이 필요합니다 (추정 높이: ${estimatedHeight}px)`,
                impact: '넓은 화면을 효율적으로 활용하지 못하고 있습니다.',
                solution: '그리드 레이아웃을 활용하여 수평 공간을 더 많이 사용하세요. 2-3 컬럼 레이아웃을 고려하세요.',
                codeLocation: componentName,
            });
        }
    }

    /**
     * 뷰포트 활용도 분석
     */
    private analyzeViewportUtilization(componentName: string, content: string) {
        // max-w 클래스 확인
        const maxWidthMatches = content.match(/max-w-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|full|screen)/g);

        if (maxWidthMatches) {
            const restrictiveWidths = maxWidthMatches.filter(w =>
                w.includes('max-w-xs') ||
                w.includes('max-w-sm') ||
                w.includes('max-w-md') ||
                w.includes('max-w-lg')
            );

            if (restrictiveWidths.length > 0 && componentName.includes('Dashboard')) {
                this.addIssue({
                    component: componentName,
                    category: 'space',
                    severity: 'suggestion',
                    device: 'desktop',
                    issue: `대시보드에 좁은 max-width가 설정되어 있습니다: ${restrictiveWidths.join(', ')}`,
                    impact: '넓은 화면에서 양쪽 공백이 과도하게 많아 공간이 낭비됩니다.',
                    solution: '대시보드는 max-w-7xl 이상 또는 max-w-full을 사용하여 화면을 최대한 활용하세요. 콘텐츠 영역은 padding으로 조절하세요.',
                    codeLocation: componentName,
                });
            }
        }

        // container 사용 확인
        if (content.includes('className="container"') || content.includes('className=\'container\'')) {
            // container는 적절하지만, 너무 많이 사용하면 문제
            const containerCount = (content.match(/className="[^"]*container/g) || []).length;
            if (containerCount > 1) {
                this.addIssue({
                    component: componentName,
                    category: 'space',
                    severity: 'minor',
                    device: 'all',
                    issue: `중첩된 container가 ${containerCount}개 발견되었습니다`,
                    impact: '불필요한 너비 제한으로 공간이 낭비됩니다.',
                    solution: 'container는 최상위 레이아웃에만 사용하고, 내부는 padding/margin으로 조절하세요.',
                    codeLocation: componentName,
                });
            }
        }
    }

    /**
     * 정보 계층 구조 분석
     */
    private analyzeInformationHierarchy(componentName: string, content: string) {
        // 헤딩 태그 분석
        const h1Count = (content.match(/<h1|<H1/g) || []).length;
        const h2Count = (content.match(/<h2|<H2/g) || []).length;
        const h3Count = (content.match(/<h3|<H3/g) || []).length;

        // H1이 2개 이상이면 경고
        if (h1Count > 1) {
            this.addIssue({
                component: componentName,
                category: 'hierarchy',
                severity: 'minor',
                device: 'all',
                issue: `H1 태그가 ${h1Count}개 발견되었습니다`,
                impact: 'SEO와 접근성에 부정적 영향. 정보 계층이 불명확합니다.',
                solution: '페이지당 H1은 1개만 사용하고, 나머지는 H2, H3으로 구조화하세요.',
                codeLocation: componentName,
            });
        }

        // H1 없이 H2만 있으면 경고
        if (h1Count === 0 && h2Count > 0 && componentName.includes('Page')) {
            this.addIssue({
                component: componentName,
                category: 'hierarchy',
                severity: 'minor',
                device: 'all',
                issue: 'H1 태그 없이 H2부터 시작합니다',
                impact: '페이지 제목이 명확하지 않아 사용자가 현재 위치를 파악하기 어렵습니다.',
                solution: '페이지 최상단에 명확한 H1 제목을 추가하세요.',
                codeLocation: componentName,
            });
        }

        // text-xs, text-sm이 과도하게 많으면 경고 (가독성)
        const smallTextCount = (content.match(/text-(xs|sm)/g) || []).length;
        const totalTextCount = (content.match(/text-/g) || []).length;

        if (smallTextCount > totalTextCount * 0.7 && totalTextCount > 5) {
            this.addIssue({
                component: componentName,
                category: 'hierarchy',
                severity: 'minor',
                device: 'mobile',
                issue: `전체 텍스트의 ${Math.round((smallTextCount / totalTextCount) * 100)}%가 작은 크기(xs, sm)입니다`,
                impact: '모바일에서 텍스트 가독성이 떨어집니다.',
                solution: '중요한 정보는 text-base 이상을 사용하고, 보조 정보만 text-sm을 사용하세요. 모바일에서는 최소 14px(text-sm) 이상 권장.',
                codeLocation: componentName,
            });
        }
    }

    /**
     * 반응형 디자인 분석
     */
    private analyzeResponsiveDesign(componentName: string, content: string) {
        const responsive = this.analyzeResponsiveClasses(content);

        // 반응형 클래스가 전혀 없으면 경고
        if (!responsive.hasTablet && !responsive.hasDesktop && content.length > 500) {
            this.addIssue({
                component: componentName,
                category: 'responsive',
                severity: 'critical',
                device: 'all',
                issue: '반응형 디자인이 적용되지 않았습니다',
                impact: 'PC와 모바일에서 동일한 레이아웃이 사용되어 각 디바이스에 최적화되지 않았습니다.',
                solution: 'Tailwind의 sm:, md:, lg: breakpoint를 사용하여 디바이스별 최적화를 적용하세요.',
                codeLocation: componentName,
            });
        }

        // grid 레이아웃이 반응형이 아니면 경고
        const gridMatches = content.match(/grid-cols-(\d+)/g);
        if (gridMatches && !content.includes('md:grid-cols') && !content.includes('lg:grid-cols')) {
            this.addIssue({
                component: componentName,
                category: 'responsive',
                severity: 'major',
                device: 'mobile',
                issue: 'Grid 레이아웃이 모든 디바이스에서 동일합니다',
                impact: '모바일에서 그리드 아이템이 너무 작아 보기 어렵거나, 데스크탑에서 공간이 낭비됩니다.',
                solution: `grid-cols-1 md:grid-cols-2 lg:grid-cols-${gridMatches[0].match(/\d+/)?.[0]} 형태로 반응형 그리드를 적용하세요.`,
                codeLocation: componentName,
            });
        }

        // flex 레이아웃의 방향이 고정되어 있으면 제안
        if (content.includes('flex-row') && !content.includes('flex-col')) {
            const flexCount = (content.match(/flex-row/g) || []).length;
            if (flexCount > 0) {
                this.addIssue({
                    component: componentName,
                    category: 'responsive',
                    severity: 'suggestion',
                    device: 'mobile',
                    issue: `flex-row가 ${flexCount}개 사용되었으나 모바일 대응이 없습니다`,
                    impact: '모바일에서 가로 스크롤이 발생하거나 콘텐츠가 잘릴 수 있습니다.',
                    solution: 'flex-col md:flex-row를 사용하여 모바일에서는 세로 방향으로 표시하세요.',
                    codeLocation: componentName,
                });
            }
        }

        // hidden 클래스의 반응형 처리 확인
        const hiddenMatches = content.match(/\bhidden\b/g);
        if (hiddenMatches && hiddenMatches.length > 0) {
            const hasResponsiveHidden = content.includes('md:block') ||
                content.includes('lg:block') ||
                content.includes('md:flex') ||
                content.includes('lg:flex');

            if (!hasResponsiveHidden) {
                this.addIssue({
                    component: componentName,
                    category: 'responsive',
                    severity: 'minor',
                    device: 'all',
                    issue: 'hidden 클래스가 반응형 처리 없이 사용되었습니다',
                    impact: '일부 콘텐츠가 모든 디바이스에서 숨겨져 있을 수 있습니다.',
                    solution: 'hidden md:block 또는 md:hidden lg:block 형태로 디바이스별 표시/숨김을 제어하세요.',
                    codeLocation: componentName,
                });
            }
        }
    }

    /**
     * 인터랙션 요소 분석 (터치 타겟)
     */
    private analyzeInteractionElements(componentName: string, content: string) {
        // 버튼 크기 확인
        const buttonMatches = content.match(/<Button|<button/g);
        if (buttonMatches) {
            // 버튼에 size 속성이나 padding이 없으면 경고
            const hasButtonSize = content.includes('size=') ||
                content.includes('p-2') ||
                content.includes('p-3') ||
                content.includes('p-4') ||
                content.includes('px-') ||
                content.includes('py-');

            if (!hasButtonSize && buttonMatches.length > 0) {
                this.addIssue({
                    component: componentName,
                    category: 'interaction',
                    severity: 'major',
                    device: 'mobile',
                    issue: '버튼의 터치 타겟 크기가 명시되지 않았습니다',
                    impact: '모바일에서 버튼을 터치하기 어렵습니다. 최소 44x44px 권장.',
                    solution: '버튼에 적절한 padding(p-3 이상) 또는 size 속성을 추가하세요. shadcn/ui Button은 기본 size="default"를 사용하세요.',
                    codeLocation: componentName,
                });
            }
        }

        // 아이콘만 있는 버튼 체크 (접근성)
        const iconButtonPattern = /<Button[^>]*>\s*<[A-Z]\w+Icon/g;
        const iconButtons = content.match(iconButtonPattern);
        if (iconButtons) {
            iconButtons.forEach(() => {
                if (!content.includes('aria-label')) {
                    this.addIssue({
                        component: componentName,
                        category: 'accessibility',
                        severity: 'major',
                        device: 'all',
                        issue: '아이콘 버튼에 aria-label이 없습니다',
                        impact: '스크린 리더 사용자가 버튼의 기능을 알 수 없습니다.',
                        solution: '모든 아이콘 버튼에 aria-label을 추가하세요. 예: <Button aria-label="메뉴 열기"><MenuIcon /></Button>',
                        codeLocation: componentName,
                    });
                }
            });
        }

        // 링크의 색상 구분
        if (content.includes('<a ') || content.includes('<Link')) {
            const hasLinkStyle = content.includes('text-blue') ||
                content.includes('underline') ||
                content.includes('hover:');

            if (!hasLinkStyle) {
                this.addIssue({
                    component: componentName,
                    category: 'accessibility',
                    severity: 'minor',
                    device: 'all',
                    issue: '링크가 일반 텍스트와 구분되지 않습니다',
                    impact: '사용자가 클릭 가능한 요소를 인지하기 어렵습니다.',
                    solution: '링크에 색상(text-blue-600) 또는 밑줄(underline)을 추가하고, hover 상태를 명시하세요.',
                    codeLocation: componentName,
                });
            }
        }
    }

    /**
     * 공간 활용 분석
     */
    private analyzeSpaceUtilization(componentName: string, content: string) {
        // 과도한 padding/margin 체크
        const largePadding = content.match(/p-(12|16|20|24|32)/g);
        if (largePadding && largePadding.length > 3) {
            this.addIssue({
                component: componentName,
                category: 'space',
                severity: 'minor',
                device: 'mobile',
                issue: `과도한 padding이 ${largePadding.length}개 발견되었습니다`,
                impact: '모바일에서 콘텐츠 영역이 줄어들어 정보 밀도가 낮아집니다.',
                solution: '모바일에서는 p-4 ~ p-6 정도로 padding을 줄이고, 데스크탑에서만 큰 padding을 사용하세요. 예: p-4 md:p-8',
                codeLocation: componentName,
            });
        }

        // gap이 없는 grid/flex
        if ((content.includes('grid') || content.includes('flex')) && !content.includes('gap-')) {
            this.addIssue({
                component: componentName,
                category: 'space',
                severity: 'suggestion',
                device: 'all',
                issue: 'Grid 또는 Flex 레이아웃에 gap이 설정되지 않았습니다',
                impact: '요소들이 붙어있어 답답해 보일 수 있습니다.',
                solution: 'gap-4 또는 gap-6을 추가하여 요소 간 간격을 확보하세요.',
                codeLocation: componentName,
            });
        }
    }

    /**
     * Dashboard 페이지 특화 분석
     */
    private analyzeDashboard(componentName: string, content: string) {
        if (!componentName.includes('Dashboard')) return;

        // 대시보드 레이아웃 체크
        const hasGrid = content.includes('grid');
        const hasFlex = content.includes('flex');

        if (!hasGrid && !hasFlex) {
            this.addIssue({
                component: componentName,
                category: 'viewport',
                severity: 'critical',
                device: 'desktop',
                issue: '대시보드에 Grid 또는 Flex 레이아웃이 없습니다',
                impact: '위젯들이 수직으로만 배치되어 넓은 화면 공간이 낭비됩니다.',
                solution: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 형태로 반응형 그리드를 적용하여 데스크탑에서 여러 위젯을 동시에 표시하세요.',
                codeLocation: componentName,
            });
        }

        // 대시보드 위젯 카드 높이 균일성
        if (content.includes('Card')) {
            const hasMinHeight = content.includes('min-h-') || content.includes('h-');
            if (!hasMinHeight) {
                this.addIssue({
                    component: componentName,
                    category: 'hierarchy',
                    severity: 'suggestion',
                    device: 'desktop',
                    issue: '대시보드 카드의 높이가 설정되지 않았습니다',
                    impact: '그리드 레이아웃에서 카드 높이가 들쭉날쭉하여 정돈되지 않아 보입니다.',
                    solution: '모든 카드에 min-h-[200px] 또는 h-full을 적용하여 일관된 높이를 유지하세요.',
                    codeLocation: componentName,
                });
            }
        }

        // 대시보드 섹션이 너무 많으면 탭 제안
        const sectionCount = (content.match(/<section|<Section/gi) || []).length;
        if (sectionCount > 4) {
            this.addIssue({
                component: componentName,
                category: 'scroll',
                severity: 'suggestion',
                device: 'all',
                issue: `대시보드에 ${sectionCount}개의 섹션이 있어 과도하게 길어질 수 있습니다`,
                impact: '사용자가 원하는 정보를 찾기 위해 스크롤을 많이 해야 합니다.',
                solution: 'Tabs 컴포넌트를 사용하여 "개요", "상세 통계", "최근 활동" 등으로 정보를 분류하세요.',
                codeLocation: componentName,
            });
        }
    }

    /**
     * 테이블 반응형 분석
     */
    private analyzeTable(componentName: string, content: string) {
        if (!content.includes('<Table') && !content.includes('<table')) return;

        // 모바일 대응 확인
        const hasOverflow = content.includes('overflow-x-auto') || content.includes('overflow-scroll');

        if (!hasOverflow) {
            this.addIssue({
                component: componentName,
                category: 'responsive',
                severity: 'critical',
                device: 'mobile',
                issue: '테이블에 모바일 대응이 없습니다',
                impact: '모바일에서 테이블이 화면을 벗어나 내용을 볼 수 없습니다.',
                solution: '테이블을 <div className="overflow-x-auto">로 감싸거나, 모바일에서는 카드 레이아웃으로 전환하세요.',
                codeLocation: componentName,
            });
        }

        // 테이블 컬럼이 너무 많으면 경고
        const thCount = (content.match(/<th|<TableHead/gi) || []).length;
        if (thCount > 6) {
            this.addIssue({
                component: componentName,
                category: 'viewport',
                severity: 'major',
                device: 'mobile',
                issue: `테이블에 ${thCount}개의 컬럼이 있습니다`,
                impact: '모바일에서 가로 스크롤이 길어져 사용성이 저하됩니다.',
                solution: '모바일에서는 중요한 3-4개 컬럼만 표시하고, "더보기" 버튼으로 상세 정보를 모달에 표시하세요.',
                codeLocation: componentName,
            });
        }
    }

    /**
     * 1. 페이지 분석
     */
    async validatePages() {
        console.log(`\n${colors.cyan}${colors.bold}[1] 페이지 UX/UI 분석${colors.reset}`);

        const pageFiles = this.findTsxFiles('src/pages');

        for (const file of pageFiles) {
            const content = this.readFile(file);
            if (!content) continue;

            const componentName = path.basename(file, '.tsx');
            console.log(`  분석 중: ${colors.blue}${componentName}${colors.reset}`);

            this.analyzeScrollDepth(componentName, content);
            this.analyzeViewportUtilization(componentName, content);
            this.analyzeInformationHierarchy(componentName, content);
            this.analyzeResponsiveDesign(componentName, content);
            this.analyzeInteractionElements(componentName, content);
            this.analyzeSpaceUtilization(componentName, content);
            this.analyzeDashboard(componentName, content);
            this.analyzeTable(componentName, content);
        }

        console.log(`${colors.green}✓${colors.reset} 페이지 분석 완료 (${pageFiles.length}개)`);
    }

    /**
     * 2. 주요 컴포넌트 분석
     */
    async validateComponents() {
        console.log(`\n${colors.cyan}${colors.bold}[2] 주요 컴포넌트 분석${colors.reset}`);

        const componentFolders = ['src/components/dashboard', 'src/components/layout'];
        let totalComponents = 0;

        for (const folder of componentFolders) {
            const files = this.findTsxFiles(folder);
            totalComponents += files.length;

            for (const file of files) {
                const content = this.readFile(file);
                if (!content) continue;

                const componentName = path.basename(file, '.tsx');

                this.analyzeResponsiveDesign(componentName, content);
                this.analyzeInteractionElements(componentName, content);
                this.analyzeSpaceUtilization(componentName, content);
            }
        }

        console.log(`${colors.green}✓${colors.reset} 컴포넌트 분석 완료 (${totalComponents}개)`);
    }

    /**
     * 모든 검증 실행
     */
    async runAllValidations() {
        console.log(`${colors.bold}${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.bold}${colors.magenta}       베테랑 프런트엔드 디자이너 - UX/UI Validator       ${colors.reset}`);
        console.log(`${colors.bold}${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

        await this.validatePages();
        await this.validateComponents();

        this.printReport();
    }

    /**
     * 리포트 출력
     */
    printReport() {
        console.log(`\n${colors.bold}${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
        console.log(`${colors.bold}UX/UI 검증 결과 리포트${colors.reset}`);
        console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);

        const critical = this.issues.filter(i => i.severity === 'critical');
        const major = this.issues.filter(i => i.severity === 'major');
        const minor = this.issues.filter(i => i.severity === 'minor');
        const suggestions = this.issues.filter(i => i.severity === 'suggestion');

        const mobileIssues = this.issues.filter(i => i.device === 'mobile' || i.device === 'all');
        const desktopIssues = this.issues.filter(i => i.device === 'desktop' || i.device === 'all');

        console.log(`\n${colors.bold}심각도별 요약:${colors.reset}`);
        console.log(`  ${colors.red}심각 (Critical):${colors.reset}    ${critical.length}건`);
        console.log(`  ${colors.yellow}주요 (Major):${colors.reset}       ${major.length}건`);
        console.log(`  ${colors.cyan}경미 (Minor):${colors.reset}       ${minor.length}건`);
        console.log(`  ${colors.blue}제안 (Suggestion):${colors.reset}  ${suggestions.length}건`);

        console.log(`\n${colors.bold}디바이스별 요약:${colors.reset}`);
        console.log(`  📱 모바일 관련:  ${mobileIssues.length}건`);
        console.log(`  💻 데스크탑 관련: ${desktopIssues.length}건`);

        if (this.issues.length === 0) {
            console.log(`\n${colors.green}${colors.bold}✓ 모든 UX/UI 검증을 통과했습니다!${colors.reset}`);
            console.log(`PC와 모바일 모두에서 최적의 사용자 경험을 제공하고 있습니다.`);
            return;
        }

        // 카테고리별 이슈 그룹화
        const issuesByCategory: Record<string, UXIssue[]> = {};
        this.issues.forEach(issue => {
            if (!issuesByCategory[issue.category]) {
                issuesByCategory[issue.category] = [];
            }
            issuesByCategory[issue.category].push(issue);
        });

        const categoryNames: Record<string, string> = {
            viewport: '🖥️  뷰포트 활용',
            scroll: '📜 스크롤 최적화',
            responsive: '📱 반응형 디자인',
            hierarchy: '📊 정보 계층 구조',
            accessibility: '♿ 접근성',
            space: '📐 공간 활용',
            interaction: '👆 인터랙션 요소',
        };

        console.log(`\n${colors.bold}카테고리별 상세 이슈:${colors.reset}\n`);

        // 심각도 순으로 정렬
        const severityOrder = ['critical', 'major', 'minor', 'suggestion'];
        const sortedIssues = this.issues.sort((a, b) => {
            return severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
        });

        Object.entries(issuesByCategory).forEach(([category, issues]) => {
            console.log(`${colors.bold}${categoryNames[category] || category}${colors.reset} (${issues.length}건)\n`);

            issues.forEach((issue, index) => {
                const severityColor =
                    issue.severity === 'critical' ? colors.red :
                        issue.severity === 'major' ? colors.yellow :
                            issue.severity === 'minor' ? colors.cyan :
                                colors.blue;

                const severityLabel =
                    issue.severity === 'critical' ? '심각' :
                        issue.severity === 'major' ? '주요' :
                            issue.severity === 'minor' ? '경미' :
                                '제안';

                const deviceEmoji =
                    issue.device === 'mobile' ? '📱' :
                        issue.device === 'tablet' ? '📱' :
                            issue.device === 'desktop' ? '💻' :
                                '🌐';

                console.log(`  ${index + 1}. ${severityColor}[${severityLabel}]${colors.reset} ${deviceEmoji} ${issue.component}`);
                console.log(`     ${colors.bold}문제:${colors.reset} ${issue.issue}`);
                console.log(`     ${colors.bold}영향:${colors.reset} ${issue.impact}`);
                console.log(`     ${colors.bold}해결:${colors.reset} ${colors.green}${issue.solution}${colors.reset}`);

                if (issue.codeLocation) {
                    console.log(`     ${colors.blue}위치: ${issue.codeLocation}${colors.reset}`);
                }

                console.log('');
            });
        });

        console.log(`${colors.magenta}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);

        // 우선순위 권장사항
        if (critical.length > 0) {
            console.log(`${colors.red}${colors.bold}⚠️  우선 해결 필요 (Critical):${colors.reset}`);
            critical.slice(0, 3).forEach((issue, i) => {
                console.log(`   ${i + 1}. ${issue.component}: ${issue.issue}`);
            });
            console.log('');
        }

        if (major.length > 0) {
            console.log(`${colors.yellow}${colors.bold}📌 주요 개선 사항 (Major):${colors.reset}`);
            major.slice(0, 3).forEach((issue, i) => {
                console.log(`   ${i + 1}. ${issue.component}: ${issue.issue}`);
            });
            console.log('');
        }
    }
}

// 메인 실행
const projectRoot = process.cwd();
const validator = new UXDesignValidator(projectRoot);
validator.runAllValidations();

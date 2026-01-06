import { Incident } from '@/types/haetae';

// 세광특별시 사건 목록 (대피소가 된 지하철역 7곳 + 멸형급 재난 1건)
export const segwangIncidents: Incident[] = [
    {
        id: 'inc-segwang-final',
        title: '세광특별시 실외 - 구체와 루프',
        status: '조사중',
        dangerLevel: '멸형',
        location: '세광특별시 전역 (실외)',
        reportContent: '도시 상공에 빌딩보다 거대한 구체 식별됨. 5월 4일이 무한 반복되는 타임 루프 현상 감지. 진입 시 탈출 불가.',
        caseNumber: '0000PSYA-20■■-S000',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: false,
        createdAt: new Date('2024-05-04T23:47:00'),
        updatedAt: new Date('2024-05-04T23:47:00')
    },
    {
        id: 'inc-segwang-station-1',
        title: '세광역 - 임종의 숲길',
        status: '조사중',
        dangerLevel: '파형',
        location: '지하철 세광역',
        reportContent: '역사가 안개 낀 숲으로 변이. 환각과 환청이 목을 매달도록 유도함. 개찰구 등에서 뛰면 안 된다는 수칙 존재.',
        caseNumber: '0000PSYA-20■■-S001',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: true,
        createdAt: new Date('2024-05-04T22:30:00'),
        updatedAt: new Date('2024-05-04T23:40:00')
    },
    {
        id: 'inc-segwang-station-2',
        title: '자정역 - 신체 카지노',
        status: '조사중',
        dangerLevel: '파형',
        location: '지하철 자정역 (로얄 카지노)',
        reportContent: '신체를 칩으로 교환하는 카지노 개장. 오른손 약지 4코인, 오른눈 35코인 등 신체 부위 거래 중. 잃은 부위는 되찾을 수 없음.',
        caseNumber: '0000PSYA-20■■-S002',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: true,
        createdAt: new Date('2024-05-04T22:35:00'),
        updatedAt: new Date('2024-05-04T23:38:00')
    },
    {
        id: 'inc-segwang-station-3',
        title: '한밤역 - 한빛도서관',
        status: '조사중',
        dangerLevel: '파형',
        location: '지하철 한밤역 (한빛도서관)',
        reportContent: '책장으로 이루어진 인공 동굴 형태. 창문을 보면 과거의 자신들로 분열됨. 문자 체계 붕괴 및 애너그램 현상.',
        caseNumber: '0000PSYA-20■■-S003',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: true,
        createdAt: new Date('2024-05-04T22:40:00'),
        updatedAt: new Date('2024-05-04T23:25:00')
    },
    {
        id: 'inc-segwang-station-4',
        title: '황혼역 - 양심판매대',
        status: '조사중',
        dangerLevel: '파형',
        location: '지하철 황혼역 (플리마켓)',
        reportContent: '무인 플리마켓 변이. 물건 값을 치르지 않으면 역 내부 온도가 상승하여 불타는 지옥이 됨. 되돌려놓기 불가능.',
        caseNumber: '0000PSYA-20■■-S004',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: true,
        createdAt: new Date('2024-05-04T22:45:00'),
        updatedAt: new Date('2024-05-04T23:15:00')
    },
    {
        id: 'inc-segwang-station-5',
        title: '오후역 - 혈액 방송국',
        status: '조사중',
        dangerLevel: '파형',
        location: '지하철 오후역',
        reportContent: '홈쇼핑 스튜디오 변이. 생존자를 일용직으로 고용해 치명인 상품 시연 강요. 사망 후에도 노동 지속.',
        caseNumber: '0000PSYA-20■■-S005',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: true,
        createdAt: new Date('2024-05-04T22:50:00'),
        updatedAt: new Date('2024-05-04T23:30:00')
    },
    {
        id: 'inc-segwang-station-6',
        title: '한낮역 - 낮잠용 쉼터',
        status: '조사중',
        dangerLevel: '파형',
        location: '지하철 한낮역 (주택가)',
        reportContent: '평화로운 주택가 환영. 강렬한 졸음("낮잠") 유발. 목이 돌아간 주민들이 생존자를 추격함.',
        caseNumber: '0000PSYA-20■■-S006',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: true,
        createdAt: new Date('2024-05-04T22:55:00'),
        updatedAt: new Date('2024-05-04T23:45:00')
    },
    {
        id: 'inc-segwang-station-7',
        title: '아침역 - 저울 재판소',
        status: '조사중',
        dangerLevel: '파형',
        location: '지하철 아침역 (재판소)',
        reportContent: '백색 공동의 재판소. "악의 저울"이 심장과 사랑하는 대상을 무게질함. 무한 재심사 반복.',
        caseNumber: '0000PSYA-20■■-S007',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: true,
        createdAt: new Date('2024-05-04T23:00:00'),
        updatedAt: new Date('2024-05-04T23:50:00')
    },
    // 5월 4일 이전 일반 재난 (관리 중)
    {
        id: 'inc-segwang-normal-1',
        title: '세광시청 지하 울음 계단',
        status: '구조대기', // 관리 중 -> 구조대기
        dangerLevel: '고형',
        location: '세광시청 지하 3층 비상계단',
        reportContent: '밤 11시 이후 계단에서 울음소리가 들리며, 소리를 따라가면 길을 잃게 됨.',
        caseNumber: '0000PSYA.20■■.세01',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: true,
        createdAt: new Date('2024-04-27T00:00:00'),
        updatedAt: new Date('2024-04-27T00:00:00')
    },
    {
        id: 'inc-segwang-normal-2',
        title: '세광대학교 3호관 귀가 거울',
        status: '구조대기', // 관리 중 -> 구조대기
        dangerLevel: '고형',
        location: '세광대 3호관 3층 화장실',
        reportContent: '특정 시간에 거울을 보면 귀가 시점의 자신이 비친다.',
        caseNumber: '0000PSYA.20■■.세02',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: false,
        createdAt: new Date('2024-04-15T00:00:00'),
        updatedAt: new Date('2024-04-15T00:00:00')
    },
    {
        id: 'inc-segwang-normal-3',
        title: '구시가지 길 잃은 골목',
        status: '구조중', // 관리 중 -> 구조중
        dangerLevel: '고형',
        location: '구시가지 ██번지 일대',
        reportContent: '특정 조건에서 진입 시 같은 골목을 무한 반복하게 됨.',
        caseNumber: '0000PSYA.20■■.세17',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: true,
        createdAt: new Date('2024-03-22T00:00:00'),
        updatedAt: new Date('2024-03-22T00:00:00')
    },
    {
        id: 'inc-segwang-normal-4',
        title: '세광공원 벤치의 노인',
        status: '구조중', // 관리 중 -> 구조중
        dangerLevel: '고형',
        location: '세광공원 남측 벤치',
        reportContent: '노인과 대화를 시도하면 과거의 기억을 잃게 됨.',
        caseNumber: '0000PSYA.20■■.세24',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: true,
        createdAt: new Date('2024-04-08T00:00:00'),
        updatedAt: new Date('2024-04-08T00:00:00')
    },
    {
        id: 'inc-segwang-normal-5',
        title: '세광역 지하 대합실 메아리',
        status: '정리중', // 관리 중 -> 정리중
        dangerLevel: '고형',
        location: '세광역 지하 대합실',
        reportContent: '간헐적으로 들리는 메아리를 따라가면 존재하지 않는 플랫폼으로 연결됨.',
        caseNumber: '0000PSYA.20■■.세31',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: true,
        createdAt: new Date('2024-04-19T00:00:00'),
        updatedAt: new Date('2024-04-19T00:00:00')
    },
    {
        id: 'inc-segwang-normal-6',
        title: '구시가지 ██번지 시간 정지 구역',
        status: '종결', // 봉인 -> 종결
        dangerLevel: '뇌형',
        location: '구시가지 ██번지',
        reportContent: '5월 정기 점검 예정.',
        caseNumber: '0000PSYA.20■■.세04',
        registrationNumber: '■■■■-■■■■',
        requiresPatrol: false,
        createdAt: new Date('2024-04-30T00:00:00'),
        updatedAt: new Date('2024-04-30T00:00:00')
    }
];

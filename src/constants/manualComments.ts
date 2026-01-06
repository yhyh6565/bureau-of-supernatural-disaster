import { Agent } from '@/types/haetae';

export interface ManualComment {
    id: string;
    manualId: string;
    authorName: string;
    authorRank?: string; // e.g. "팀장", "선임"
    content: string;
    createdAt: string; // ISO Date string
    isSystem?: boolean; // If true, special styling
    parentId?: string; // For nested replies
}

export const DEFAULT_MANUAL_COMMENTS: ManualComment[] = [
    // 룩키마트 (man-looky-001)
    {
        id: 'cmt-looky-01',
        manualId: 'man-looky-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '계산 끝낸 물건 훔치는 거, 생각보다 어렵다. 쇼핑객들 움직임이 느릿느릿해 보여도 막상 접근하면 긴장돼서 실수하기 쉬움. 침착하게.',
        createdAt: '2023-11-15T14:30:00'
    },
    {
        id: 'cmt-looky-01-r1',
        manualId: 'man-looky-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '영수증 붙은 상품 찾는 게 제일 확실함. 카트 안 뒤적여봐.',
        createdAt: '2023-11-15T14:32:00',
        parentId: 'cmt-looky-01'
    },
    {
        id: 'cmt-looky-02',
        manualId: 'man-looky-001',
        authorName: '류재관',
        authorRank: '실무관', // Corrected rank
        content: '쇼핑객과의 신체접촉은 절대 금지입니다. 공황 상태에 빠진 쇼핑객은 구조가 거의 불가능합니다.',
        createdAt: '2024-02-10T09:15:00'
    },
    {
        id: 'cmt-looky-02-r1',
        manualId: 'man-looky-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '걔들이 소리 지르면 직원 5명은 기본으로 온다. 진짜 순식간임.',
        createdAt: '2024-02-10T09:20:00',
        parentId: 'cmt-looky-02'
    },
    {
        id: 'cmt-looky-03',
        manualId: 'man-looky-001',
        authorName: '류재관',
        authorRank: '실무관',
        content: '영업 종료 후 탈출은 권장하지 않습니다. 거의 모든 탈출 루트가 함정입니다.',
        createdAt: '2024-02-10T09:30:00'
    },
    {
        id: 'cmt-looky-04',
        manualId: 'man-looky-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '4층 비상구 진짜 현혹적이다. 불 켜져 있고 표지판도 멀쩡해서 진짜 비상구 같음. 속지 마.',
        createdAt: '2024-03-01T15:00:00'
    },
    {
        id: 'cmt-looky-05',
        manualId: 'man-looky-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '장기 실종자들은 이미 사람 아니다. 말도 안 통하고 공격적임. 구출 시도 금지야.',
        createdAt: '2024-03-12T11:45:00'
    },

    {
        id: 'cmt-looky-06',
        manualId: 'man-looky-001',
        authorName: '해금',
        authorRank: '팀장',
        content: '푸드코트 1시간마다 자리 바꾸는 거 잊지 마라.',
        createdAt: '2024-03-20T18:00:00'
    },

    // 지산소 공양의식 (man-jisan-001)
    {
        id: 'cmt-jisan-01',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '나 이거 진짜 열심히 적었다 포도야 알차게 써먹어라ㅋㅋㅋㅋ',
        createdAt: '2024-05-15T10:05:00'
    },
    {
        id: 'cmt-jisan-02',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '뉴 신입 대환영 현무 1팀의 에이스 최 요원의 꿀팁 대방출',
        createdAt: '2024-05-15T10:06:00'
    },
    {
        id: 'cmt-jisan-02-r1',
        manualId: 'man-jisan-001',
        authorName: '류재관',
        authorRank: '실무관',
        content: '제발 이런 글 좀 그만 적으십시오.',
        createdAt: '2024-05-15T10:30:00',
        parentId: 'cmt-jisan-02'
    },
    {
        id: 'cmt-jisan-02-r2',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '청동 요원의 덜 단 꿀팁도 포함됨',
        createdAt: '2024-05-15T10:32:00',
        parentId: 'cmt-jisan-02'
    },
    {
        id: 'cmt-jisan-02-r3',
        manualId: 'man-jisan-001',
        authorName: '류재관',
        authorRank: '실무관',
        content: '하..',
        createdAt: '2024-05-15T10:35:00',
        parentId: 'cmt-jisan-02'
    },
    {
        id: 'cmt-jisan-03',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '반드시 정독할 것. 이 초자연 재난 소개인데 좀 어려워도 소설처럼 읽어봐',
        createdAt: '2024-05-15T10:07:00'
    },
    {
        id: 'cmt-jisan-04',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '깃털 하나 빼돌려서 분석했더니 수탉 깃이라더라. 도깨비가 질색했었음.',
        createdAt: '2024-05-15T10:10:00'
    },
    {
        id: 'cmt-jisan-05',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '인상착의는 헷갈릴까 봐 굳이 안 적었음. 아무튼 절대로! 외지인한테 먼저 말 걸면서 친절한 척하는 사람 믿지마라 포도야',
        createdAt: '2024-05-15T10:12:00'
    },
    {
        id: 'cmt-jisan-05-r1',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '사탕 주면서 애들 꼬시는 미친놈들 있지? 그냥 그거야ㅎㅎ',
        createdAt: '2024-05-15T10:13:00',
        parentId: 'cmt-jisan-05'
    },
    {
        id: 'cmt-jisan-06',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '혹시 모르는 척만 하는 건가 싶어서 심문도 해봤는데 진짜 모르는 것 같았거든? 이상한 금제가 걸려 있는 듯. 지부에도 관련 정보 없으니까 나 없을 때는 그냥 넘겨.',
        createdAt: '2024-05-15T10:15:00'
    },
    {
        id: 'cmt-jisan-07',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '마을 사람들이 읊는 건 아마 주술문이나 기도문 같은데… 무속적으로는 맞는 표현이 아니긴 해도 너무 주의 깊게 듣지는 마. 초자연 현상이 주는 주문이 좋은 영향을 주는 경우는 거의 없어.',
        createdAt: '2024-05-15T10:18:00'
    },
    {
        id: 'cmt-jisan-08',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '자정 이후에는 서낭당만 아니면 돌아다녀도 비교적 안전해. 그렇다고 일부러 큰소리 막 내진 말고!',
        createdAt: '2024-05-15T10:20:00'
    },
    {
        id: 'cmt-jisan-08-r1',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '야밤에 마을 사람에게 들켰으면 최대한 빠르고 조용하게 숨자. 불가능하다면? 제압해서 폐가에 숨겨!',
        createdAt: '2024-05-15T10:21:00',
        parentId: 'cmt-jisan-08'
    },
    {
        id: 'cmt-jisan-09',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '안타깝지만 아직 축제 기간에 마을 주민을 초자연 재난의 영향력에서 벗어나도록 구조한 사례는 없어. 내가 우리팀으로 점 찍은 후배 요원이라면 꼭 한 번 구조 시도를 해볼 성미의 녀석일 텐데, 미리 말해둔다.',
        createdAt: '2024-05-15T10:25:00'
    },
    {
        id: 'cmt-jisan-09-r1',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '후배님. 그건 선배들이 시도해 볼 테니깐, 넌 하지 마. 마을 사람이랑 같이 축제 기간에 지산 마을에서 나가려고 하면, 요원도 같이 실종돼.',
        createdAt: '2024-05-15T10:26:00',
        parentId: 'cmt-jisan-09'
    },
    {
        id: 'cmt-jisan-09-r2',
        manualId: 'man-jisan-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '다시 적지만 이거 축제 중인 마을 사람한테는 안 통하니까 섣불리 시도하지 마. 준비 없이 얼결에 했다가 마을과 현실 사이에서 길 잃지 말고.',
        createdAt: '2024-05-15T10:28:00',
        parentId: 'cmt-jisan-09'
    },

    // 지평선 산장 (man-villa-001)
    {
        id: 'cmt-villa-01',
        manualId: 'man-villa-001',
        authorName: '류재관',
        authorRank: '실무관', // corrected to match profile
        content: '지급된 독극물을 사용하십시오. 다른 요원이 독단적으로 가사 상태 유도를 시도했으나, 교환식 후 해당 인원은 토사물로 질식사했습니다.',
        createdAt: '2024-01-05T10:20:00'
    },
    {
        id: 'cmt-villa-02',
        manualId: 'man-villa-001',
        authorName: '류재관',
        authorRank: '실무관',
        content: '뒤뜰은 눈이 쌓여 있을 확률이 높습니다. 발자국이 남지 않도록 주의하십시오.',
        createdAt: '2024-01-05T10:25:00'
    },
    {
        id: 'cmt-villa-03',
        manualId: 'man-villa-001',
        authorName: '해금',
        authorRank: '팀장',
        content: '지급된 독극물만 써라. 다른 방법 시도하지 마.',
        createdAt: '2024-01-05T10:30:00'
    },

    // 반짝반짝 용궁 (man-dragon-001)
    {
        id: 'cmt-dragon-01',
        manualId: 'man-dragon-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '미끄럼틀 거꾸로 기어오를 때 진짜 팔 힘 중요함. 중간에 미끄러지면 어떻게 되는지 모르니까 절대 미끄러지지 마.',
        createdAt: '2024-04-12T16:40:00'
    },
    {
        id: 'cmt-dragon-02',
        manualId: 'man-dragon-001',
        authorName: '류재관',
        authorRank: '실무관', // corrected to match profile
        content: '장기 실종자는 구조 시 물거품이 됩니다. 반드시 실종 날짜를 확인하십시오.',
        createdAt: '2024-04-12T16:50:00'
    },
    {
        id: 'cmt-dragon-02-r1',
        manualId: 'man-dragon-001',
        authorName: '최요원',
        authorRank: '실무관',
        content: '애들 설득하는 거 진짜 어려움. "엄마가 기다려" 이런 말 해도 안 먹히는 애들 많아.',
        createdAt: '2024-04-12T16:55:00',
        parentId: 'cmt-dragon-02'
    }
];

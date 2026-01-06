// 매뉴얼 코멘트 타입 및 기본 데이터

export interface ManualComment {
  id: string;
  manualId: string;
  authorName: string;
  authorRank?: string;
  content: string;
  parentId?: string; // 답글인 경우 부모 코멘트 ID
  createdAt: string; // ISO string
}

// 기본 코멘트(고정) + 세션 코멘트(ManualStorage)가 합쳐져 표시됩니다.
export const DEFAULT_MANUAL_COMMENTS: ManualComment[] = [
  {
    id: 'cmt-default-001',
    manualId: 'manual-001',
    authorName: '박홍림',
    authorRank: '주임',
    content: '현장에서 절대 그림자를 밟지 마세요. 저번에 신입이 그랬다가 큰일 날 뻔했습니다.',
    createdAt: '2025-12-15T09:30:00Z',
  },
  {
    id: 'cmt-default-002',
    manualId: 'manual-001',
    authorName: '류재관',
    authorRank: '대리',
    content: '봉인 장치 설치 시 반드시 2인 1조로 작업하세요. 혼자 하면 위험합니다.',
    createdAt: '2025-12-16T14:20:00Z',
  },
  {
    id: 'cmt-default-003',
    manualId: 'manual-002',
    authorName: '최요원',
    authorRank: '주임',
    content: '기생수 탐지 시 반드시 방어막 장비를 착용하세요.',
    createdAt: '2025-12-10T11:00:00Z',
  },
];

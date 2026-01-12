import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Message } from '@/types/haetae';
import { DataManager } from '@/data/dataManager';
import { useAuthStore } from '@/store/authStore';
import { useBureauStore } from '@/store/bureauStore';
import { Mail, Send, Inbox, ArrowLeft, Reply, User, MoreHorizontal, PenLine } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { getPersonaName } from '@/constants/haetae';
import { useInteractionStore } from '@/store/interactionStore';
import { safeFormatDate, formatSegwangDate } from '@/utils/dateUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

// Import Saekwang messages
import segwangMessages from '@/data/segwang/messages.json';


export function MessagesPage() {
  const { agent } = useAuthStore();
  const { mode } = useBureauStore();
  const { sessionMessages, sendMessage } = useInteractionStore();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({ recipient: '', title: '', content: '' });

  // Filter Segwang messages and parse dates
  const segwangInbox = (segwangMessages as any[]).filter(m => m.receiverId === 'user').map(m => ({
    ...m,
    senderName: '■■■',
    senderDepartment: '■■■■■',
    createdAt: new Date(m.createdAt),
    isRead: m.isRead === 'true' || m.isRead === true
  })) as Message[];

  const segwangSent = (segwangMessages as any[]).filter(m => m.senderId === 'user').map(m => ({
    ...m,
    senderName: '나',
    senderDepartment: '■■■■■',
    createdAt: new Date(m.createdAt),
    isRead: m.isRead === 'true' || m.isRead === true
  })) as Message[];

  // DataManager를 통해 메시지 로드 (또는 세광 데이터) + 세션 메시지 병합
  const baseMessages = mode === 'segwang'
    ? [...segwangInbox, ...segwangSent]
    : DataManager.getMessages(agent);

  const ALL_MESSAGES = [...baseMessages, ...sessionMessages];

  const receivedMessages = ALL_MESSAGES.filter(m => {
    const isMe = m.receiverId === agent?.personaKey || m.receiverId === agent?.id || m.receiverId === 'me';
    return isMe || (mode === 'segwang' && m.receiverId === 'user');
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const sentMessages = ALL_MESSAGES.filter(m => {
    const isMe = m.senderId === agent?.personaKey || m.senderId === agent?.id;
    return isMe || (mode === 'segwang' && m.senderId === 'user');
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const unreadCount = receivedMessages.filter(m => !m.isRead).length;

  const handleSendMessage = () => {
    if (!newMessage.recipient || !newMessage.title || !newMessage.content) {
      toast({
        title: '입력 오류',
        description: '모든 필드를 입력해주세요.',
        variant: 'destructive',
      });
      return;
    }

    if (agent) {
      sendMessage(agent, newMessage.recipient, newMessage.title, newMessage.content).then(() => {
        toast({
          title: '전송 완료',
          description: '메시지가 전송되었습니다.',
        });
        setNewMessage({ recipient: '', title: '', content: '' });
        setIsComposeOpen(false);
      });
    } else {
      toast({
        title: '오류',
        description: '로그인 정보가 없습니다.',
        variant: 'destructive',
      });
    }
  };



  if (selectedMessage) {
    return (
      <MainLayout>
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedMessage(null)}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Button>
        </div>

        <Card className="card-gov pb-12">
          <div className="p-6 border-b border-border">
            <div className="space-y-4">
              <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">{selectedMessage.title}</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>발신: {selectedMessage.senderName} ({selectedMessage.senderDepartment})</span>
                </div>
                <span>|</span>
                {selectedMessage.id === 'msg-haunted-001' ? '20■■.05.04' : formatSegwangDate(selectedMessage.createdAt, 'yyyy.MM.dd', mode === 'segwang')}
              </div>
            </div>
          </div>
          <CardContent className="pt-8">
            <div className="prose prose-sm max-w-none mb-8 min-h-[200px]">
              <p className="whitespace-pre-wrap leading-relaxed">
                {selectedMessage.receiverId === 'me'
                  ? selectedMessage.content.replace(/\bme\b/g, agent?.name || 'me')
                  : selectedMessage.content}
              </p>
            </div>

            <div className="flex gap-2 pt-6 border-t border-border">
              <Button variant="outline" className="gap-2">
                <Reply className="w-4 h-4" />
                답장
              </Button>
            </div>
          </CardContent>
        </Card>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-4">
        <Tabs defaultValue="received" className="w-full">
          {/* Header Area */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <TabsList className="bg-white/80 p-1 border border-border/50 h-auto">
              <TabsTrigger
                value="received"
                className="h-7 text-xs gap-2 px-4 data-[state=active]:bg-primary/5 data-[state=active]:text-primary rounded-sm transition-colors"
              >
                <Inbox className="w-3.5 h-3.5" />
                받은 쪽지
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-1.5 h-4 w-4 p-0 flex items-center justify-center rounded-full text-[10px]">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="sent"
                className="h-7 text-xs gap-2 px-4 data-[state=active]:bg-primary/5 data-[state=active]:text-primary rounded-sm transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                보낸 쪽지
              </TabsTrigger>
            </TabsList>

            <Button
              className="gap-1.5 bg-blue-900 hover:bg-blue-800 text-white h-[calc(1.75rem+2px)] px-3 text-xs shrink-0"
              onClick={() => {
                if (mode === 'segwang') {
                  toast({
                    title: '전송 실패',
                    description: '현재 네트워크 상태가 불안정하여 쪽지를 보낼 수 없습니다.',
                    variant: 'destructive',
                  });
                  return;
                }
                setIsComposeOpen(true);
              }}
            >
              <PenLine className="w-3.5 h-3.5" />
              쪽지 쓰기
            </Button>

            <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>새 쪽지 작성</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>받는 사람 <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="수신자 이름 입력"
                      value={newMessage.recipient}
                      onChange={(e) => setNewMessage({ ...newMessage, recipient: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>제목 <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="쪽지 제목"
                      value={newMessage.title}
                      onChange={(e) => setNewMessage({ ...newMessage, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>내용 <span className="text-destructive">*</span></Label>
                    <Textarea
                      placeholder="쪽지 내용을 입력하세요..."
                      rows={6}
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter className="flex-row gap-2 sm:justify-end">
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsComposeOpen(false)}>취소</Button>
                  <Button className="flex-1 sm:flex-none" onClick={handleSendMessage}>발송</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border border-border/60 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-0">
              {/* Content: Received */}
              <TabsContent value="received" className="mt-0">
                {/* Desktop Table Header */}
                <div className="hidden md:grid grid-cols-[3fr_6fr_2fr] gap-4 p-4 border-b border-border/60 bg-muted/20 text-sm font-medium text-muted-foreground">
                  <div>발신자</div>
                  <div>제목</div>
                  <div className="text-right pr-4">수신일</div>
                </div>

                <div className="divide-y divide-border/40">
                  {receivedMessages.length > 0 ? (
                    receivedMessages.map((message) => (
                      <div
                        key={message.id}
                        className="group hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedMessage(message)}
                      >
                        {/* Mobile Card Layout */}
                        <div className="md:hidden p-4 space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                {!message.isRead && (
                                  <Badge className="bg-blue-600 hover:bg-blue-700 h-5 px-1.5 rounded-[4px] text-[10px] font-normal shrink-0">
                                    NEW
                                  </Badge>
                                )}
                                <span className="font-medium text-foreground line-clamp-1">
                                  {message.title}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {message.senderName} <span className="text-xs opacity-70">({message.senderDepartment})</span>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                              {message.id === 'msg-haunted-001' ? '20■■.05.04' : formatSegwangDate(message.createdAt, 'yyyy.MM.dd', mode === 'segwang')}
                            </span>
                          </div>
                        </div>

                        {/* Desktop Row Layout */}
                        <div className="hidden md:grid grid-cols-[3fr_6fr_2fr] gap-4 p-4 items-center">
                          <div className="text-sm font-medium text-foreground/90 truncate">
                            {message.senderName} <span className="text-muted-foreground text-xs font-normal">({message.senderDepartment})</span>
                          </div>

                          <div className="flex items-center gap-2 min-w-0">
                            {!message.isRead && (
                              <Badge className="bg-blue-600 hover:bg-blue-700 h-5 px-1.5 rounded-[4px] text-[10px] font-normal shrink-0">
                                NEW
                              </Badge>
                            )}
                            <span className="text-sm text-foreground/80 truncate group-hover:text-primary transition-colors">
                              {message.title}
                            </span>
                          </div>

                          <div className="text-right pr-4 text-sm text-muted-foreground font-mono">
                            {message.id === 'msg-haunted-001' ? '20■■.05.04' : formatSegwangDate(message.createdAt, 'yyyy.MM.dd', mode === 'segwang')}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-muted-foreground text-sm">
                      받은 쪽지가 없습니다.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Content: Sent */}
              <TabsContent value="sent" className="mt-0">
                {/* Desktop Table Header */}
                <div className="hidden md:grid grid-cols-[3fr_6fr_2fr] gap-4 p-4 border-b border-border/60 bg-muted/20 text-sm font-medium text-muted-foreground">
                  <div>수신자</div>
                  <div>제목</div>
                  <div className="text-right pr-4">발신일</div>
                </div>

                <div className="divide-y divide-border/40">
                  {sentMessages.length > 0 ? (
                    sentMessages.map((message) => (
                      <div
                        key={message.id}
                        className="group hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setSelectedMessage(message)}
                      >
                        {/* Mobile Card Layout */}
                        <div className="md:hidden p-4 space-y-3">
                          <div className="flex justify-between items-start gap-3">
                            <div className="space-y-1 flex-1">
                              <span className="font-medium text-foreground line-clamp-1 block">
                                {message.title}
                              </span>
                              <div className="text-sm text-muted-foreground">
                                {getPersonaName(message.receiverId)}
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap pt-1">
                              {formatSegwangDate(message.createdAt, 'yyyy.MM.dd', mode === 'segwang')}
                            </span>
                          </div>
                        </div>

                        {/* Desktop Row Layout */}
                        <div className="hidden md:grid grid-cols-[3fr_6fr_2fr] gap-4 p-4 items-center">
                          <div className="text-sm font-medium text-foreground/90 truncate">
                            {getPersonaName(message.receiverId)}
                          </div>

                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sm text-foreground/80 truncate group-hover:text-primary transition-colors">
                              {message.title}
                            </span>
                          </div>

                          <div className="text-right pr-4 text-sm text-muted-foreground font-mono">
                            {formatSegwangDate(message.createdAt, 'yyyy.MM.dd', mode === 'segwang')}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-muted-foreground text-sm">
                      보낸 쪽지가 없습니다.
                    </div>
                  )}
                </div>
              </TabsContent>
            </CardContent>
          </Card>

          {/* Pagination Placeholder */}
          <div className="flex justify-center py-4">
            <div className="flex gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
            </div>
          </div>
        </Tabs>
      </div>
    </MainLayout>
  );
}

export default MessagesPage;

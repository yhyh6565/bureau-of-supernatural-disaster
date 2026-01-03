import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Message } from '@/types/haetae';
import { DataManager } from '@/data/dataManager';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Send, Inbox, ArrowLeft, Reply, User } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { getPersonaName } from '@/constants/haetae';
import { useInteraction } from '@/contexts/InteractionContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';


export function MessagesPage() {
  const { agent } = useAuth();
  const { sessionMessages, sendMessage } = useInteraction();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({ recipient: '', title: '', content: '' });

  // DataManager를 통해 메시지 로드 + 세션 메시지 병합
  const ALL_MESSAGES = [...DataManager.getMessages(agent), ...sessionMessages];

  const receivedMessages = ALL_MESSAGES.filter(m =>
    m.receiverId === agent?.personaKey || m.receiverId === agent?.id || m.receiverId === 'me'
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const sentMessages = ALL_MESSAGES.filter(m => m.senderId === agent?.personaKey || m.senderId === agent?.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

    sendMessage(newMessage.recipient, newMessage.title, newMessage.content);

    setNewMessage({ recipient: '', title: '', content: '' });
    setIsComposeOpen(false);
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
          <CardHeader className="border-b border-border">
            <div className="space-y-2">
              <CardTitle className="text-base">{selectedMessage.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>발신: {selectedMessage.senderName} ({selectedMessage.senderDepartment})</span>
                </div>
                <span>|</span>
                <span>{format(new Date(selectedMessage.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none mb-6">
              <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
            </div>

            <div className="flex gap-2 pt-4 border-t border-border">
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
      <Card className="card-gov pb-12">
        <Tabs defaultValue="received">
          <CardHeader>
            <div className="flex items-center justify-between">
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 max-w-full sm:max-w-xs">
                <TabsTrigger value="received" className="gap-2">
                  <Inbox className="w-4 h-4" />
                  받은 쪽지
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="sent" className="gap-2">
                  <Send className="w-4 h-4" />
                  보낸 쪽지
                </TabsTrigger>
              </TabsList>

              <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-2">
                    <Send className="w-4 h-4" />
                    쪽지 쓰기
                  </Button>
                </DialogTrigger>
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
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsComposeOpen(false)}>취소</Button>
                    <Button onClick={handleSendMessage}>발송</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>

          <CardContent>
            <TabsContent value="received" className="mt-0">
              <div className="border border-border rounded-sm overflow-hidden">
                {/* Desktop Table Header */}
                <div className="hidden md:grid table-header-gov grid-cols-12 gap-2 p-3">
                  <div className="col-span-2">발신자</div>
                  <div className="col-span-7">제목</div>
                  <div className="col-span-3 text-center">수신일</div>
                </div>

                {receivedMessages.length > 0 ? (
                  receivedMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`
                        border-t border-border cursor-pointer transition-colors
                        ${!message.isRead ? 'bg-accent/30' : 'hover:bg-accent/50'}
                      `}
                      onClick={() => setSelectedMessage(message)}
                    >
                      {/* Mobile Card Layout */}
                      <div className="md:hidden p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {!message.isRead && <Badge className="bg-primary text-xs">NEW</Badge>}
                              <span className={`text-sm ${!message.isRead ? 'font-medium' : ''}`}>
                                {message.title}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {message.senderName} ({message.senderDepartment})
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                        </div>
                      </div>

                      {/* Desktop Grid Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-2 py-2 px-3 items-center">
                        <div className="col-span-2 text-sm">
                          {message.senderName}({message.senderDepartment})
                        </div>
                        <div className="col-span-7 flex items-center gap-2">
                          {!message.isRead && <Badge className="bg-primary text-[10px] px-1 h-4">NEW</Badge>}
                          <span className={`truncate text-sm ${!message.isRead ? 'font-medium' : ''}`}>
                            {message.title}
                          </span>
                        </div>
                        <div className="col-span-3 text-center text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), 'yyyy.MM.dd', { locale: ko })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    받은 쪽지가 없습니다.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sent" className="mt-0">
              <div className="border border-border rounded-sm overflow-hidden">
                {/* Desktop Table Header */}
                <div className="hidden md:grid table-header-gov grid-cols-12 gap-2 p-3">
                  <div className="col-span-2">수신자</div>
                  <div className="col-span-7">제목</div>
                  <div className="col-span-3 text-center">발신일</div>
                </div>

                {sentMessages.length > 0 ? (
                  sentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="border-t border-border cursor-pointer transition-colors hover:bg-accent/50"
                      onClick={() => setSelectedMessage(message)}
                    >
                      {/* Mobile Card Layout */}
                      <div className="md:hidden p-4 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="text-sm font-medium mb-1">
                              {message.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              수신: {getPersonaName(message.receiverId)}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), 'yyyy.MM.dd HH:mm', { locale: ko })}
                        </div>
                      </div>

                      {/* Desktop Grid Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-2 py-2 px-3 items-center">
                        <div className="col-span-2 text-sm">
                          {getPersonaName(message.receiverId)}
                        </div>
                        <div className="col-span-7 flex items-center">
                          <span className="truncate text-sm">{message.title}</span>
                        </div>
                        <div className="col-span-3 text-center text-xs text-muted-foreground">
                          {format(new Date(message.createdAt), 'yyyy.MM.dd', { locale: ko })}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    보낸 쪽지가 없습니다.
                  </div>
                )}
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </MainLayout>
  );
}

export default MessagesPage;

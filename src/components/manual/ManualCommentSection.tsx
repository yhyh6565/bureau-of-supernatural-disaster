import React, { useState, useEffect } from 'react';
import { ManualComment, DEFAULT_MANUAL_COMMENTS } from '@/data/global/manualComments';
import { ManualStorage } from '@/utils/manualStorage';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, Trash2, CornerDownRight, MessageCircle, User } from 'lucide-react';

interface ManualCommentSectionProps {
    manualId: string;
}

export const ManualCommentSection: React.FC<ManualCommentSectionProps> = ({ manualId }) => {
    const { agent } = useAuth();
    const [comments, setComments] = useState<ManualComment[]>([]);
    const [newCommentText, setNewCommentText] = useState('');
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');

    const loadComments = () => {
        const defaultComments = DEFAULT_MANUAL_COMMENTS.filter(c => c.manualId === manualId);
        const sessionComments = ManualStorage.getSessionComments(manualId);

        // Merge all
        const all = [...defaultComments, ...sessionComments];
        setComments(all);
    };

    useEffect(() => {
        loadComments();
    }, [manualId]);

    const handleSubmit = (parentId?: string) => {
        const text = parentId ? replyText : newCommentText;
        if (!text.trim() || !agent) return;

        const newComment = ManualStorage.saveSessionComment({
            manualId,
            authorName: agent.name,
            authorRank: agent.rank,
            content: text.trim(),
            parentId
        });

        if (newComment) {
            if (parentId) {
                setReplyText('');
                setReplyingTo(null);
            } else {
                setNewCommentText('');
            }
            loadComments();
        }
    };

    const handleDelete = (id: string) => {
        ManualStorage.removeSessionComment(id);
        loadComments();
    };

    // Organize into threads (Parent -> Children)
    const rootComments = comments.filter(c => !c.parentId).sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const getReplies = (parentId: string) => {
        return comments.filter(c => c.parentId === parentId).sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
    };

    const CommentItem = ({ comment, isReply = false }: { comment: ManualComment, isReply?: boolean }) => {
        const isSession = !DEFAULT_MANUAL_COMMENTS.find(d => d.id === comment.id);
        const replies = getReplies(comment.id);
        const isReplying = replyingTo === comment.id;

        return (
            <div className={`group ${isReply ? 'mt-3 ml-12' : 'border-b last:border-0'}`}>
                <div className={`p-4 flex gap-3 ${isReply ? 'bg-slate-50/50 rounded-lg' : ''} ${isSession ? 'bg-yellow-50/30' : ''}`}>
                    <Avatar className="w-8 h-8 border">
                        <AvatarFallback className={isSession ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-700 text-xs'}>
                            {comment.authorName[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-sm">
                                    {comment.authorName}
                                </span>
                                <span className="text-xs px-1.5 py-0.5 bg-slate-200 rounded text-slate-600 font-mono">
                                    {comment.authorRank || '요원'}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!isReply && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 px-2 text-xs text-muted-foreground hover:text-blue-600"
                                        onClick={() => setReplyingTo(isReplying ? null : comment.id)}
                                    >
                                        <MessageCircle className="w-3.5 h-3.5 mr-1" />
                                        답글
                                    </Button>
                                )}
                                {isSession && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-muted-foreground hover:text-red-500"
                                        onClick={() => handleDelete(comment.id)}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm">
                            {comment.content}
                        </p>
                    </div>
                </div>

                {/* Reply Input */}
                {isReplying && (
                    <div className="ml-12 mr-4 mb-4 p-3 bg-slate-50 rounded border flex gap-3 animate-in fade-in slide-in-from-top-1">
                        <CornerDownRight className="w-4 h-4 text-muted-foreground mt-2" />
                        <div className="flex-1">
                            <Textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`@${comment.authorName} 님에게 답글 작성...`}
                                className="min-h-[60px] resize-none text-sm bg-white mb-2"
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setReplyingTo(null)}>취소</Button>
                                <Button size="sm" className="h-7 text-xs bg-slate-800" onClick={() => handleSubmit(comment.id)}>등록</Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recursive Replies (Only 1 level deep usually, but supports structure) */}
                {replies.length > 0 && (
                    <div className="pb-4 pr-4">
                        {replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} isReply={true} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <Card className="mt-8 border-t-4 border-t-slate-500 shadow-sm bg-slate-50/50">
            <CardHeader className="pb-3 border-b bg-white">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-slate-600" />
                    <CardTitle className="text-lg font-bold text-slate-800">
                        현장 운용 기록 & 코멘트
                    </CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                    해당 작전과 관련된 특이사항 및 노하우가 기록되어 있습니다.
                </p>
            </CardHeader>
            <CardContent className="p-0">
                <div className="bg-white">
                    {rootComments.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            등록된 코멘트가 없습니다.
                        </div>
                    ) : (
                        rootComments.map((comment) => (
                            <CommentItem key={comment.id} comment={comment} />
                        ))
                    )}
                </div>

                {/* Main Input Area */}
                <div className="p-4 bg-slate-50 border-t">
                    <div className="flex gap-3">
                        <Avatar className="w-10 h-10 hidden md:block">
                            <AvatarFallback className="bg-slate-200">
                                <User className="w-5 h-5 text-slate-500" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <Textarea
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder="작전 수행 중 특이사항이나 후배들을 위한 조언을 남겨주세요."
                                className="min-h-[80px] resize-none text-sm bg-white focus:bg-white transition-colors shadow-sm"
                            />
                            <div className="flex justify-end mt-2">
                                <Button
                                    className="h-9 px-6 bg-slate-800 hover:bg-slate-700 gap-2"
                                    onClick={() => handleSubmit()}
                                    disabled={!agent || !newCommentText.trim()}
                                >
                                    <Send className="w-4 h-4" />
                                    <span>등록</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

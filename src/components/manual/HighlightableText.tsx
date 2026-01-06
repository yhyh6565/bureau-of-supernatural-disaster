import React, { useState, useRef, useEffect } from 'react';
import { Highlight, ManualStorage } from '@/utils/manualStorage';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Highlighter, PenLine, Trash2, X } from 'lucide-react';

interface HighlightableTextProps {
    manualId: string;
    sectionId: string;
    text: string;
    className?: string; // Additional classes for the container
}

export const HighlightableText: React.FC<HighlightableTextProps> = ({ manualId, sectionId, text, className = '' }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [selectionMenu, setSelectionMenu] = useState<{ x: number; y: number; text: string; start: number; end: number } | null>(null);
    const [activeNote, setActiveNote] = useState<{ id: string; note: string; x: number; y: number } | null>(null);

    // Load highlights on mount
    useEffect(() => {
        const loadHighlights = () => {
            const all = ManualStorage.getHighlights(manualId);
            setHighlights(all.filter(h => h.sectionId === sectionId));
        };
        loadHighlights();

        // Listen for storage changes (if multiple tabs/components update)
        window.addEventListener('storage', loadHighlights);
        return () => window.removeEventListener('storage', loadHighlights);
    }, [manualId, sectionId]);

    const handleMouseUp = () => {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            setSelectionMenu(null);
            return;
        }

        const range = selection.getRangeAt(0);
        const container = containerRef.current;
        if (!container || !container.contains(range.commonAncestorContainer)) {
            setSelectionMenu(null);
            return;
        }

        // Calculate offset relative to the plain text is tricky because of spans.
        // Simplified approach: Only allow highlighting if the selection is within a SINGLE text node that is part of our render.
        // OR: We reconstruct the plain text offset.
        // Given complexity, let's try to find the start/end in the *original text*.

        // For accurate offsets, we need to traverse the DOM and map it back to the text string.
        // This is complex. 
        // fallback: save the *selected text* and search for it? No, duplicates issue.

        // Let's rely on the fact that we render the text. 
        // We can get the text content of the container up to the selection start?

        const preSelectionRange = range.cloneRange();
        preSelectionRange.selectNodeContents(container);
        preSelectionRange.setEnd(range.startContainer, range.startOffset);
        const start = preSelectionRange.toString().length;
        const selectedText = selection.toString();
        const end = start + selectedText.length;

        // Validating bounds
        if (start < 0 || end > text.length) return;

        const rect = range.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        setSelectionMenu({
            x: rect.left + rect.width / 2 - containerRect.left, // Relative to container? No, fixed/absolute overlay.
            // Actually better to use fixed, but let's try absolute to container.
            y: rect.top - containerRect.top - 40,
            text: selectedText,
            start,
            end
        });
    };

    const addHighlight = (withNote: boolean = false) => {
        if (!selectionMenu) return;

        const newHighlight = ManualStorage.saveHighlight(manualId, {
            manualId,
            sectionId,
            text: selectionMenu.text,
            startOffset: selectionMenu.start,
            endOffset: selectionMenu.end,
            color: 'yellow',
            note: ''
        });

        if (newHighlight) {
            setHighlights(prev => [...prev, newHighlight]);
            setSelectionMenu(null);

            // Clear selection
            window.getSelection()?.removeAllRanges();

            if (withNote) {
                // Open note editor immediately
                // We need coordinates for the note editor. Re-use selection menu coordinates or finding the span?
                // For simplicity, just use the selection coordinates.
                setActiveNote({
                    id: newHighlight.id,
                    note: '',
                    x: selectionMenu.x,
                    y: selectionMenu.y + 40
                });
            }
        }
    };

    const removeHighlight = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        ManualStorage.removeHighlight(id);
        setHighlights(prev => prev.filter(h => h.id !== id));
        setActiveNote(null);
    };

    const saveNote = (id: string, note: string) => {
        ManualStorage.updateHighlightNote(id, note);
        setHighlights(prev => prev.map(h => h.id === id ? { ...h, note } : h));
        setActiveNote(null);
    };

    // Rendering: Split text by highlights
    // We need to handle overlapping highlights? For MVP, assume no overlaps or simple layering.
    // 1. Sort highlights by startOffset.
    // 2. Build chunks.

    // Sort
    const sortedHighlights = [...highlights].sort((a, b) => a.startOffset - b.startOffset);

    // Flatten to a list of boundaries
    // Current limitation: NO OVERLAPS supported for simplicity. 
    // If a new highlight overlaps, we might just ignore it or merge? 
    // DataManager logic handled append, here we just render. 
    // If overlaps exist, simplistic rendering might break. 
    // Let's assume standard behavior: latest on top or just sequential chunks.

    const chunks: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedHighlights.forEach(h => {
        if (h.startOffset < lastIndex) return; // Skip overlapping for now

        // Text before highlight
        if (h.startOffset > lastIndex) {
            chunks.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex, h.startOffset)}</span>);
        }

        // Highlighted text
        chunks.push(
            <span
                key={h.id}
                className="bg-yellow-200/50 dark:bg-yellow-900/50 cursor-pointer hover:bg-yellow-300/50 transition-colors rounded px-0.5 relative group"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent new selection triggering
                    // Open note
                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    const containerRect = containerRef.current?.getBoundingClientRect();
                    if (containerRect) {
                        setActiveNote({
                            id: h.id,
                            note: h.note || '',
                            x: rect.left + rect.width / 2 - containerRect.left,
                            y: rect.bottom - containerRect.top
                        });
                    }
                }}
            >
                {text.substring(h.startOffset, h.endOffset)}
                {/* Minimal indicator if note exists */}
                {h.note && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full" />}
            </span>
        );

        lastIndex = h.endOffset;
    });

    // Remaining text
    if (lastIndex < text.length) {
        chunks.push(<span key={`text-${lastIndex}`}>{text.substring(lastIndex)}</span>);
    }

    return (
        <div className={`relative ${className}`} ref={containerRef} onMouseUp={handleMouseUp}>
            {chunks}

            {/* Selection Menu (Toolbar) */}
            {selectionMenu && (
                <div
                    className="absolute z-50 flex items-center gap-1 p-1 bg-white dark:bg-zinc-800 border shadow-lg rounded-full animate-in fade-in zoom-in duration-200"
                    style={{ left: selectionMenu.x, top: selectionMenu.y, transform: 'translateX(-50%)' }}
                >
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/30" onClick={() => addHighlight(false)}>
                        <Highlighter className="w-4 h-4 text-yellow-500" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30" onClick={() => addHighlight(true)}>
                        <PenLine className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Separator orientation="vertical" className="h-4" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setSelectionMenu(null)}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Note Editor */}
            {activeNote && (
                <div
                    className="absolute z-50 w-64 p-3 bg-yellow-50 dark:bg-zinc-800 border border-yellow-200 dark:border-zinc-700 shadow-xl rounded-lg animate-in fade-in slide-in-from-bottom-2"
                    style={{ left: activeNote.x, top: activeNote.y, transform: 'translate(-50%, 10px)' }}
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-muted-foreground">메모</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:bg-destructive/10" onClick={(e) => removeHighlight(activeNote.id, e)}>
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                    <Textarea
                        value={activeNote.note}
                        onChange={(e) => setActiveNote({ ...activeNote, note: e.target.value })}
                        placeholder="메모를 입력하세요..."
                        className="min-h-[80px] text-xs bg-white dark:bg-zinc-900 mb-2 resize-none"
                        autoFocus
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setActiveNote(null)}>닫기</Button>
                        <Button size="sm" className="h-7 text-xs" onClick={() => saveNote(activeNote.id, activeNote.note)}>저장</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

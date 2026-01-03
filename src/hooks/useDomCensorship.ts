import { useRef, useEffect } from 'react';

export function useDomCensorship(isActive: boolean, duration: number, onComplete: () => void) {
    const requestRef = useRef<number>();

    useEffect(() => {
        if (!isActive) return;

        const startTime = Date.now();

        // 1. Collect all valid text nodes
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
            acceptNode: (node) => {
                // Skip script/style tags and empty nodes
                if (node.parentElement?.tagName === 'SCRIPT' || node.parentElement?.tagName === 'STYLE') return NodeFilter.FILTER_REJECT;
                if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        });

        const textNodes: Text[] = [];
        while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

        // 2. Animate
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Heuristic: Exponential acceleration (Slow start, Fast end)
            // Power of 5 curve
            const corruptionProbability = Math.pow(progress, 5);

            textNodes.forEach(node => {
                const original = node.nodeValue || '';
                // Skip if fully corrupted
                if (!/[^ \n■]/.test(original)) return;

                const chars = original.split('');
                let modified = false;
                for (let i = 0; i < chars.length; i++) {
                    if (chars[i] !== '■' && chars[i] !== ' ' && chars[i] !== '\n') {
                        if (Math.random() < corruptionProbability) {
                            chars[i] = '■';
                            modified = true;
                        }
                    }
                }

                if (modified) {
                    node.nodeValue = chars.join('');
                }

                // Force full corruption at the very end (last 2%)
                if (progress > 0.98) {
                    node.nodeValue = node.nodeValue?.replace(/[^ \n■]/g, '■') || '';
                }
            });

            if (elapsed < duration) {
                requestRef.current = requestAnimationFrame(animate);
            } else {
                onComplete();
            }
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isActive, duration, onComplete]);
}


import { useState, useEffect, useCallback } from 'react';

type Deserializer<T> = (data: any) => T;

export function usePersistentState<T>(
    key: string,
    initialValue: T,
    deserializer?: Deserializer<T>
): [T, (value: T | ((val: T) => T)) => void] {
    // Lazy initialization
    const [state, setState] = useState<T>(() => {
        try {
            const stored = sessionStorage.getItem(key);
            if (stored) {
                const parsed = JSON.parse(stored);
                return deserializer ? deserializer(parsed) : parsed;
            }
        } catch (error) {
            console.error(`Error loading state from sessionStorage key "${key}":`, error);
        }
        return initialValue;
    });

    // Update sessionStorage whenever state changes
    useEffect(() => {
        try {
            if (state === undefined) {
                sessionStorage.removeItem(key);
            } else {
                sessionStorage.setItem(key, JSON.stringify(state));
            }
        } catch (error) {
            console.error(`Error saving state to sessionStorage key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState];
}

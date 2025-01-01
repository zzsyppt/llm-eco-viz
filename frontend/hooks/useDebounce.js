// hooks/useDebounce.js
import { useState, useEffect } from 'react';

/**
 * useDebounce Hook
 * @param {any} value - 需要防抖的值
 * @param {number} delay - 防抖延迟时间（毫秒）
 * @returns {any} - 防抖后的值
 */
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // 清除定时器
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Rankings() {
    const router = useRouter();

    useEffect(() => {
        // TODO: 替换为实际的外部地址
        window.location.href = 'https://example.com/rankings';
    }, []);

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh' 
        }}>
            正在跳转到排行榜页面...
        </div>
    );
}
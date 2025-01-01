import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Rankings() {
    const router = useRouter();

    useEffect(() => {
        window.location.href = 'http://127.0.0.1:5000/leaderboard/';
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
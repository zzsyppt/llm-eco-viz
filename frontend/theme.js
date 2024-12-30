// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1a73e8', // Google 蓝色
        },
        secondary: {
            main: '#8e24aa', // 紫色
        },
        background: {
            default: '#ffffff', // 白色背景
        },
    },
    typography: {
        fontFamily: 'HarmonyOS Sans SC, Roboto, Arial, sans-serif',
    },
});

export default theme;

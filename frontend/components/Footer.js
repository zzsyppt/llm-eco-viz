// components/Footer.js
import React from 'react';
import { Typography, Box } from '@mui/material';

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                        ? theme.palette.grey[200]
                        : theme.palette.grey[800],
                borderTop: '1px solid #e0e0e0', // 轻微的顶部边框
            }}
        >
            <Typography variant="body2" color="text.secondary" align="center">
                {'© '}
                ECNU DaSE Unawakening {new Date().getFullYear()}
                {'.'}
            </Typography>
        </Box>
    );
};

export default Footer;

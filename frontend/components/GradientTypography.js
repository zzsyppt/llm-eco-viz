// components/GradientTypography.js
import React from 'react';
import { Typography } from '@mui/material';
import { styled } from '@mui/system';

const GradientText = styled(Typography)(({ theme }) => ({
    background: 'linear-gradient(90deg, #1a73e8, #8e24aa)', // 蓝色到紫色渐变
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
}));

const GradientTypography = (props) => {
    return <GradientText {...props} />;
};

export default GradientTypography;

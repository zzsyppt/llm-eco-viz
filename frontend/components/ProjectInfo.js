import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Paper, 
    Typography, 
    Avatar, 
    Chip, 
    Link,
    Grid,
    Divider,
    Skeleton,
    IconButton,
    Tooltip
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import ForkRightIcon from '@mui/icons-material/ForkRight';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import GavelIcon from '@mui/icons-material/Gavel';
import GitHubIcon from '@mui/icons-material/GitHub';

const ProjectInfo = ({ project }) => {
    const [repoInfo, setRepoInfo] = useState(null);
    const [hfInfo, setHfInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRepoInfo = async () => {
            try {
                // 获取 GitHub 仓库信息
                const response = await fetch(`https://api.github.com/repos/${project}`, {
                    headers: {
                        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    setRepoInfo(data);
                    
                    // 尝试获取 Hugging Face 信息
                    try {
                        const hfResponse = await fetch(`https://huggingface.co/api/models/${project}`);
                        if (hfResponse.ok) {
                            const hfData = await hfResponse.json();
                            setHfInfo(hfData);
                        }
                    } catch (error) {
                        console.log('No Hugging Face model found:', error);
                    }
                } else {
                    console.error('Failed to fetch repo info:', response.status);
                }
            } catch (error) {
                console.error('Error fetching repo info:', error);
            } finally {
                setLoading(false);
            }
        };

        if (project) {
            fetchRepoInfo();
        }
    }, [project]);

    if (loading) {
        return (
            <Box sx={{ p: 2 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Skeleton variant="text" sx={{ mt: 1 }} width="60%" />
                <Skeleton variant="text" width="40%" />
            </Box>
        );
    }

    if (!repoInfo) {
        return (
            <Typography color="error">
                无法加载仓库信息
            </Typography>
        );
    }

    return (
        <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                    src={repoInfo.owner.avatar_url}
                    alt={repoInfo.owner.login}
                    sx={{ 
                        width: 40, 
                        height: 40,
                        mr: 2,
                        border: '2px solid',
                        borderColor: 'primary.main'
                    }}
                />
                <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Link
                            href={repoInfo.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                textDecoration: 'none',
                                color: 'primary.main',
                                '&:hover': {
                                    textDecoration: 'underline'
                                }
                            }}
                        >
                            <Typography variant="h6" sx={{ fontWeight: 500 }}>
                                {repoInfo.name}
                            </Typography>
                        </Link>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="GitHub">
                                <IconButton 
                                    size="small" 
                                    href={repoInfo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <GitHubIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            {hfInfo && (
                                <Tooltip title="Hugging Face">
                                    <IconButton 
                                        size="small"
                                        href={`https://huggingface.co/${project}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <Box 
                                            component="img" 
                                            src="/hf-logo.svg" 
                                            sx={{ width: 20, height: 20 }}
                                        />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                        {repoInfo.description}
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid item xs={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StarIcon sx={{ color: 'warning.main', mr: 1 }} />
                        <Typography>
                            {repoInfo.stargazers_count.toLocaleString()} Stars
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <ForkRightIcon sx={{ color: 'success.main', mr: 1 }} />
                        <Typography>
                            {repoInfo.forks_count.toLocaleString()} Forks
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountTreeIcon sx={{ color: 'info.main', mr: 1 }} />
                        <Typography>
                            {repoInfo.open_issues_count.toLocaleString()} Issues
                        </Typography>
                    </Box>
                </Grid>
                <Grid item xs={6} md={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <GavelIcon sx={{ color: 'secondary.main', mr: 1 }} />
                        <Typography>
                            {repoInfo.license?.name || 'No License'}
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {repoInfo.topics.map((topic) => (
                    <Chip
                        key={topic}
                        label={topic}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                            color: 'primary.main',
                            '&:hover': {
                                bgcolor: 'rgba(25, 118, 210, 0.12)'
                            }
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
};

export default ProjectInfo; 
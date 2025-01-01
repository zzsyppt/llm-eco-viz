import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    TextField, 
    Button,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Fade,
    Grid
} from '@mui/material';
import { useRouter } from 'next/router';
import useDebounce from '../hooks/useDebounce';
import { getDeepestProjects } from '../utils/helpers';
import { ProjectContext } from '../contexts/ProjectContext';

const Home = () => {
    const { selectedProjects, setSelectedProjects } = useContext(ProjectContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [availableProjects, setAvailableProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const router = useRouter();
    const dropdownRef = useRef(null);
    const listRef = useRef(null);

    // 获取所有项目
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/projects/search?q=');
                if (!response.ok) throw new Error('Failed to fetch projects');
                const data = await response.json();
                setAvailableProjects(data.map(project => project.full_name));
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        fetchProjects();
    }, []);

    // 过滤项目
    useEffect(() => {
        if (debouncedSearchTerm === '') {
            setFilteredProjects([]);
            setShowDropdown(false);
            setHighlightedIndex(-1);
        } else {
            const searchProjects = async () => {
                try {
                    const response = await fetch(`/api/projects/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
                    if (!response.ok) throw new Error('Failed to search projects');
                    const data = await response.json();
                    const projectNames = data.map(project => project.full_name);
                    setFilteredProjects(projectNames);
                    setShowDropdown(projectNames.length > 0);
                    setHighlightedIndex(-1);
                } catch (error) {
                    console.error('Error searching projects:', error);
                }
            };

            searchProjects();
        }
    }, [debouncedSearchTerm]);

    // 处理点击外部关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 自动滚动到高亮项
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const listItems = listRef.current.querySelectorAll('li');
            if (listItems[highlightedIndex]) {
                listItems[highlightedIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    }, [highlightedIndex]);

    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        setSearchTerm(project.split('/').pop());
        setShowDropdown(false);
        setHighlightedIndex(-1);
    };

    const handleAnalyze = () => {
        if (!selectedProject) {
            alert('请选择一个项目');
            return;
        }
        setSelectedProjects([selectedProject]);
        router.push('/dashboard');
    };

    const handleKeyDown = (e) => {
        if (!showDropdown) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev < filteredProjects.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filteredProjects.length) {
                handleProjectSelect(filteredProjects[highlightedIndex]);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setShowDropdown(false);
            setHighlightedIndex(-1);
        }
    };

    return (
        <Box 
            sx={{ 
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pt: '64px',
                bgcolor: '#f8f9fa'
            }}
        >
            <Container maxWidth="md">
                <Box 
                    sx={{ 
                        textAlign: 'center',
                        py: 8
                    }}
                >
                    {/* 标题 */}
                    <Typography 
                        variant="h2" 
                        component="h1"
                        sx={{ 
                            fontWeight: 600,
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 0 20px rgba(33, 150, 243, 0.1)',
                            mb: 2
                        }}
                    >
                        LLM Ecosystem Visualization
                    </Typography>

                    {/* 副标题 */}
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            mb: 2,
                            color: 'text.primary',
                            fontWeight: 500
                        }}
                    >
                        Data-OpenDigger
                    </Typography>

                    {/* 项目介绍 */}
                    <Typography 
                        variant="body1"
                        sx={{ 
                            mb: 6,
                            color: 'text.secondary',
                            maxWidth: '800px',
                            mx: 'auto',
                            lineHeight: 1.8,
                            fontSize: '1.1rem'
                        }}
                    >
                        本项目致力于构建一个开源AI大模型生态分析与可视化应用。通过深入分析GitHub数据，我们提供了全方位的开源项目洞察，
                        包括贡献者网络分析、影响力评估、活跃度追踪等多个维度。帮助开发者更好地理解AI开源生态系统的发展动态。
                    </Typography>

                    {/* 搜索框和下拉列表 */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            maxWidth: '800px',
                            mx: 'auto',
                            borderRadius: 5,
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                            position: 'relative'
                        }}
                        ref={dropdownRef}
                    >
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ position: 'relative', flex: 1 }}>
                                <TextField
                                    fullWidth
                                    placeholder="搜索并选择项目（例如：tvm）"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setSelectedProject('');
                                    }}
                                    onKeyDown={handleKeyDown}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            bgcolor: '#f8f9fa'
                                        }
                                    }}
                                />
                                <Fade in={showDropdown}>
                                    <Paper
                                        elevation={4}
                                        sx={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            maxHeight: 300,
                                            overflowY: 'auto',
                                            zIndex: 1,
                                            mt: 1,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <List ref={listRef}>
                                            {filteredProjects.map((project, index) => {
                                                const projectName = project.split('/').pop();
                                                const isHighlighted = index === highlightedIndex;

                                                return (
                                                    <ListItem
                                                        key={project}
                                                        disablePadding
                                                        selected={isHighlighted}
                                                        sx={{
                                                            backgroundColor: isHighlighted ? 'action.hover' : 'transparent',
                                                        }}
                                                    >
                                                        <ListItemButton onClick={() => handleProjectSelect(project)}>
                                                            <ListItemText
                                                                primary={project}
                                                                secondary={projectName}
                                                                primaryTypographyProps={{
                                                                    variant: 'body2',
                                                                    sx: { fontWeight: 500 }
                                                                }}
                                                            />
                                                        </ListItemButton>
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Paper>
                                </Fade>
                            </Box>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleAnalyze}
                                disabled={!selectedProject}
                                sx={{
                                    minWidth: '120px',
                                    borderRadius: 2,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #1976D2 30%, #21CBF3 90%)',
                                    },
                                    '&.Mui-disabled': {
                                        background: 'rgba(0, 0, 0, 0.12)'
                                    }
                                }}
                            >
                                分析
                            </Button>
                        </Box>
                    </Paper>
                </Box>

                {/* 功能介绍 */}
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            mb: 4,
                            fontWeight: 600,
                            color: 'text.primary'
                        }}
                    >
                        项目特点
                    </Typography>
                    <Typography 
                        component="div"
                        sx={{ 
                            color: 'text.secondary',
                            maxWidth: '800px',
                            mx: 'auto',
                            lineHeight: 1.8,
                            fontSize: '1.1rem',
                            textAlign: 'left'
                        }}
                    >
                        <Box component="ul" sx={{ pl: 2 }}>
                            <Box component="li" sx={{ mb: 2 }}>
                                <strong>数据分析：</strong> 基于 OpenDigger 提供的开源数据，深入分析项目发展趋势和贡献者行为。
                            </Box>
                            <Box component="li" sx={{ mb: 2 }}>
                                <strong>生态洞察：</strong> 通过可视化展示项目间的关联性，帮助理解 AI 开源生态系统的发展脉络。
                            </Box>
                            <Box component="li" sx={{ mb: 2 }}>
                                <strong>影响力评估：</strong> 结合多维度指标，科学评估项目在生态中的影响力和发展潜力。
                            </Box>
                            <Box component="li">
                                <strong>实时追踪：</strong> 持续监控项目活跃度，及时反映社区动态和发展趋势。
                            </Box>
                        </Box>
                    </Typography>
                </Box>

                {/* 技术栈 */}
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            mb: 4,
                            fontWeight: 600,
                            color: 'text.primary'
                        }}
                    >
                        技术栈
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>前端技术</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Next.js, React, Material-UI, ECharts
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>数据分析</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    OpenDigger, Python, Pandas
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>API 集成</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    GitHub API, Hugging Face API
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* 团队介绍 */}
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            mb: 4,
                            fontWeight: 600,
                            color: 'text.primary'
                        }}
                    >
                        团队成员
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>@zzsyppt</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Hugging Face 数据获取与处理；大模型生态网络制作；影响力算法设计；网页应用制作
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>@JettyCoffee</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    GitHub 数据获取与处理；大模型数据大屏制作；影响力算法设计；网页应用制作
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default Home;
import React, { useState, useEffect } from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';

const METRIC_TYPES = {
    'openrank': 'OpenRank',
    'activity': '活跃度',
    'stars': '星标数',
    'technical_fork': '技术分支数',
    'attention': '关注度',
    'new_contributors': '新贡献者'
};

export default function LeaderBoard() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [metricType, setMetricType] = useState('openrank');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/leaderboard?metric=${metricType}&limit=${rowsPerPage}`);
                if (!response.ok) throw new Error('Failed to fetch leaderboard data');
                const result = await response.json();
                setData(result);
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [metricType, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleMetricTypeChange = (event) => {
        setMetricType(event.target.value);
        setPage(0);
    };

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography>加载中...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>指标类型</InputLabel>
                    <Select
                        value={metricType}
                        label="指标类型"
                        onChange={handleMetricTypeChange}
                    >
                        {Object.entries(METRIC_TYPES).map(([value, label]) => (
                            <MenuItem key={value} value={value}>{label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>排名</TableCell>
                            <TableCell>项目</TableCell>
                            <TableCell align="right">{METRIC_TYPES[metricType]}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                            <TableRow key={row.project}>
                                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                <TableCell>{row.project}</TableCell>
                                <TableCell align="right">{row.value.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Box>
    );
} 
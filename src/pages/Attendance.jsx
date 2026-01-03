import React, { useState, useEffect } from 'react';
import { Box, Paper, Grid, Typography, Button, Chip, CircularProgress, Alert } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI } from '../utils/api';

const Attendance = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [timer, setTimer] = useState(0);
    const [history, setHistory] = useState([]);
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [error, setError] = useState(null);

    // Fetch attendance data
    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Get today's attendance
                const today = dayjs().format('YYYY-MM-DD');
                const attendanceData = await attendanceAPI.getMyAttendance({
                    startDate: today,
                    endDate: today,
                });
                
                if (attendanceData && attendanceData.length > 0) {
                    const todayRecord = attendanceData[0];
                    setTodayAttendance(todayRecord);
                    
                    // If checked in but not checked out, start timer
                    if (todayRecord.checkInTime && !todayRecord.checkOutTime) {
                        setIsCheckedIn(true);
                        const checkInTime = dayjs(todayRecord.checkInTime);
                        const now = dayjs();
                        const diffSeconds = now.diff(checkInTime, 'second');
                        setTimer(diffSeconds > 0 ? diffSeconds : 0);
                    } else {
                        setIsCheckedIn(false);
                        setTimer(0);
                    }
                } else {
                    setTodayAttendance(null);
                    setIsCheckedIn(false);
                    setTimer(0);
                }
                
                // Get attendance history (last 30 days)
                const thirtyDaysAgo = dayjs().subtract(30, 'days').format('YYYY-MM-DD');
                const historyData = await attendanceAPI.getMyAttendance({
                    startDate: thirtyDaysAgo,
                    endDate: dayjs().format('YYYY-MM-DD'),
                });
                
                if (historyData) {
                    setHistory(historyData.map((record, index) => ({
                        id: record.id || index,
                        date: dayjs(record.date).format('YYYY-MM-DD'),
                        checkIn: record.checkInTime ? dayjs(record.checkInTime).format('hh:mm A') : '-',
                        checkOut: record.checkOutTime ? dayjs(record.checkOutTime).format('hh:mm A') : '-',
                        workHours: record.duration ? `${Math.floor(record.duration / 3600)}h ${Math.floor((record.duration % 3600) / 60)}m` : '0h 0m',
                        status: record.checkInTime ? (record.checkOutTime ? 'PRESENT' : 'CHECKED_IN') : 'ABSENT',
                    })));
                }
            } catch (err) {
                setError(err.message || 'Failed to load attendance data');
                toast.error(err.message || 'Failed to load attendance');
            } finally {
                setLoading(false);
            }
        };
        
        if (user) {
            fetchAttendance();
        }
    }, [user]);

    // Function to refresh attendance data
    const fetchAttendance = async () => {
        try {
            setError(null);
            
            // Get today's attendance
            const today = dayjs().format('YYYY-MM-DD');
            const attendanceData = await attendanceAPI.getMyAttendance({
                startDate: today,
                endDate: today,
            });
            
            if (attendanceData && attendanceData.length > 0) {
                const todayRecord = attendanceData[0];
                setTodayAttendance(todayRecord);
                
                // If checked in but not checked out, start timer
                if (todayRecord.checkInTime && !todayRecord.checkOutTime) {
                    setIsCheckedIn(true);
                    const checkInTime = dayjs(todayRecord.checkInTime);
                    const now = dayjs();
                    const diffSeconds = now.diff(checkInTime, 'second');
                    setTimer(diffSeconds > 0 ? diffSeconds : 0);
                } else {
                    setIsCheckedIn(false);
                    setTimer(0);
                }
            } else {
                setTodayAttendance(null);
                setIsCheckedIn(false);
                setTimer(0);
            }
            
            // Get attendance history (last 30 days)
            const thirtyDaysAgo = dayjs().subtract(30, 'days').format('YYYY-MM-DD');
            const historyData = await attendanceAPI.getMyAttendance({
                startDate: thirtyDaysAgo,
                endDate: today,
            });
            
            if (historyData) {
                setHistory(historyData.map((record, index) => ({
                    id: record.id || index,
                    date: dayjs(record.date).format('YYYY-MM-DD'),
                    checkIn: record.checkInTime ? dayjs(record.checkInTime).format('hh:mm A') : '-',
                    checkOut: record.checkOutTime ? dayjs(record.checkOutTime).format('hh:mm A') : '-',
                    workHours: record.duration ? `${Math.floor(record.duration / 3600)}h ${Math.floor((record.duration % 3600) / 60)}m` : '0h 0m',
                    status: record.checkInTime ? (record.checkOutTime ? 'PRESENT' : 'CHECKED_IN') : 'ABSENT',
                })));
            }
        } catch (err) {
            console.error('Error fetching attendance:', err);
            setError(err.message || 'Failed to load attendance data');
        }
    };

    // Timer effect
    useEffect(() => {
        let interval;
        if (isCheckedIn) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isCheckedIn]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleCheckIn = async () => {
        try {
            setCheckingIn(true);
            const result = await attendanceAPI.checkIn();
            
            setIsCheckedIn(true);
            setTimer(0); // Start timer from 0
            setTodayAttendance(result);
            
            toast.success('Successfully Checked In at ' + dayjs().format('hh:mm A'));
            
            // Refresh attendance data
            await fetchAttendance();
        } catch (error) {
            console.error('Check-in error:', error);
            if (error.status === 409) {
                toast.error('You have already checked in today');
            } else {
                toast.error(error.message || 'Failed to check in');
            }
        } finally {
            setCheckingIn(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            setCheckingOut(true);
            const result = await attendanceAPI.checkOut();
            
            setIsCheckedIn(false);
            setTodayAttendance(result);
            
            toast.success('Successfully Checked Out at ' + dayjs().format('hh:mm A'));
            
            // Refresh attendance data
            await fetchAttendance();
        } catch (error) {
            console.error('Check-out error:', error);
            if (error.status === 404) {
                toast.error('Please check in first before checking out');
            } else if (error.status === 409) {
                toast.error('You have already checked out today');
            } else {
                toast.error(error.message || 'Failed to check out');
            }
        } finally {
            setCheckingOut(false);
        }
    };

    const columns = [
        { field: 'date', headerName: 'Date', flex: 1, minWidth: 120 },
        { field: 'checkIn', headerName: 'Check In', flex: 1, minWidth: 120 },
        { field: 'checkOut', headerName: 'Check Out', flex: 1, minWidth: 120 },
        { field: 'workHours', headerName: 'Work Hours', flex: 1, minWidth: 120 },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => {
                let color = 'default';
                if (params.value === 'PRESENT') color = 'success';
                if (params.value === 'ABSENT') color = 'error';
                if (params.value === 'CHECKED_IN') color = 'warning';
                return <Chip label={params.value} color={color} size="small" />;
            }
        },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {error && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}
            
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 4, textAlign: 'center', height: '100%' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Current Time
                        </Typography>
                        <Typography variant="h3" fontWeight="700" sx={{ mb: 2 }}>
                            {dayjs().format('hh:mm A')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {dayjs().format('dddd, D MMMM YYYY')}
                        </Typography>
                        {todayAttendance && (
                            <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #E5E7EB' }}>
                                <Typography variant="caption" color="text.secondary">Today's Status</Typography>
                                <Chip 
                                    label={todayAttendance.status || 'ABSENT'} 
                                    color={todayAttendance.status === 'PRESENT' ? 'success' : 'default'}
                                    sx={{ mt: 1 }}
                                />
                            </Box>
                        )}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 3 }}>
                        {isCheckedIn ? (
                            <>
                                <Typography variant="h6" color="primary">You are currently checked in</Typography>
                                <Typography variant="h2" sx={{ fontFamily: 'monospace' }}>
                                    {formatTime(timer)}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="large"
                                    startIcon={checkingOut ? <CircularProgress size={20} /> : <StopIcon />}
                                    onClick={handleCheckOut}
                                    disabled={checkingOut}
                                    sx={{ px: 4, py: 1.5, borderRadius: 50 }}
                                >
                                    {checkingOut ? 'Checking Out...' : 'Check Out'}
                                </Button>
                            </>
                        ) : (
                            <>
                                <Typography variant="h6" color="text.secondary">You are not checked in yet</Typography>
                                <Box sx={{ width: 120, height: 120, borderRadius: '50%', bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                    <AccessTimeIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                                </Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    startIcon={checkingIn ? <CircularProgress size={20} /> : <PlayArrowIcon />}
                                    onClick={handleCheckIn}
                                    disabled={checkingIn}
                                    sx={{ px: 5, py: 1.5, borderRadius: 50 }}
                                >
                                    {checkingIn ? 'Checking In...' : 'Check In'}
                                </Button>
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Attendance History (Last 30 Days)</Typography>
            <Paper sx={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={history}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 5 },
                        },
                    }}
                    pageSizeOptions={[5, 10]}
                    disableRowSelectionOnClick
                    sx={{ border: 'none' }}
                />
            </Paper>
        </Box>
    );
};

export default Attendance;

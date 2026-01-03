import React, { useState, useEffect } from 'react';
import { Box, Paper, Grid, Typography, Card, CardContent, Chip, CircularProgress, Alert } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI } from '../utils/api';
import { formatINRCompact } from '../utils/currency';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight="700" sx={{ mb: 0.5 }}>
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography variant="caption" color="text.secondary">
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                <Box
                    sx={{
                        bgcolor: `${color}.light`,
                        color: `${color}.main`,
                        borderRadius: 2,
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {icon}
                </Box>
            </Box>
        </CardContent>
    </Card>
);

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dashboardData, setDashboardData] = useState(null);

    const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                let data;
                if (isAdmin) {
                    data = await dashboardAPI.getAdminStats();
                } else {
                    data = await dashboardAPI.getEmployeeStats();
                }
                
                setDashboardData(data);
            } catch (err) {
                setError(err.message || 'Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isAdmin]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box>
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (isAdmin && dashboardData) {
        return (
            <Box>
                <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                    Dashboard Overview
                </Typography>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Total Employees"
                            value={dashboardData.totalEmployees || 0}
                            icon={<PeopleIcon sx={{ fontSize: 32 }} />}
                            color="primary"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Present Today"
                            value={dashboardData.employeesPresentToday || 0}
                            icon={<EventAvailableIcon sx={{ fontSize: 32 }} />}
                            color="success"
                            subtitle={`Out of ${dashboardData.totalEmployees || 0} employees`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Pending Leaves"
                            value={dashboardData.pendingLeaveCount || 0}
                            icon={<PendingActionsIcon sx={{ fontSize: 32 }} />}
                            color="warning"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Monthly Payroll"
                            value={formatINRCompact(dashboardData.payrollStats?.totalPaid || 0)}
                            icon={<CurrencyRupeeIcon sx={{ fontSize: 32 }} />}
                            color="info"
                            subtitle={`${dashboardData.payrollStats?.employeeCount || 0} employees`}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                                Attendance Trend (Last 7 Days)
                            </Typography>
                            {dashboardData.attendanceSummary && dashboardData.attendanceSummary.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={dashboardData.attendanceSummary.map(item => ({
                                        date: dayjs(item.date).format('MMM DD'),
                                        employees: item._count?.id || 0,
                                    }))}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="employees" stroke="#1976d2" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography color="text.secondary">No attendance data available</Typography>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                                Recent Activities
                            </Typography>
                            {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {dashboardData.recentActivities.slice(0, 5).map((activity, index) => (
                                        <Box key={index} sx={{ pb: 2, borderBottom: index < 4 ? '1px solid #E5E7EB' : 'none' }}>
                                            <Typography variant="body2" fontWeight="600">
                                                {activity.user?.firstName} {activity.user?.lastName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {activity.action} - {dayjs(activity.createdAt).format('MMM DD, hh:mm A')}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography color="text.secondary" variant="body2">
                                    No recent activities
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    // Employee Dashboard
    if (dashboardData) {
        return (
            <Box>
                <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                    Welcome back, {user?.firstName}!
                </Typography>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Present Days"
                            value={dashboardData.attendanceSummary?.presentDays || 0}
                            icon={<EventAvailableIcon sx={{ fontSize: 32 }} />}
                            color="success"
                            subtitle={`This month`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Absent Days"
                            value={dashboardData.attendanceSummary?.absentDays || 0}
                            icon={<PendingActionsIcon sx={{ fontSize: 32 }} />}
                            color="error"
                            subtitle={`This month`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Work Hours"
                            value={`${dashboardData.attendanceSummary?.totalWorkHours || 0}h`}
                            icon={<EventAvailableIcon sx={{ fontSize: 32 }} />}
                            color="info"
                            subtitle={`This month`}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <StatCard
                            title="Latest Salary"
                            value={dashboardData.payrollSummary ? formatINRCompact(dashboardData.payrollSummary.netSalary || 0) : 'N/A'}
                            icon={<CurrencyRupeeIcon sx={{ fontSize: 32 }} />}
                            color="primary"
                            subtitle={dashboardData.payrollSummary ? dayjs(dashboardData.payrollSummary.payableMonth).format('MMM YYYY') : 'No data'}
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                                Today's Status
                            </Typography>
                            {dashboardData.todayAttendance ? (
                                <Box>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">Check In</Typography>
                                            <Typography variant="h6">
                                                {dashboardData.todayAttendance.checkInTime
                                                    ? dayjs(dashboardData.todayAttendance.checkInTime).format('hh:mm A')
                                                    : 'Not checked in'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">Status</Typography>
                                            <Chip
                                                label={dashboardData.todayAttendance.status || 'ABSENT'}
                                                color={dashboardData.todayAttendance.status === 'PRESENT' ? 'success' : 'default'}
                                                sx={{ mt: 0.5 }}
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                            ) : (
                                <Typography color="text.secondary">No attendance record for today</Typography>
                            )}
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
                                Active Leave Requests
                            </Typography>
                            {dashboardData.activeLeaveRequests && dashboardData.activeLeaveRequests.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {dashboardData.activeLeaveRequests.slice(0, 3).map((leave, index) => (
                                        <Box key={index} sx={{ pb: 2, borderBottom: index < 2 ? '1px solid #E5E7EB' : 'none' }}>
                                            <Typography variant="body2" fontWeight="600">
                                                {dayjs(leave.startDate).format('MMM DD')} - {dayjs(leave.endDate).format('MMM DD')}
                                            </Typography>
                                            <Chip
                                                label={leave.status}
                                                size="small"
                                                color={leave.status === 'APPROVED' ? 'success' : 'warning'}
                                                sx={{ mt: 0.5 }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <Typography color="text.secondary" variant="body2">
                                    No active leave requests
                                </Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        );
    }

    return null;
};

export default Dashboard;


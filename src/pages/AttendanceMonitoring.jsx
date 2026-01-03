import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Paper, 
    Typography, 
    Grid, 
    Button, 
    Chip, 
    CircularProgress, 
    Alert,
    TextField,
    MenuItem,
    Card,
    CardContent,
    Avatar,
    Divider
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import { attendanceAPI, userAPI } from '../utils/api';

const AttendanceMonitoring = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [attendanceData, setAttendanceData] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [selectedEmployee, setSelectedEmployee] = useState('');
    const [stats, setStats] = useState({
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        lateToday: 0
    });

    // Check if user can monitor attendance (ADMIN or HR)
    const canMonitorAttendance = user && (user.role === 'ADMIN' || user.role === 'HR');

    useEffect(() => {
        if (canMonitorAttendance) {
            fetchEmployees();
            fetchAttendanceData();
        }
    }, [canMonitorAttendance, selectedDate, selectedEmployee]);

    const fetchEmployees = async () => {
        try {
            const employeeData = await userAPI.getAll();
            setEmployees(employeeData);
            setStats(prev => ({ ...prev, totalEmployees: employeeData.length }));
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to load employees');
        }
    };

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            const filters = {
                startDate: selectedDate.format('YYYY-MM-DD'),
                endDate: selectedDate.format('YYYY-MM-DD'),
            };
            
            if (selectedEmployee) {
                filters.employeeId = selectedEmployee;
            }

            const data = await attendanceAPI.getAllAttendance(filters);
            
            // Process attendance data for display
            const processedData = data.map(record => ({
                id: record.id,
                employeeId: record.employee?.employeeId || 'N/A',
                employeeName: `${record.employee?.firstName || ''} ${record.employee?.lastName || ''}`.trim(),
                department: record.employee?.department || 'N/A',
                date: dayjs(record.date).format('YYYY-MM-DD'),
                checkInTime: record.checkInTime ? dayjs(record.checkInTime).format('HH:mm:ss') : 'Not checked in',
                checkOutTime: record.checkOutTime ? dayjs(record.checkOutTime).format('HH:mm:ss') : 'Not checked out',
                duration: record.duration || 0,
                status: record.checkInTime ? (record.checkOutTime ? 'PRESENT' : 'CHECKED_IN') : 'ABSENT',
                isLate: record.checkInTime ? dayjs(record.checkInTime).hour() >= 9 : false, // Assuming 9 AM is the start time
            }));

            setAttendanceData(processedData);

            // Calculate stats for today
            if (selectedDate.isSame(dayjs(), 'day')) {
                const presentCount = processedData.filter(record => record.status !== 'ABSENT').length;
                const lateCount = processedData.filter(record => record.isLate).length;
                setStats(prev => ({
                    ...prev,
                    presentToday: presentCount,
                    absentToday: prev.totalEmployees - presentCount,
                    lateToday: lateCount
                }));
            }
        } catch (error) {
            console.error('Error fetching attendance data:', error);
            toast.error('Failed to load attendance data');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            field: 'employeeName',
            headerName: 'Employee',
            flex: 1.5,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ width: 32, height: 32 }}>
                        {params.row.employeeName.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2">{params.row.employeeName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                            {params.row.employeeId}
                        </Typography>
                    </Box>
                </Box>
            )
        },
        { field: 'department', headerName: 'Department', flex: 1, minWidth: 120 },
        { field: 'checkInTime', headerName: 'Check In', flex: 1, minWidth: 100 },
        { field: 'checkOutTime', headerName: 'Check Out', flex: 1, minWidth: 100 },
        {
            field: 'duration',
            headerName: 'Duration',
            flex: 1,
            minWidth: 100,
            renderCell: (params) => {
                const hours = Math.floor(params.value / 3600);
                const minutes = Math.floor((params.value % 3600) / 60);
                return `${hours}h ${minutes}m`;
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => {
                let color = 'default';
                let icon = null;
                
                if (params.value === 'PRESENT') {
                    color = 'success';
                    icon = <CheckCircleIcon fontSize="small" />;
                } else if (params.value === 'CHECKED_IN') {
                    color = 'warning';
                    icon = <AccessTimeIcon fontSize="small" />;
                } else {
                    color = 'error';
                    icon = <CancelIcon fontSize="small" />;
                }

                return (
                    <Chip
                        label={params.value}
                        color={color}
                        size="small"
                        icon={icon}
                        sx={{ fontWeight: 600 }}
                    />
                );
            }
        },
    ];

    if (!canMonitorAttendance) {
        return (
            <Box>
                <Alert severity="error">
                    You do not have permission to monitor attendance. Only ADMIN and HR users can access this feature.
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                Attendance Monitoring
            </Typography>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                    <PeopleIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">{stats.totalEmployees}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Employees
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'success.main' }}>
                                    <CheckCircleIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">{stats.presentToday}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Present Today
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'error.main' }}>
                                    <CancelIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">{stats.absentToday}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Absent Today
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: 'warning.main' }}>
                                    <AccessTimeIcon />
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">{stats.lateToday}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Late Today
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Filters</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4}>
                        <DatePicker
                            label="Select Date"
                            value={selectedDate}
                            onChange={(newValue) => setSelectedDate(newValue)}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField
                            select
                            label="Employee"
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            fullWidth
                        >
                            <MenuItem value="">All Employees</MenuItem>
                            {employees.map((employee) => (
                                <MenuItem key={employee.id} value={employee.id}>
                                    {employee.firstName} {employee.lastName} ({employee.employeeId})
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Button
                            variant="contained"
                            onClick={fetchAttendanceData}
                            disabled={loading}
                            fullWidth
                        >
                            {loading ? <CircularProgress size={20} /> : 'Refresh'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Attendance Data Grid */}
            <Paper sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={attendanceData}
                    columns={columns}
                    loading={loading}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 25 },
                        },
                    }}
                    pageSizeOptions={[25, 50, 100]}
                    checkboxSelection
                    disableRowSelectionOnClick
                    slots={{ toolbar: GridToolbar }}
                    slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                            quickFilterProps: { debounceMs: 500 },
                        },
                    }}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-cell:focus': { outline: 'none' },
                        '& .MuiDataGrid-columnHeaders': { backgroundColor: '#F9FAFB' }
                    }}
                />
            </Paper>
        </Box>
    );
};

export default AttendanceMonitoring;
import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Grid, Chip, Tabs, Tab, TextField, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { leaveAPI } from '../utils/api';
import dayjs from 'dayjs';

const leaveTypes = ['PAID', 'SICK', 'CASUAL', 'UNPAID', 'EMERGENCY'];
const leaveTypeLabels = {
    'PAID': 'Paid Leave',
    'SICK': 'Sick Leave',
    'CASUAL': 'Casual Leave',
    'UNPAID': 'Unpaid Leave',
    'EMERGENCY': 'Emergency Leave',
};

const LeaveModal = ({ open, onClose, onApply, submitting = false }) => {
    const { control, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: { type: '', from: null, to: null, reason: '' }
    });

    const onSubmit = (data) => {
        onApply(data);
        reset();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>Apply for Leave</DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Controller
                                name="type"
                                control={control}
                                rules={{ required: 'Leave type is required' }}
                                render={({ field }) => (
                                    <TextField {...field} select label="Leave Type" fullWidth error={!!errors.type} helperText={errors.type?.message}>
                                        {leaveTypes.map(type => (
                                            <MenuItem key={type} value={type}>
                                                {leaveTypeLabels[type] || type}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller
                                name="from"
                                control={control}
                                rules={{ required: 'Start date is required' }}
                                render={({ field }) => (
                                    <DatePicker label="From Date" value={field.value} onChange={field.onChange} slotProps={{ textField: { fullWidth: true, error: !!errors.from, helperText: errors.from?.message } }} />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller
                                name="to"
                                control={control}
                                rules={{ required: 'End date is required' }}
                                render={({ field }) => (
                                    <DatePicker label="To Date" value={field.value} onChange={field.onChange} slotProps={{ textField: { fullWidth: true, error: !!errors.to, helperText: errors.to?.message } }} />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="reason"
                                control={control}
                                rules={{ required: 'Reason is required' }}
                                render={({ field }) => (
                                    <TextField {...field} label="Reason/Remarks" multiline rows={3} fullWidth error={!!errors.reason} helperText={errors.reason?.message} />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit" disabled={submitting}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={submitting}>
                        {submitting ? <CircularProgress size={20} /> : 'Apply'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

const Leave = () => {
    const { user } = useAuth();
    const [tab, setTab] = useState(0);
    const [openModal, setOpenModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [myLeaves, setMyLeaves] = useState([]);
    const [teamLeaves, setTeamLeaves] = useState([]);
    const [error, setError] = useState(null);
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';

    // Fetch leave data
    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Fetch my leaves
                const myLeavesData = await leaveAPI.getMyLeaves();
                if (myLeavesData) {
                    setMyLeaves(myLeavesData.map(leave => ({
                        id: leave.id,
                        type: leaveTypeLabels[leave.leaveType] || leave.leaveType,
                        from: dayjs(leave.startDate).format('YYYY-MM-DD'),
                        to: dayjs(leave.endDate).format('YYYY-MM-DD'),
                        days: dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1,
                        status: leave.status,
                        reason: leave.reason,
                    })));
                }
                
                // Fetch all leaves for admin
                if (isAdmin) {
                    const allLeavesData = await leaveAPI.getAllLeaves();
                    if (allLeavesData) {
                        setTeamLeaves(allLeavesData.map(leave => ({
                            id: leave.id,
                            employee: `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''}`.trim(),
                            type: leaveTypeLabels[leave.leaveType] || leave.leaveType,
                            from: dayjs(leave.startDate).format('YYYY-MM-DD'),
                            to: dayjs(leave.endDate).format('YYYY-MM-DD'),
                            days: dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1,
                            status: leave.status,
                            reason: leave.reason,
                            leaveId: leave.id,
                        })));
                    }
                }
            } catch (err) {
                setError(err.message || 'Failed to load leave data');
                toast.error(err.message || 'Failed to load leaves');
            } finally {
                setLoading(false);
            }
        };
        
        if (user) {
            fetchLeaves();
        }
    }, [user, isAdmin]);

    const handleApply = async (data) => {
        try {
            setSubmitting(true);
            const leaveData = {
                leaveType: data.type,
                startDate: dayjs(data.from).format('YYYY-MM-DD'),
                endDate: dayjs(data.to).format('YYYY-MM-DD'),
                reason: data.reason,
            };
            
            await leaveAPI.create(leaveData);
            toast.success('Leave application submitted successfully');
            setOpenModal(false);
            
            // Refresh my leaves
            const myLeavesData = await leaveAPI.getMyLeaves();
            if (myLeavesData) {
                setMyLeaves(myLeavesData.map(leave => ({
                    id: leave.id,
                    type: leaveTypeLabels[leave.leaveType] || leave.leaveType,
                    from: dayjs(leave.startDate).format('YYYY-MM-DD'),
                    to: dayjs(leave.endDate).format('YYYY-MM-DD'),
                    days: dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1,
                    status: leave.status,
                    reason: leave.reason,
                })));
            }
        } catch (error) {
            toast.error(error.message || 'Failed to submit leave application');
        } finally {
            setSubmitting(false);
        }
    };

    const handleApprove = async (leaveId) => {
        try {
            await leaveAPI.updateStatus(leaveId, 'APPROVED', '');
            toast.success('Leave approved successfully');
            
            // Refresh data
            const allLeavesData = await leaveAPI.getAllLeaves();
            if (allLeavesData) {
                setTeamLeaves(allLeavesData.map(leave => ({
                    id: leave.id,
                    employee: `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''}`.trim(),
                    type: leaveTypeLabels[leave.leaveType] || leave.leaveType,
                    from: dayjs(leave.startDate).format('YYYY-MM-DD'),
                    to: dayjs(leave.endDate).format('YYYY-MM-DD'),
                    days: dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1,
                    status: leave.status,
                    reason: leave.reason,
                    leaveId: leave.id,
                })));
            }
        } catch (error) {
            toast.error(error.message || 'Failed to approve leave');
        }
    };

    const handleReject = async (leaveId) => {
        try {
            await leaveAPI.updateStatus(leaveId, 'REJECTED', '');
            toast.success('Leave rejected');
            
            // Refresh data
            const allLeavesData = await leaveAPI.getAllLeaves();
            if (allLeavesData) {
                setTeamLeaves(allLeavesData.map(leave => ({
                    id: leave.id,
                    employee: `${leave.employee?.firstName || ''} ${leave.employee?.lastName || ''}`.trim(),
                    type: leaveTypeLabels[leave.leaveType] || leave.leaveType,
                    from: dayjs(leave.startDate).format('YYYY-MM-DD'),
                    to: dayjs(leave.endDate).format('YYYY-MM-DD'),
                    days: dayjs(leave.endDate).diff(dayjs(leave.startDate), 'day') + 1,
                    status: leave.status,
                    reason: leave.reason,
                    leaveId: leave.id,
                })));
            }
        } catch (error) {
            toast.error(error.message || 'Failed to reject leave');
        }
    };

    const getStatusChip = (status) => {
        let color = 'default';
        if (status === 'APPROVED' || status === 'Approved') color = 'success';
        if (status === 'REJECTED' || status === 'Rejected') color = 'error';
        if (status === 'PENDING' || status === 'Pending') color = 'warning';
        return <Chip label={status} color={color} size="small" variant="soft" />;
    };

    const myLeaveColumns = [
        { field: 'type', headerName: 'Type', flex: 1, minWidth: 150 },
        { field: 'from', headerName: 'From', flex: 1, minWidth: 120 },
        { field: 'to', headerName: 'To', flex: 1, minWidth: 120 },
        { field: 'days', headerName: 'Days', width: 80 },
        { field: 'reason', headerName: 'Reason', flex: 1.5, minWidth: 200 },
        { field: 'status', headerName: 'Status', width: 120, renderCell: (params) => getStatusChip(params.value) },
    ];

    const teamLeaveColumns = [
        { field: 'employee', headerName: 'Employee', flex: 1, minWidth: 150 },
        { field: 'type', headerName: 'Type', flex: 1, minWidth: 150 },
        { field: 'from', headerName: 'From', width: 120 },
        { field: 'to', headerName: 'To', width: 120 },
        { field: 'reason', headerName: 'Reason', flex: 1.5, minWidth: 200 },
        { field: 'status', headerName: 'Status', width: 120, renderCell: (params) => getStatusChip(params.value) },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: (params) => {
                const leaveId = params.row.leaveId || params.id;
                const canApprove = params.row.status === 'PENDING';
                return [
                    <GridActionsCellItem 
                        icon={<CheckIcon />} 
                        label="Approve" 
                        onClick={() => handleApprove(leaveId)} 
                        showInMenu={false} 
                        disabled={!canApprove}
                        sx={{ color: 'success.main' }} 
                    />,
                    <GridActionsCellItem 
                        icon={<CloseIcon />} 
                        label="Reject" 
                        onClick={() => handleReject(leaveId)} 
                        showInMenu={false}
                        disabled={!canApprove}
                        sx={{ color: 'error.main' }} 
                    />,
                ];
            }
        }
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
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" fontWeight="600">Leave Management</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenModal(true)}>
                    Apply Leave
                </Button>
            </Box>

            <Paper sx={{ width: '100%', mb: 4 }}>
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="My Leaves" />
                    {isAdmin && <Tab label="Team Requests" />}
                </Tabs>

                <Box sx={{ p: 0, height: 400 }}>
                    {tab === 0 && (
                        <DataGrid
                            rows={myLeaves}
                            columns={myLeaveColumns}
                            pageSizeOptions={[5, 10]}
                            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                            disableRowSelectionOnClick
                            sx={{ border: 'none' }}
                        />
                    )}
                    {tab === 1 && isAdmin && (
                        <DataGrid
                            rows={teamLeaves}
                            columns={teamLeaveColumns}
                            pageSizeOptions={[5, 10]}
                            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                            disableRowSelectionOnClick
                            sx={{ border: 'none' }}
                        />
                    )}
                </Box>
            </Paper>

            <LeaveModal open={openModal} onClose={() => setOpenModal(false)} onApply={handleApply} submitting={submitting} />
        </Box>
    );
};

export default Leave;

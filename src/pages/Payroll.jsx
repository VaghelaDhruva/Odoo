import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, Chip, Divider, Button, Tooltip, IconButton, CircularProgress } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../context/AuthContext';
import { payrollAPI } from '../utils/api';
import { formatINR } from '../utils/currency';
import toast from 'react-hot-toast';

// Remove the hardcoded salary data as we're now using API

const SalarySlip = ({ data }) => (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>
                <Typography variant="h5" fontWeight="700" color="primary">Dayflow HRMS</Typography>
                <Typography variant="body2" color="text.secondary">123 Business Park, Tech City</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6">Payslip</Typography>
                <Typography variant="subtitle2" color="text.secondary">
                    {new Date(data.payableMonth).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                </Typography>
            </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Employee Name</Typography>
                <Typography variant="h6">{data.employee?.firstName} {data.employee?.lastName}</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Employee ID</Typography>
                <Typography variant="subtitle1">{data.employee?.employeeId}</Typography>
            </Grid>
        </Grid>

        <Paper variant="outlined" sx={{ mb: 3 }}>
            <Grid container>
                <Grid item xs={6} sx={{ p: 2, borderRight: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
                    <Typography variant="subtitle2">Earnings</Typography>
                </Grid>
                <Grid item xs={6} sx={{ p: 2, borderBottom: '1px solid #E5E7EB', textAlign: 'right' }}>
                    <Typography variant="subtitle2">Amount</Typography>
                </Grid>

                <Grid item xs={6} sx={{ p: 1.5, pl: 2, borderRight: '1px solid #E5E7EB' }}><Typography variant="body2">Basic Salary</Typography></Grid>
                <Grid item xs={6} sx={{ p: 1.5, pr: 2, textAlign: 'right' }}><Typography variant="body2">{formatINR(data.baseSalary)}</Typography></Grid>

                <Grid item xs={6} sx={{ p: 1.5, pl: 2, borderRight: '1px solid #E5E7EB' }}><Typography variant="body2">Allowances</Typography></Grid>
                <Grid item xs={6} sx={{ p: 1.5, pr: 2, textAlign: 'right' }}><Typography variant="body2">{formatINR(data.allowances)}</Typography></Grid>
            </Grid>
        </Paper>

        <Paper variant="outlined" sx={{ mb: 3 }}>
            <Grid container>
                <Grid item xs={6} sx={{ p: 2, borderRight: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
                    <Typography variant="subtitle2">Deductions</Typography>
                </Grid>
                <Grid item xs={6} sx={{ p: 2, borderBottom: '1px solid #E5E7EB', textAlign: 'right' }}>
                    <Typography variant="subtitle2">Amount</Typography>
                </Grid>
                <Grid item xs={6} sx={{ p: 1.5, pl: 2, borderRight: '1px solid #E5E7EB' }}><Typography variant="body2">Tax & PF</Typography></Grid>
                <Grid item xs={6} sx={{ p: 1.5, pr: 2, textAlign: 'right' }}><Typography variant="body2">{formatINR(data.deductions)}</Typography></Grid>
            </Grid>
        </Paper>

        <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Net Salary</Typography>
            <Typography variant="h5" fontWeight="700">{formatINR(data.netSalary)}</Typography>
        </Box>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button startIcon={<DownloadIcon />} variant="outlined" onClick={() => toast.success('Downloading Payslip...')}>
                Download PDF
            </Button>
        </Box>
    </Paper>
);

const Payroll = () => {
    const { user } = useAuth();
    const [payrollData, setPayrollData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayroll, setSelectedPayroll] = useState(null);
    
    // Check if user is an employee (not admin or HR)
    const isEmployee = user?.role === 'EMPLOYEE';

    useEffect(() => {
        fetchPayrollData();
    }, [isEmployee]);

    const fetchPayrollData = async () => {
        try {
            setLoading(true);
            let data;
            if (isEmployee) {
                data = await payrollAPI.getMyPayroll();
            } else {
                data = await payrollAPI.getAllPayroll();
            }
            setPayrollData(data);
            if (isEmployee && data.length > 0) {
                setSelectedPayroll(data[0]); // Show latest payroll for employee
            }
        } catch (error) {
            console.error('Error fetching payroll data:', error);
            toast.error('Failed to load payroll data');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        { 
            field: 'employee', 
            headerName: 'Employee', 
            flex: 1.5, 
            minWidth: 200,
            renderCell: (params) => (
                <Box>
                    <Typography variant="body2" fontWeight="600">
                        {params.row.employee?.firstName} {params.row.employee?.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {params.row.employee?.employeeId}
                    </Typography>
                </Box>
            )
        },
        { 
            field: 'department', 
            headerName: 'Department', 
            flex: 1, 
            minWidth: 150,
            renderCell: (params) => params.row.employee?.department || 'N/A'
        },
        { 
            field: 'baseSalary', 
            headerName: 'Basic', 
            flex: 1, 
            minWidth: 120,
            renderCell: (params) => formatINR(params.value)
        },
        { 
            field: 'netSalary', 
            headerName: 'Net Pay', 
            flex: 1, 
            minWidth: 120, 
            renderCell: (params) => (
                <Typography fontWeight="600" color="primary">
                    {formatINR(params.value)}
                </Typography>
            )
        },
        { 
            field: 'payableMonth', 
            headerName: 'Month', 
            flex: 1, 
            minWidth: 120,
            renderCell: (params) => new Date(params.value).toLocaleDateString('en-IN', { 
                month: 'short', 
                year: 'numeric' 
            })
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === 'PAID' ? 'success' : params.value === 'PROCESSED' ? 'info' : 'warning'}
                    variant="outlined"
                    size="small"
                />
            )
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 100,
            getActions: (params) => [
                <GridActionsCellItem 
                    icon={<VisibilityIcon />} 
                    label="View" 
                    onClick={() => setSelectedPayroll(params.row)} 
                />,
            ]
        }
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (isEmployee) {
        return (
            <Box>
                <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>My Payroll</Typography>
                {selectedPayroll ? (
                    <SalarySlip data={selectedPayroll} />
                ) : (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            No payroll data available
                        </Typography>
                    </Paper>
                )}
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>Department Payroll</Typography>
            <Paper sx={{ width: '100%', height: 500 }}>
                <DataGrid
                    rows={payrollData}
                    columns={columns}
                    pageSizeOptions={[5, 10]}
                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                    disableRowSelectionOnClick
                    sx={{ border: 'none' }}
                />
            </Paper>
            
            {/* Show salary slip modal when payroll is selected */}
            {selectedPayroll && !isEmployee && (
                <Paper sx={{ mt: 3 }}>
                    <SalarySlip data={selectedPayroll} />
                </Paper>
            )}
        </Box>
    );
};

export default Payroll;

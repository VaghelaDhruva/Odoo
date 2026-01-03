import React, { useState } from 'react';
import { Box, Paper, Typography, Grid, Chip, Divider, Button, Tooltip, IconButton } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const salaryData = [
    { id: 1, employee: 'Sarah Smith', role: 'Product Manager', basic: 5000, hra: 2000, allowances: 1000, deductions: 500, net: 7500, month: 'October 2023', status: 'Paid' },
    { id: 2, employee: 'John Doe', role: 'Software Engineer', basic: 4000, hra: 1500, allowances: 800, deductions: 400, net: 5900, month: 'October 2023', status: 'Paid' },
    { id: 3, employee: 'Emily Davis', role: 'Designer', basic: 3500, hra: 1200, allowances: 600, deductions: 300, net: 5000, month: 'October 2023', status: 'Pending' },
    { id: 4, employee: 'Michael Brown', role: 'HR Specialist', basic: 4500, hra: 1800, allowances: 900, deductions: 450, net: 6750, month: 'October 2023', status: 'Paid' },
];

const SalarySlip = ({ data }) => (
    <Paper sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Box>
                <Typography variant="h5" fontWeight="700" color="primary">Dayflow HRMS</Typography>
                <Typography variant="body2" color="text.secondary">123 Business Park, Tech City</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6">Payslip</Typography>
                <Typography variant="subtitle2" color="text.secondary">{data.month}</Typography>
            </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Employee Name</Typography>
                <Typography variant="h6">{data.employee}</Typography>
            </Grid>
            <Grid item xs={6}>
                <Typography variant="overline" color="text.secondary">Designation</Typography>
                <Typography variant="subtitle1">{data.role}</Typography>
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
                <Grid item xs={6} sx={{ p: 1.5, pr: 2, textAlign: 'right' }}><Typography variant="body2">${data.basic}</Typography></Grid>

                <Grid item xs={6} sx={{ p: 1.5, pl: 2, borderRight: '1px solid #E5E7EB' }}><Typography variant="body2">HRA</Typography></Grid>
                <Grid item xs={6} sx={{ p: 1.5, pr: 2, textAlign: 'right' }}><Typography variant="body2">${data.hra}</Typography></Grid>

                <Grid item xs={6} sx={{ p: 1.5, pl: 2, borderRight: '1px solid #E5E7EB' }}><Typography variant="body2">Other Allowances</Typography></Grid>
                <Grid item xs={6} sx={{ p: 1.5, pr: 2, textAlign: 'right' }}><Typography variant="body2">${data.allowances}</Typography></Grid>
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
                <Grid item xs={6} sx={{ p: 1.5, pr: 2, textAlign: 'right' }}><Typography variant="body2">${data.deductions}</Typography></Grid>
            </Grid>
        </Paper>

        <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', p: 2, borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Net Salary</Typography>
            <Typography variant="h5" fontWeight="700">${data.net}</Typography>
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
    // Check if user is an employee (not admin or HR)
    const isEmployee = user?.role === 'EMPLOYEE';

    const columns = [
        { field: 'employee', headerName: 'Employee', flex: 1.5, minWidth: 200 },
        { field: 'role', headerName: 'Role', flex: 1, minWidth: 150 },
        { field: 'basic', headerName: 'Basic', flex: 1, minWidth: 100 },
        { field: 'net', headerName: 'Net Pay', flex: 1, minWidth: 100, renderCell: (p) => <Typography fontWeight="600">${p.value}</Typography> },
        { field: 'month', headerName: 'Month', flex: 1, minWidth: 120 },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === 'Paid' ? 'success' : 'warning'}
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
                <GridActionsCellItem icon={<VisibilityIcon />} label="View" onClick={() => toast('View details coming soon')} />,
            ]
        }
    ];

    if (isEmployee) {
        return (
            <Box>
                <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>My Payroll</Typography>
                <SalarySlip data={salaryData[0]} />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>Department Payroll</Typography>
            <Paper sx={{ width: '100%', height: 500 }}>
                <DataGrid
                    rows={salaryData}
                    columns={columns}
                    pageSizeOptions={[5, 10]}
                    initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
                    disableRowSelectionOnClick
                    sx={{ border: 'none' }}
                />
            </Paper>
        </Box>
    );
};

export default Payroll;

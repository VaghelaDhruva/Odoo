import React, { useState } from 'react';
import { Box, Button, Typography, Chip, IconButton, Paper, Avatar, Tooltip } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import EmployeeModal from '../components/EmployeeModal';

const initialEmployees = [
    { id: 1, name: 'Sarah Smith', email: 'sarah@dayflow.com', role: 'Product Manager', department: 'Product', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=1', joinDate: '2023-01-15' },
    { id: 2, name: 'John Doe', email: 'john@dayflow.com', role: 'Software Engineer', department: 'Engineering', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=2', joinDate: '2023-03-22' },
    { id: 3, name: 'Emily Davis', email: 'emily@dayflow.com', role: 'Designer', department: 'Design', status: 'On Leave', avatar: 'https://i.pravatar.cc/150?u=3', joinDate: '2023-05-10' },
    { id: 4, name: 'Michael Brown', email: 'michael@dayflow.com', role: 'HR Specialist', department: 'Human Resources', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=4', joinDate: '2022-11-05' },
    { id: 5, name: 'Lisa Wilson', email: 'lisa@dayflow.com', role: 'Sales Manager', department: 'Sales', status: 'Terminated', avatar: 'https://i.pravatar.cc/150?u=5', joinDate: '2021-08-30' },
    { id: 6, name: 'David Lee', email: 'david@dayflow.com', role: 'Software Engineer', department: 'Engineering', status: 'Active', avatar: 'https://i.pravatar.cc/150?u=6', joinDate: '2023-09-01' },
];

const Employees = () => {
    const [employees, setEmployees] = useState(initialEmployees);
    const [openModal, setOpenModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const navigate = useNavigate();

    const handleAddClick = () => {
        setSelectedEmployee(null);
        setOpenModal(true);
    };

    const handleEditClick = (employee) => {
        setSelectedEmployee(employee);
        setOpenModal(true);
    };

    const handleDeleteClick = (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            setEmployees(prev => prev.filter(e => e.id !== id));
            toast.success('Employee deleted successfully');
        }
    };

    const handleSave = (employeeData) => {
        if (employeeData.id) {
            // Edit
            setEmployees(prev => prev.map(e => e.id === employeeData.id ? { ...e, ...employeeData } : e));
            toast.success('Employee updated successfully');
        } else {
            // Add
            const newEmployee = {
                ...employeeData,
                id: Math.max(...employees.map(e => e.id), 0) + 1,
            };
            setEmployees(prev => [newEmployee, ...prev]);
            toast.success('New employee added successfully');
        }
    };

    const columns = [
        {
            field: 'name',
            headerName: 'Employee',
            flex: 1.5,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={params.row.avatar} sx={{ width: 40, height: 40 }} />
                    <Box>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>{params.value}</Typography>
                        <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
                    </Box>
                </Box>
            )
        },
        { field: 'role', headerName: 'Role', flex: 1, minWidth: 150 },
        { field: 'department', headerName: 'Department', flex: 1, minWidth: 150 },
        {
            field: 'status',
            headerName: 'Status',
            width: 120, // Keep status fixed width as chips are standard size
            renderCell: (params) => {
                let color = 'default';
                let bgcolor = 'default';
                if (params.value === 'Active') { color = 'success.main'; bgcolor = 'success.light'; }
                if (params.value === 'On Leave') { color = 'warning.main'; bgcolor = 'warning.light'; }
                if (params.value === 'Terminated') { color = 'error.main'; bgcolor = 'error.light'; }

                return (
                    <Chip
                        label={params.value}
                        size="small"
                        sx={{
                            bgcolor: bgcolor,
                            color: color,
                            fontWeight: 600,
                            opacity: 0.8,
                            borderRadius: 1
                        }}
                    />
                );
            }
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="View Profile">
                        <IconButton onClick={() => navigate(`/employees/${params.row.id}`)} size="small" sx={{ color: 'info.main' }}>
                            <VisibilityIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                        <IconButton onClick={() => handleEditClick(params.row)} size="small" color="primary">
                            <EditIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton onClick={() => handleDeleteClick(params.row.id)} size="small" color="error">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            ),
        },
    ];

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="600">All Employees</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddClick}
                >
                    Add Employee
                </Button>
            </Box>

            <Paper sx={{ height: 600, width: '100%', borderRadius: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={employees}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: { pageSize: 10 },
                        },
                    }}
                    pageSizeOptions={[10, 25, 50]}
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

            <EmployeeModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onSave={handleSave}
                employee={selectedEmployee}
            />
        </Box>
    );
};

export default Employees;

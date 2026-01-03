import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Chip, IconButton, Paper, Avatar, Tooltip, CircularProgress } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import EmployeeModal from '../components/EmployeeModal';

// Remove hardcoded employee data as we're now using API

const Employees = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const navigate = useNavigate();

    // Check if user can manage employees (ADMIN or HR)
    const canManageEmployees = user && (user.role === 'ADMIN' || user.role === 'HR');

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await userAPI.getAll();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            toast.error('Failed to load employees');
        } finally {
            setLoading(false);
        }
    };

    const handleAddClick = () => {
        setSelectedEmployee(null);
        setOpenModal(true);
    };

    const handleEditClick = (employee) => {
        setSelectedEmployee(employee);
        setOpenModal(true);
    };

    const handleDeleteClick = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                // Note: You'll need to implement delete API endpoint
                // await userAPI.delete(id);
                setEmployees(prev => prev.filter(e => e.id !== id));
                toast.success('Employee deleted successfully');
            } catch (error) {
                console.error('Error deleting employee:', error);
                toast.error('Failed to delete employee');
            }
        }
    };

    const handleSave = async (employeeData) => {
        try {
            if (employeeData.id) {
                // Edit existing employee
                const updateData = {
                    firstName: employeeData.firstName,
                    lastName: employeeData.lastName,
                    email: employeeData.email,
                    designation: employeeData.role,
                    department: employeeData.department,
                    employmentStatus: employeeData.status.toUpperCase(),
                };
                
                // Only include password if it's provided
                if (employeeData.password && employeeData.password.trim()) {
                    updateData.password = employeeData.password;
                }
                
                const updatedEmployee = await userAPI.update(employeeData.id, updateData);
                setEmployees(prev => prev.map(e => e.id === employeeData.id ? updatedEmployee : e));
                toast.success('Employee updated successfully');
            } else {
                // Add new employee
                const newEmployee = await userAPI.create({
                    employeeId: `EMP${Date.now()}`, // Generate unique employee ID
                    firstName: employeeData.firstName,
                    lastName: employeeData.lastName,
                    email: employeeData.email,
                    password: employeeData.password, // Use password from form
                    designation: employeeData.role,
                    department: employeeData.department,
                    employmentStatus: employeeData.status.toUpperCase(),
                });
                setEmployees(prev => [newEmployee, ...prev]);
                toast.success('New employee added successfully');
            }
        } catch (error) {
            console.error('Error saving employee:', error);
            
            // Handle validation errors specifically
            if (error.status === 400 && error.data && error.data.errors) {
                const validationErrors = error.data.errors.map(err => err.msg).join(', ');
                toast.error(`Validation failed: ${validationErrors}`);
            } else if (error.status === 409) {
                toast.error('Employee with this email or employee ID already exists');
            } else if (error.status === 403) {
                toast.error('You do not have permission to manage employees');
            } else {
                toast.error(error.message || 'Failed to save employee');
            }
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
                    <Avatar src={params.row.profileImage} sx={{ width: 40, height: 40 }}>
                        {!params.row.profileImage && `${params.row.firstName?.[0]}${params.row.lastName?.[0]}`}
                    </Avatar>
                    <Box>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
                            {params.row.firstName} {params.row.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">{params.row.email}</Typography>
                    </Box>
                </Box>
            )
        },
        { field: 'designation', headerName: 'Role', flex: 1, minWidth: 150 },
        { field: 'department', headerName: 'Department', flex: 1, minWidth: 150 },
        {
            field: 'employmentStatus',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => {
                let color = 'default';
                let bgcolor = 'default';
                if (params.value === 'ACTIVE') { color = 'success.main'; bgcolor = 'success.light'; }
                if (params.value === 'ON_LEAVE') { color = 'warning.main'; bgcolor = 'warning.light'; }
                if (params.value === 'TERMINATED') { color = 'error.main'; bgcolor = 'error.light'; }

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
                    {canManageEmployees && (
                        <>
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
                        </>
                    )}
                </Box>
            ),
        },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, alignItems: 'center' }}>
                <Typography variant="h5" fontWeight="600">All Employees</Typography>
                {canManageEmployees && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleAddClick}
                    >
                        Add Employee
                    </Button>
                )}
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

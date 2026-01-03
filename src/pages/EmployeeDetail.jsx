import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Grid, Avatar, Button, Tabs, Tab, Divider, Chip, List, ListItem, ListItemText, ListItemIcon, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import { formatINR } from '../utils/currency';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';

const EmployeeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                setLoading(true);
                const employeeData = await userAPI.getById(id);
                setEmployee({
                    ...employeeData,
                    name: `${employeeData.firstName} ${employeeData.lastName}`,
                    role: employeeData.designation || 'N/A',
                    status: employeeData.employmentStatus || 'ACTIVE',
                    joinDate: employeeData.joinDate ? new Date(employeeData.joinDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    }) : 'N/A',
                    avatar: employeeData.profileImage || `https://i.pravatar.cc/150?u=${employeeData.email}`,
                    about: `${employeeData.designation || 'Employee'} in the ${employeeData.department || 'Company'} department.`,
                    location: employeeData.address || 'Not specified',
                });
                setError(null);
            } catch (err) {
                console.error('Error fetching employee:', err);
                setError(err.message || 'Failed to load employee details');
                toast.error('Failed to load employee details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchEmployee();
        }
    }, [id]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !employee) {
        return (
            <Box>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/employees')} sx={{ mb: 2 }}>
                    Back to Employees
                </Button>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error || 'Employee not found'}
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/employees')} sx={{ mb: 2 }}>
                Back to Employees
            </Button>

            <Paper sx={{ mb: 3 }}>
                <Box sx={{ p: 4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, alignItems: 'center' }}>
                    <Avatar
                        src={employee.avatar}
                        sx={{ width: 100, height: 100, border: '4px solid white', boxShadow: 2 }}
                    />
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, flexGrow: 1 }}>
                        <Typography variant="h4" fontWeight="700">{employee.name}</Typography>
                        <Typography variant="h6" color="text.secondary" gutterBottom>{employee.role} at {employee.department}</Typography>
                        <Chip label={employee.status} color="success" size="small" />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button variant="outlined">Edit Profile</Button>
                    </Box>
                </Box>
                <Divider />
                <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ px: 2 }}>
                    <Tab label="Profile" />
                    <Tab label="Job Details" />
                    <Tab label="Documents" />
                </Tabs>
            </Paper>

            <Grid container spacing={3}>
                {tab === 0 && (
                    <>
                        <Grid item xs={12} md={8}>
                            <Paper sx={{ p: 3, mb: 3 }}>
                                <Typography variant="h6" gutterBottom>About</Typography>
                                <Typography paragraph color="text.secondary">{employee.about}</Typography>

                                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Personal Information</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <List>
                                            <ListItem disablePadding sx={{ mb: 1 }}>
                                                <ListItemIcon><EmailIcon color="action" /></ListItemIcon>
                                                <ListItemText primary="Email" secondary={employee.email} />
                                            </ListItem>
                                            <ListItem disablePadding sx={{ mb: 1 }}>
                                                <ListItemIcon><PhoneIcon color="action" /></ListItemIcon>
                                                <ListItemText primary="Phone" secondary={employee.phone} />
                                            </ListItem>
                                        </List>
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <List>
                                            <ListItem disablePadding sx={{ mb: 1 }}>
                                                <ListItemIcon><LocationOnIcon color="action" /></ListItemIcon>
                                                <ListItemText primary="Location" secondary={employee.location} />
                                            </ListItem>
                                            <ListItem disablePadding sx={{ mb: 1 }}>
                                                <ListItemIcon><WorkIcon color="action" /></ListItemIcon>
                                                <ListItemText primary="Joined" secondary={employee.joinDate} />
                                            </ListItem>
                                        </List>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>Reporting To</Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                    <Avatar src="https://i.pravatar.cc/150?u=manager" />
                                    <Box>
                                        <Typography variant="subtitle2">Alex Johnson</Typography>
                                        <Typography variant="caption" color="text.secondary">CTO</Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </>
                )}

                {tab === 1 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Employment Information</Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                                    <Typography variant="body1">{employee.employeeId || `EMP-${employee.id.toString().slice(-4)}`}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="caption" color="text.secondary">Current Salary</Typography>
                                    <Typography variant="body1">{employee.salary ? formatINR(employee.salary) + ' / year' : 'Not specified'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="caption" color="text.secondary">Department</Typography>
                                    <Typography variant="body1">{employee.department || 'Not specified'}</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                )}

                {tab === 2 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Documents</Typography>
                            <Alert severity="info">
                                Document management feature is coming soon. Contact HR for document requests.
                            </Alert>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default EmployeeDetail;

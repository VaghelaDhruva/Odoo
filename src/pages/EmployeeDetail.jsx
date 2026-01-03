import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Grid, Avatar, Button, Tabs, Tab, Divider, Chip, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';

const EmployeeDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tab, setTab] = useState(0);

    // Mock data fetching based on ID
    const employee = {
        id: id,
        name: 'Sarah Smith',
        role: 'Product Manager',
        department: 'Product',
        status: 'Active',
        email: 'sarah@dayflow.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        joinDate: 'Jan 15, 2023',
        avatar: 'https://i.pravatar.cc/150?u=1',
        salary: 92000,
        about: 'Experienced Product Manager with a demonstrated history of working in the computer software industry. Skilled in Product Lifecycle Management, Agile Methodologies, and User Experience.',
        documents: [
            { name: 'Offer Letter.pdf', date: 'Jan 10, 2023' },
            { name: 'Non-Disclosure Agreement.pdf', date: 'Jan 10, 2023' },
            { name: 'Tax Forms 2023.pdf', date: 'Jan 15, 2023' },
        ]
    };

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
                                    <Typography variant="body1">EMP-{employee.id.toString().padStart(4, '0')}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="caption" color="text.secondary">Current Salary</Typography>
                                    <Typography variant="body1">${employee.salary.toLocaleString()} / year</Typography>
                                </Grid>
                                <Grid item xs={12} sm={4}>
                                    <Typography variant="caption" color="text.secondary">Employment Type</Typography>
                                    <Typography variant="body1">Full Time</Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                )}

                {tab === 2 && (
                    <Grid item xs={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>Documents</Typography>
                            <List>
                                {employee.documents.map((doc, i) => (
                                    <ListItem key={i} sx={{ borderBottom: '1px solid #f0f0f0' }}>
                                        <ListItemIcon><DescriptionIcon color="primary" /></ListItemIcon>
                                        <ListItemText primary={doc.name} secondary={doc.date} />
                                        <Button variant="text" size="small">Download</Button>
                                    </ListItem>
                                ))}
                            </List>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
};

export default EmployeeDetail;

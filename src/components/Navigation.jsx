import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import AttendanceIcon from '@mui/icons-material/EventAvailableOutlined';
import LeaveIcon from '@mui/icons-material/DateRangeOutlined';
import PayrollIcon from '@mui/icons-material/AttachMoneyOutlined';
import PersonIcon from '@mui/icons-material/PersonOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import { useAuth } from '../context/AuthContext';

const Navigation = ({ onClose }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if user is Admin or HR
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';
    
    // Define menu items with role-based visibility
    const allMenuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { text: 'Employees', icon: <PeopleIcon />, path: '/employees', roles: ['ADMIN', 'HR'] }, // Admin/HR only
        { text: 'Attendance', icon: <AttendanceIcon />, path: '/attendance', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { text: 'Leave', icon: <LeaveIcon />, path: '/leave', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { text: 'Payroll', icon: <PayrollIcon />, path: '/payroll', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { text: 'Profile', icon: <PersonIcon />, path: '/profile', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
        { text: 'Settings', icon: <SettingsIcon />, path: '/settings', roles: ['ADMIN', 'HR', 'EMPLOYEE'] },
    ];
    
    // Filter menu items based on user role
    const menuItems = allMenuItems.filter(item => 
        item.roles.includes(user?.role || 'EMPLOYEE')
    );

    const handleNavigate = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                    component="img"
                    // Placeholder logo or icon
                    src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    sx={{ height: 32, width: 32, borderRadius: 1 }}
                    alt="Dayflow"
                />
                <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                    Dayflow
                </Typography>
            </Box>
            <List component="nav">
                {menuItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    return (
                        <ListItem key={item.text} disablePadding sx={{ display: 'block', mb: 0.5 }}>
                            <ListItemButton
                                selected={isActive}
                                onClick={() => handleNavigate(item.path)}
                                sx={{
                                    minHeight: 48,
                                    px: 2.5,
                                    mx: 1,
                                    borderRadius: 1,
                                    '&.Mui-selected': {
                                        backgroundColor: 'primary.light',
                                        color: 'primary.contrastText',
                                        '&:hover': {
                                            backgroundColor: 'primary.main',
                                        },
                                        '& .MuiListItemIcon-root': {
                                            color: 'primary.contrastText',
                                        }
                                    },
                                    '&:hover': {
                                        backgroundColor: 'rgba(99, 102, 241, 0.08)',
                                    }
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        minWidth: 0,
                                        mr: 2,
                                        justifyContent: 'center',
                                        color: isActive ? 'inherit' : 'text.secondary',
                                    }}
                                >
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: isActive ? 600 : 500 }} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>

        </Box>
    );
};

export default Navigation;

import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    AppBar,
    Box,
    CssBaseline,
    Drawer,
    IconButton,
    Toolbar,
    Typography,
    InputBase,
    Menu,
    MenuItem,
    Avatar,
    Badge,
    useMediaQuery,
    Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/NotificationsOutlined';
import Navigation from '../components/Navigation';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const DashboardLayout = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Show loading state while checking authentication
    if (loading || !user) {
        return null; // ProtectedRoute will handle redirect
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        logout();
        navigate('/login');
    };

    // Title mapping based on path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/employees')) return 'Employee Management';
        if (path.includes('/attendance')) return 'Attendance';
        if (path.includes('/leave')) return 'Leave Management';
        if (path.includes('/payroll')) return 'Payroll';
        if (path.includes('/settings')) return 'Settings';
        return 'Dayflow HRMS';
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        {getPageTitle()}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                position: 'relative',
                                borderRadius: 2,
                                backgroundColor: 'rgba(0,0,0,0.04)',
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' },
                                mr: 2,
                                display: { xs: 'none', sm: 'flex' },
                                width: 'auto'
                            }}>
                            <Box sx={{ px: 2, display: 'flex', alignItems: 'center', pointerEvents: 'none', height: '100%' }}>
                                <SearchIcon color="action" />
                            </Box>
                            <InputBase
                                placeholder="Search…"
                                sx={{ p: 1, pl: 0, width: '200px' }}
                            />
                        </Box>

                        <IconButton color="inherit">
                            <Badge badgeContent={4} color="error">
                                <NotificationsIcon color="action" />
                            </Badge>
                        </IconButton>

                        <IconButton
                            onClick={handleMenu}
                            sx={{ p: 0 }}
                        >
                            <Avatar alt={user?.name} src={user?.avatar} />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleClose}>Profile</MenuItem>
                            <MenuItem onClick={handleClose}>Settings</MenuItem>
                            <Divider sx={{ my: 0.5 }} />
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant={isMobile ? 'temporary' : 'permanent'}
                    open={isMobile ? mobileOpen : true}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    <Navigation onClose={() => setMobileOpen(false)} />
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: 8,
                    minHeight: '100vh'
                }}
            >
                <Outlet />
            </Box>
        </Box>
    );
};

export default DashboardLayout;



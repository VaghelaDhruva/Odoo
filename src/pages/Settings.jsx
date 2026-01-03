import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Switch, FormControlLabel, Button, TextField, Divider, Grid, Avatar, Alert, CircularProgress } from '@mui/material';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';

const Settings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [emailUpdates, setEmailUpdates] = useState(true);
    
    // Editable fields for employees
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [profileImage, setProfileImage] = useState('');
    
    const isEmployee = user?.role === 'EMPLOYEE';

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const userData = await userAPI.getMe();
                setPhone(userData.phone || '');
                setAddress(userData.address || '');
                setProfileImage(userData.profileImage || '');
            } catch (error) {
                toast.error('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };
        
        if (user) {
            fetchUserData();
        }
    }, [user]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            // In a real app, you'd upload to a server and get the URL
            // For now, we'll use a data URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!isEmployee) {
            toast.success('Settings saved successfully');
            return;
        }
        
        try {
            setSaving(true);
            const updateData = {
                phone: phone || undefined,
                address: address || undefined,
                profileImage: profileImage || undefined,
            };
            
            await userAPI.updateMe(updateData);
            toast.success('Profile updated successfully');
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box maxWidth="md">
            <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>Settings</Typography>

            {isEmployee && (
                <Alert severity="info" sx={{ mb: 3 }}>
                    As an employee, you can only edit your contact information and profile picture. 
                    Other details are managed by HR/Admin.
                </Alert>
            )}

            <Paper sx={{ p: 4, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Profile Settings</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                    <Avatar
                        src={profileImage || user?.avatar || `https://i.pravatar.cc/150?u=${user?.email}`}
                        sx={{ width: 80, height: 80 }}
                    />
                    {isEmployee && (
                        <>
                            <Button variant="outlined" component="label" disabled={saving}>
                                Upload New Picture
                                <input hidden accept="image/*" type="file" onChange={handleImageUpload} />
                            </Button>
                            {profileImage && (
                                <Button color="error" onClick={() => setProfileImage('')} disabled={saving}>
                                    Remove
                                </Button>
                            )}
                        </>
                    )}
                </Box>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Full Name" 
                            value={`${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'N/A'} 
                            fullWidth 
                            disabled
                            helperText="Contact HR to update your name"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Email" 
                            value={user?.email || ''} 
                            fullWidth 
                            disabled
                            helperText="Contact HR to update your email"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Phone" 
                            value={phone} 
                            onChange={(e) => setPhone(e.target.value)}
                            fullWidth 
                            disabled={!isEmployee || saving}
                            helperText={isEmployee ? "You can update your phone number" : "Contact HR to update"}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField 
                            label="Department" 
                            value={user?.department || 'N/A'} 
                            fullWidth 
                            disabled
                            helperText="Contact HR to update"
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField 
                            label="Address" 
                            value={address} 
                            onChange={(e) => setAddress(e.target.value)}
                            multiline 
                            rows={3} 
                            fullWidth 
                            disabled={!isEmployee || saving}
                            helperText={isEmployee ? "You can update your address" : "Contact HR to update"}
                        />
                    </Grid>
                    {!isEmployee && (
                        <Grid item xs={12}>
                            <TextField 
                                label="Designation" 
                                value={user?.designation || 'N/A'} 
                                fullWidth 
                                disabled
                                helperText="Contact HR to update"
                            />
                        </Grid>
                    )}
                </Grid>
            </Paper>

            <Paper sx={{ p: 4, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Appearance & Notifications</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                        control={<Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />}
                        label="Enable Desktop Notifications"
                    />
                    <FormControlLabel
                        control={<Switch checked={emailUpdates} onChange={(e) => setEmailUpdates(e.target.checked)} />}
                        label="Receive Email Updates"
                    />
                    <FormControlLabel
                        control={<Switch checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} />}
                        label="Dark Mode (Beta)"
                    />
                </Box>
            </Paper>

            <Paper sx={{ p: 4, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="error">Danger Zone</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Once you delete your account, there is no going back. Please be certain.
                </Typography>
                <Button variant="outlined" color="error">Delete Account</Button>
            </Paper>

            {isEmployee && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 4 }}>
                    <Button size="large" disabled={saving}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        size="large" 
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                </Box>
            )}
        </Box>
    );
};

export default Settings;

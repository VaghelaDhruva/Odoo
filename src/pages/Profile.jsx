import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Avatar,
    Button,
    TextField,
    Card,
    CardContent,
    Divider,
    Chip,
    CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../utils/api';
import { formatINR } from '../utils/currency';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const Profile = () => {
    const { user, refreshUser } = useAuth();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        address: '',
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await userAPI.getMe();
            setProfileData(data);
            setFormData({
                phone: data.phone || '',
                address: data.address || '',
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = () => {
        setEditing(true);
    };

    const handleCancel = () => {
        setEditing(false);
        setFormData({
            phone: profileData.phone || '',
            address: profileData.address || '',
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            console.log('Updating profile with data:', formData); // Debug log
            
            // Validate phone number format if provided
            if (formData.phone && formData.phone.trim()) {
                const phoneRegex = /^[+]?[(]?[\d\s\-\(\)\.]{7,20}$/;
                if (!phoneRegex.test(formData.phone.trim())) {
                    toast.error('Please provide a valid phone number (7-20 digits with optional formatting)');
                    return;
                }
            }
            
            // Validate address length if provided
            if (formData.address && formData.address.length > 500) {
                toast.error('Address must not exceed 500 characters');
                return;
            }
            
            const updatedData = await userAPI.updateMe(formData);
            console.log('Profile updated successfully:', updatedData); // Debug log
            
            setProfileData(updatedData);
            setEditing(false);
            
            // Refresh user context to update header/navigation
            try {
                await refreshUser();
            } catch (refreshError) {
                console.warn('Failed to refresh user context:', refreshError);
            }
            
            toast.success('Profile updated successfully');
        } catch (error) {
            console.error('Error updating profile:', error);
            
            // Handle specific error cases
            if (error.status === 400 && error.data && error.data.errors) {
                const validationErrors = error.data.errors.map(err => err.msg).join(', ');
                toast.error(`Validation failed: ${validationErrors}`);
            } else if (error.status === 400) {
                toast.error(error.message || 'Invalid data provided');
            } else if (error.status === 401) {
                toast.error('Please log in to update your profile');
            } else if (error.status === 403) {
                toast.error('You do not have permission to update this profile');
            } else {
                toast.error(error.message || 'Failed to update profile');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!profileData) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="text.secondary">
                    Profile data not available
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight="600" sx={{ mb: 3 }}>
                My Profile
            </Typography>

            <Grid container spacing={3}>
                {/* Profile Header */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                            <Avatar
                                src={profileData.profileImage}
                                sx={{ width: 100, height: 100, bgcolor: 'primary.light', fontSize: '2rem' }}
                            >
                                {!profileData.profileImage && `${profileData.firstName?.[0]}${profileData.lastName?.[0]}`}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h5" fontWeight="600">
                                    {profileData.firstName} {profileData.lastName}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
                                    {profileData.designation} • {profileData.department}
                                </Typography>
                                <Chip
                                    label={profileData.employmentStatus}
                                    color={profileData.employmentStatus === 'ACTIVE' ? 'success' : 'warning'}
                                    size="small"
                                />
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                {!editing ? (
                                    <Button
                                        variant="outlined"
                                        startIcon={<EditIcon />}
                                        onClick={handleEdit}
                                    >
                                        Edit Profile
                                    </Button>
                                ) : (
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<CancelIcon />}
                                            onClick={handleCancel}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                                            onClick={handleSave}
                                            disabled={saving}
                                        >
                                            {saving ? 'Saving...' : 'Save'}
                                        </Button>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Personal Information */}
                <Grid item xs={12} md={8}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                                Personal Information
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Employee ID</Typography>
                                    <Typography variant="body1" fontWeight="500">
                                        {profileData.employeeId}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Email</Typography>
                                    <Typography variant="body1" fontWeight="500">
                                        {profileData.email}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Phone</Typography>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="Enter phone number (e.g., +1-234-567-8900)"
                                            helperText="Format: +1-234-567-8900 or (123) 456-7890"
                                        />
                                    ) : (
                                        <Typography variant="body1" fontWeight="500">
                                            {profileData.phone || 'Not provided'}
                                        </Typography>
                                    )}
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="caption" color="text.secondary">Join Date</Typography>
                                    <Typography variant="body1" fontWeight="500">
                                        {dayjs(profileData.joinDate).format('MMM DD, YYYY')}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="caption" color="text.secondary">Address</Typography>
                                    {editing ? (
                                        <TextField
                                            fullWidth
                                            multiline
                                            rows={2}
                                            size="small"
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            placeholder="Enter address"
                                        />
                                    ) : (
                                        <Typography variant="body1" fontWeight="500">
                                            {profileData.address || 'Not provided'}
                                        </Typography>
                                    )}
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Job Information */}
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" fontWeight="600" sx={{ mb: 2 }}>
                                Job Information
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Role</Typography>
                                    <Typography variant="body1" fontWeight="500">
                                        {profileData.role}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Department</Typography>
                                    <Typography variant="body1" fontWeight="500">
                                        {profileData.department}
                                    </Typography>
                                </Box>
                                <Divider />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Designation</Typography>
                                    <Typography variant="body1" fontWeight="500">
                                        {profileData.designation}
                                    </Typography>
                                </Box>
                                {profileData.salary && (
                                    <>
                                        <Divider />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary">Salary</Typography>
                                            <Typography variant="body1" fontWeight="500" color="primary">
                                                {formatINR(profileData.salary)} / year
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;
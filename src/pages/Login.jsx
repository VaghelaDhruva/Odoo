import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Grid, Link, InputAdornment, Alert, CircularProgress } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import toast from 'react-hot-toast';

// Demo credentials
const DEMO_CREDENTIALS = {
    Admin: {
        email: 'admin@dayflow.com',
        password: 'Password123!',
    },
    Employee: {
        email: 'john.doe@dayflow.com',
        password: 'Password123!',
    },
};

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState('Admin');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleDemoClick = (role) => {
        setSelectedRole(role);
        const credentials = DEMO_CREDENTIALS[role];
        setEmail(credentials.email);
        setPassword(credentials.password);
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email || !password) {
            setError('Please enter both email and password');
            setLoading(false);
            return;
        }

        try {
            const result = await login(email, password);
            if (result.success) {
                toast.success('Login successful!');
                navigate('/dashboard');
            } else {
                const errorMsg = result.error || 'Login failed. Please check your credentials.';
                setError(errorMsg);
                toast.error(errorMsg);
                console.error('Login failed:', result);
            }
        } catch (err) {
            console.error('Login error:', err);
            const errorMsg = err.message || 'An error occurred during login. Please ensure the backend server is running.';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: 'background.default'
            }}
        >
            <Paper elevation={0} sx={{ p: 4, width: '100%', maxWidth: 400, borderRadius: 2, border: '1px solid #E5E7EB' }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Box
                        component="img"
                        src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                        sx={{ height: 48, width: 48, mb: 2, borderRadius: 1 }}
                    />
                    <Typography variant="h5" fontWeight="700" color="primary">Dayflow HRMS</Typography>
                    <Typography variant="body2" color="text.secondary">Sign in to your account</Typography>
                </Box>

                <form onSubmit={handleLogin}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {error && (
                            <Alert severity="error" onClose={() => setError('')}>
                                {error}
                            </Alert>
                        )}

                        <TextField
                            label="Email Address"
                            variant="outlined"
                            fullWidth
                            placeholder="admin@dayflow.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <TextField
                            label="Password"
                            type="password"
                            variant="outlined"
                            fullWidth
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            required
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <Button
                                variant={selectedRole === 'Admin' ? 'contained' : 'outlined'}
                                onClick={() => handleDemoClick('Admin')}
                                fullWidth
                                size="small"
                                disabled={loading}
                            >
                                Admin Demo
                            </Button>
                            <Button
                                variant={selectedRole === 'Employee' ? 'contained' : 'outlined'}
                                onClick={() => handleDemoClick('Employee')}
                                fullWidth
                                size="small"
                                disabled={loading}
                            >
                                Employee Demo
                            </Button>
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={loading}
                            sx={{ py: 1.5, fontSize: '1rem' }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                        </Button>
                    </Box>
                </form>

                <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        Don't have an account? <Link href="#" fontWeight="600">Contact Support</Link>
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default Login;

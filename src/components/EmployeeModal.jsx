import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Grid,
    Box,
    Typography,
    Avatar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';

const roles = ['Software Engineer', 'Product Manager', 'HR Specialist', 'Designer', 'Sales Manager'];
const departments = ['Engineering', 'Product', 'Human Resources', 'Design', 'Sales'];
const statuses = ['Active', 'On Leave', 'Terminated'];

const EmployeeModal = ({ open, onClose, onSave, employee }) => {
    const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
        defaultValues: {
            name: '',
            email: '',
            role: '',
            department: '',
            status: 'Active',
            joinDate: null,
        },
    });

    useEffect(() => {
        if (employee) {
            setValue('name', employee.name);
            setValue('email', employee.email);
            setValue('role', employee.role);
            setValue('department', employee.department);
            setValue('status', employee.status);
            setValue('joinDate', employee.joinDate ? dayjs(employee.joinDate) : null);
        } else {
            reset({
                name: '',
                email: '',
                role: '',
                department: '',
                status: 'Active',
                joinDate: null,
            });
        }
    }, [employee, setValue, reset, open]);

    const onSubmit = (data) => {
        onSave({
            ...data,
            id: employee ? employee.id : null,
            // Mocking an avatar if new
            avatar: employee?.avatar || `https://i.pravatar.cc/150?u=${Math.random()}`
        });
        onClose();
        reset();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {employee ? 'Edit Employee' : 'Add New Employee'}
            </DialogTitle>
            <form onSubmit={handleSubmit(onSubmit)}>
                <DialogContent dividers>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <Avatar
                            src={employee?.avatar}
                            sx={{ width: 80, height: 80, bgcolor: 'primary.light' }}
                        >
                            {!employee?.avatar && 'N/A'}
                        </Avatar>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Controller
                                name="name"
                                control={control}
                                rules={{ required: 'Name is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Full Name"
                                        fullWidth
                                        error={!!errors.name}
                                        helperText={errors.name?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Controller
                                name="email"
                                control={control}
                                rules={{
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address"
                                    }
                                }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        label="Email"
                                        fullWidth
                                        error={!!errors.email}
                                        helperText={errors.email?.message}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller
                                name="role"
                                control={control}
                                rules={{ required: 'Role is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Role"
                                        fullWidth
                                        error={!!errors.role}
                                        helperText={errors.role?.message}
                                    >
                                        {roles.map((role) => (
                                            <MenuItem key={role} value={role}>
                                                {role}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller
                                name="department"
                                control={control}
                                rules={{ required: 'Department is required' }}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Department"
                                        fullWidth
                                        error={!!errors.department}
                                        helperText={errors.department?.message}
                                    >
                                        {departments.map((dept) => (
                                            <MenuItem key={dept} value={dept}>
                                                {dept}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        select
                                        label="Status"
                                        fullWidth
                                    >
                                        {statuses.map((status) => (
                                            <MenuItem key={status} value={status}>
                                                {status}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                )}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <Controller
                                name="joinDate"
                                control={control}
                                render={({ field }) => (
                                    <DatePicker
                                        label="Join Date"
                                        value={field.value}
                                        onChange={(newValue) => field.onChange(newValue)}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                )}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={onClose} color="inherit">
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default EmployeeModal;

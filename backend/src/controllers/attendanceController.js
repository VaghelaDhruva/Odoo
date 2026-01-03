import * as attendanceService from '../services/attendanceService.js';

export const checkIn = async (req, res, next) => {
  try {
    const attendance = await attendanceService.checkIn(req.user.id, req.body.date, req);
    res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const checkOut = async (req, res, next) => {
  try {
    const attendance = await attendanceService.checkOut(req.user.id, req.body.date, req);
    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const attendances = await attendanceService.getMyAttendance(req.user.id, req.query);
    res.status(200).json({
      success: true,
      data: attendances,
      count: attendances.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllAttendance = async (req, res, next) => {
  try {
    const attendances = await attendanceService.getAllAttendance(req.query);
    res.status(200).json({
      success: true,
      data: attendances,
      count: attendances.length,
    });
  } catch (error) {
    next(error);
  }
};


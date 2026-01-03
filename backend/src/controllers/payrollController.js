import * as payrollService from '../services/payrollService.js';

export const getMyPayroll = async (req, res, next) => {
  try {
    const payrolls = await payrollService.getMyPayroll(req.user.id, req.query);
    res.status(200).json({
      success: true,
      data: payrolls,
      count: payrolls.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllPayroll = async (req, res, next) => {
  try {
    const payrolls = await payrollService.getAllPayroll(req.query);
    res.status(200).json({
      success: true,
      data: payrolls,
      count: payrolls.length,
    });
  } catch (error) {
    next(error);
  }
};

export const createPayroll = async (req, res, next) => {
  try {
    const payroll = await payrollService.createPayroll(req.body, req);
    res.status(201).json({
      success: true,
      message: 'Payroll created successfully',
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePayroll = async (req, res, next) => {
  try {
    const payroll = await payrollService.updatePayroll(req.params.id, req.body, req);
    res.status(200).json({
      success: true,
      message: 'Payroll updated successfully',
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
};


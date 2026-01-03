import * as dashboardService from '../services/dashboardService.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const dashboard = await dashboardService.getAdminDashboard();
    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const dashboard = await dashboardService.getEmployeeDashboard(req.user.id);
    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};


import * as leaveService from '../services/leaveService.js';

export const createLeaveRequest = async (req, res, next) => {
  try {
    const leaveRequest = await leaveService.createLeaveRequest(req.user.id, req.body, req);
    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyLeaveRequests = async (req, res, next) => {
  try {
    const leaveRequests = await leaveService.getMyLeaveRequests(req.user.id, req.query);
    res.status(200).json({
      success: true,
      data: leaveRequests,
      count: leaveRequests.length,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllLeaveRequests = async (req, res, next) => {
  try {
    const leaveRequests = await leaveService.getAllLeaveRequests(req.query);
    res.status(200).json({
      success: true,
      data: leaveRequests,
      count: leaveRequests.length,
    });
  } catch (error) {
    next(error);
  }
};

export const approveLeaveRequest = async (req, res, next) => {
  try {
    const leaveRequest = await leaveService.approveLeaveRequest(
      req.params.id,
      req.user.id,
      req.body.adminComment,
      req
    );
    res.status(200).json({
      success: true,
      message: 'Leave request approved successfully',
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectLeaveRequest = async (req, res, next) => {
  try {
    const leaveRequest = await leaveService.rejectLeaveRequest(
      req.params.id,
      req.user.id,
      req.body.adminComment,
      req
    );
    res.status(200).json({
      success: true,
      message: 'Leave request rejected',
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, comments } = req.body;
    const leaveRequest = await leaveService.updateLeaveStatus(
      req.params.id,
      req.user.id,
      status,
      comments,
      req
    );
    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully`,
      data: leaveRequest,
    });
  } catch (error) {
    next(error);
  }
};


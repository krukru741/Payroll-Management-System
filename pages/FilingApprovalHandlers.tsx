// Approval/Rejection handlers for Filing requests
// Add these functions to Filing.tsx after the submission handlers

// Handle leave approval
const handleApproveLeave = async () => {
  if (!selectedLeave) return;
  
  setSubmitting(true);
  setError('');
  
  try {
    await api.post(`/leaves/${selectedLeave.id}/approve`, {
      reviewNotes
    });
    
    // Update the request in the list
    setLeaveRequests(leaveRequests.map(req => 
      req.id === selectedLeave.id 
        ? { ...req, status: 'APPROVED', reviewNotes }
        : req
    ));
    
    setShowViewLeaveModal(false);
    setSelectedLeave(null);
    setReviewNotes('');
    alert('Leave request approved successfully!');
    fetchAllRequests(); // Refresh to get updated data
  } catch (err: any) {
    setError(err.response?.data?.error || 'Failed to approve leave request');
  } finally {
    setSubmitting(false);
  }
};

// Handle leave rejection
const handleRejectLeave = async () => {
  if (!selectedLeave || !reviewNotes.trim()) {
    setError('Please provide a reason for rejection');
    return;
  }
  
  setSubmitting(true);
  setError('');
  
  try {
    await api.post(`/leaves/${selectedLeave.id}/reject`, {
      reviewNotes
    });
    
    setLeaveRequests(leaveRequests.map(req => 
      req.id === selectedLeave.id 
        ? { ...req, status: 'REJECTED', reviewNotes }
        : req
    ));
    
    setShowViewLeaveModal(false);
    setSelectedLeave(null);
    setReviewNotes('');
    alert('Leave request rejected');
    fetchAllRequests();
  } catch (err: any) {
    setError(err.response?.data?.error || 'Failed to reject leave request');
  } finally {
    setSubmitting(false);
  }
};

// Handle overtime approval
const handleApproveOvertime = async () => {
  if (!selectedOvertime) return;
  
  setSubmitting(true);
  setError('');
  
  try {
    await api.post(`/overtime/${selectedOvertime.id}/approve`, {
      reviewNotes
    });
    
    setOvertimeRequests(overtimeRequests.map(req => 
      req.id === selectedOvertime.id 
        ? { ...req, status: 'APPROVED', reviewNotes }
        : req
    ));
    
    setShowViewOvertimeModal(false);
    setSelectedOvertime(null);
    setReviewNotes('');
    alert('Overtime request approved successfully!');
    fetchAllRequests();
  } catch (err: any) {
    setError(err.response?.data?.error || 'Failed to approve overtime request');
  } finally {
    setSubmitting(false);
  }
};

// Handle overtime rejection
const handleRejectOvertime = async () => {
  if (!selectedOvertime || !reviewNotes.trim()) {
    setError('Please provide a reason for rejection');
    return;
  }
  
  setSubmitting(true);
  setError('');
  
  try {
    await api.post(`/overtime/${selectedOvertime.id}/reject`, {
      reviewNotes
    });
    
    setOvertimeRequests(overtimeRequests.map(req => 
      req.id === selectedOvertime.id 
        ? { ...req, status: 'REJECTED', reviewNotes }
        : req
    ));
    
    setShowViewOvertimeModal(false);
    setSelectedOvertime(null);
    setReviewNotes('');
    alert('Overtime request rejected');
    fetchAllRequests();
  } catch (err: any) {
    setError(err.response?.data?.error || 'Failed to reject overtime request');
  } finally {
    setSubmitting(false);
  }
};

// Handle cash advance manager approval
const handleApproveCashAdvance = async () => {
  if (!selectedCashAdvance) return;
  
  setSubmitting(true);
  setError('');
  
  try {
    // Determine which approval endpoint to use based on user role
    const endpoint = user?.role === 'ADMIN' 
      ? `/cash-advance/${selectedCashAdvance.id}/approve-admin`
      : `/cash-advance/${selectedCashAdvance.id}/approve-manager`;
    
    await api.post(endpoint, {
      notes: reviewNotes
    });
    
    setCashAdvanceRequests(cashAdvanceRequests.map(req => 
      req.id === selectedCashAdvance.id 
        ? { ...req, managerApproval: user?.role === 'MANAGER' ? 'APPROVED' : req.managerApproval,
                    adminApproval: user?.role === 'ADMIN' ? 'APPROVED' : req.adminApproval }
        : req
    ));
    
    setShowViewCashAdvanceModal(false);
    setSelectedCashAdvance(null);
    setReviewNotes('');
    alert('Cash advance request approved!');
    fetchAllRequests();
  } catch (err: any) {
    setError(err.response?.data?.error || 'Failed to approve cash advance request');
  } finally {
    setSubmitting(false);
  }
};

// Handle cash advance rejection
const handleRejectCashAdvance = async () => {
  if (!selectedCashAdvance || !reviewNotes.trim()) {
    setError('Please provide a reason for rejection');
    return;
  }
  
  setSubmitting(true);
  setError('');
  
  try {
    await api.post(`/cash-advance/${selectedCashAdvance.id}/reject`, {
      notes: reviewNotes
    });
    
    setCashAdvanceRequests(cashAdvanceRequests.map(req => 
      req.id === selectedCashAdvance.id 
        ? { ...req, status: 'REJECTED' }
        : req
    ));
    
    setShowViewCashAdvanceModal(false);
    setSelectedCashAdvance(null);
    setReviewNotes('');
    alert('Cash advance request rejected');
    fetchAllRequests();
  } catch (err: any) {
    setError(err.response?.data?.error || 'Failed to reject cash advance request');
  } finally {
    setSubmitting(false);
  }
};

// View handlers
const handleViewLeave = (leave: LeaveRequest) => {
  setSelectedLeave(leave);
  setReviewNotes(leave.reviewNotes || '');
  setShowViewLeaveModal(true);
};

const handleViewOvertime = (overtime: OvertimeRequest) => {
  setSelectedOvertime(overtime);
  setReviewNotes(overtime.reviewNotes || '');
  setShowViewOvertimeModal(true);
};

const handleViewCashAdvance = (cashAdvance: CashAdvanceRequest) => {
  setSelectedCashAdvance(cashAdvance);
  setReviewNotes('');
  setShowViewCashAdvanceModal(true);
};

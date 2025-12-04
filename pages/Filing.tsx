import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import api from '../lib/axios';
import Card from '../components/Card';
import Button from '../components/Button';
import ViewLeaveModal from '../modals/ViewLeaveModal';
import ViewOvertimeModal from '../modals/ViewOvertimeModal';
import ViewCashAdvanceModal from '../modals/ViewCashAdvanceModal';
import { 
  Plus, 
  Calendar, 
  Clock, 
  DollarSign, 
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText
} from 'lucide-react';

interface LeaveRequest {
  id: string;
  employeeId: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    department: string;
    position: string;
  };
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: string;
  reviewedBy?: {
    id: string;
    name: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

interface OvertimeRequest {
  id: string;
  employeeId: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    department: string;
    position: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  reason: string;
  projectTask?: string;
  status: string;
  overtimeRate?: number;
  overtimePay?: number;
  reviewedBy?: {
    id: string;
    name: string;
  };
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
}

interface CashAdvanceRequest {
  id: string;
  employeeId: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    department: string;
    position: string;
  };
  amount: number;
  reason: string;
  repaymentPlan: string;
  status: string;
  managerApproval: string;
  adminApproval: string;
  managerApprovedBy?: {
    id: string;
    name: string;
  };
  adminApprovedBy?: {
    id: string;
    name: string;
  };
  remainingBalance: number;
  createdAt: string;
}

const Filing: React.FC = () => {
  const { user } = useAuth();
  const { employees } = useData();
  
  const [activeTab, setActiveTab] = useState<'leave' | 'overtime' | 'cashadvance'>('leave');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
  const [cashAdvanceRequests, setCashAdvanceRequests] = useState<CashAdvanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Modal states
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [showCashAdvanceModal, setShowCashAdvanceModal] = useState(false);
  
  // View details modal states
  const [showViewLeaveModal, setShowViewLeaveModal] = useState(false);
  const [showViewOvertimeModal, setShowViewOvertimeModal] = useState(false);
  const [showViewCashAdvanceModal, setShowViewCashAdvanceModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [selectedOvertime, setSelectedOvertime] = useState<OvertimeRequest | null>(null);
  const [selectedCashAdvance, setSelectedCashAdvance] = useState<CashAdvanceRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  
  // Leave form state (simplified - no endDate/totalDays)
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'VACATION',
    startDate: '',
    reason: ''
  });

  // Overtime form state (simplified - no endTime/totalHours)
  const [overtimeForm, setOvertimeForm] = useState({
    date: '',
    startTime: '',
    reason: '',
    projectTask: ''
  });

  // Cash Advance form state
  const [cashAdvanceForm, setCashAdvanceForm] = useState({
    amount: '',
    reason: '',
    repaymentPlan: 'Next Payroll'
  });
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState<string>('');

  // Fetch all requests
  useEffect(() => {
    fetchAllRequests();
  }, [user]);

  const fetchAllRequests = async () => {
    setLoading(true);
    try {
      const params = user?.role === 'EMPLOYEE' ? { employeeId: user.employeeId } : {};
      
      const [leaveRes, overtimeRes, cashAdvanceRes] = await Promise.all([
        api.get('/leaves', { params }),
        api.get('/overtime', { params }),
        api.get('/cash-advance', { params })
      ]);

      setLeaveRequests(leaveRes.data);
      setOvertimeRequests(overtimeRes.data);
      setCashAdvanceRequests(cashAdvanceRes.data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = useMemo(() => {
    const allRequests = [
      ...leaveRequests.map(r => ({ ...r, type: 'leave' })),
      ...overtimeRequests.map(r => ({ ...r, type: 'overtime' })),
      ...cashAdvanceRequests.map(r => ({ ...r, type: 'cashadvance' }))
    ];

    return {
      pending: allRequests.filter(r => r.status === 'PENDING').length,
      approved: allRequests.filter(r => r.status === 'APPROVED').length,
      rejected: allRequests.filter(r => r.status === 'REJECTED').length,
      total: allRequests.length
    };
  }, [leaveRequests, overtimeRequests, cashAdvanceRequests]);

  // Filter requests by status
  const filteredLeaveRequests = useMemo(() => {
    if (statusFilter === 'all') return leaveRequests;
    return leaveRequests.filter(r => r.status === statusFilter.toUpperCase());
  }, [leaveRequests, statusFilter]);

  const filteredOvertimeRequests = useMemo(() => {
    if (statusFilter === 'all') return overtimeRequests;
    return overtimeRequests.filter(r => r.status === statusFilter.toUpperCase());
  }, [overtimeRequests, statusFilter]);

  const filteredCashAdvanceRequests = useMemo(() => {
    if (statusFilter === 'all') return cashAdvanceRequests;
    return cashAdvanceRequests.filter(r => r.status === statusFilter.toUpperCase());
  }, [cashAdvanceRequests, statusFilter]);

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  // Calculate total days between dates
  const calculateTotalDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
    return diffDays;
  };

  // Calculate total hours between times
  const calculateTotalHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startTime = new Date(`2000-01-01T${start}`);
    const endTime = new Date(`2000-01-01T${end}`);
    const diffMs = endTime.getTime() - startTime.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    return Math.max(0, Math.round(hours * 100) / 100); // Round to 2 decimal places
  };

  // Handle leave form submission (auto-calculation workflow)
  const handleLeaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!user?.employeeId) {
        throw new Error('Employee ID not found');
      }

      const response = await api.post('/leaves/request', {
        employeeId: user.employeeId,
        leaveType: leaveForm.leaveType,
        startDate: leaveForm.startDate,
        reason: leaveForm.reason
        // endDate and totalDays removed - will be auto-calculated on clock-in
      });

      setLeaveRequests([response.data, ...leaveRequests]);
      setShowLeaveModal(false);
      setLeaveForm({
        leaveType: 'VACATION',
        startDate: '',
        reason: ''
      });
      alert('Leave request submitted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle overtime form submission (auto-calculation workflow)
  const handleOvertimeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!user?.employeeId) {
        throw new Error('Employee ID not found');
      }

      // Combine date with start time to create full DateTime string
      const startDateTime = `${overtimeForm.date}T${overtimeForm.startTime}:00`;

      const response = await api.post('/overtime/request', {
        employeeId: user.employeeId,
        date: overtimeForm.date,
        startTime: startDateTime,
        reason: overtimeForm.reason,
        projectTask: overtimeForm.projectTask || null
        // endTime and totalHours removed - will be auto-calculated on clock-out
      });

      setOvertimeRequests([response.data, ...overtimeRequests]);
      setShowOvertimeModal(false);
      setOvertimeForm({
        date: '',
        startTime: '',
        reason: '',
        projectTask: ''
      });
      alert('Overtime request submitted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit overtime request');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle cash advance form submission
  const handleCashAdvanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!user?.employeeId) {
        throw new Error('Employee ID not found');
      }

      const response = await api.post('/cash-advance/request', {
        employeeId: user.employeeId,
        amount: parseFloat(cashAdvanceForm.amount),
        reason: cashAdvanceForm.reason,
        repaymentPlan: cashAdvanceForm.repaymentPlan
      });

      setCashAdvanceRequests([response.data, ...cashAdvanceRequests]);
      setShowCashAdvanceModal(false);
      setCashAdvanceForm({
        amount: '',
        reason: '',
        repaymentPlan: 'Next Payroll'
      });
      alert('Cash advance request submitted successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit cash advance request');
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

  // Approval/Rejection handlers
  const handleApproveLeave = async () => {
    if (!selectedLeave) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      await api.post(`/leaves/${selectedLeave.id}/approve`, { reviewNotes });
      
      alert('Leave request approved successfully!');
      setShowViewLeaveModal(false);
      setSelectedLeave(null);
      setReviewNotes('');
      fetchAllRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectLeave = async () => {
    if (!selectedLeave || !reviewNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await api.post(`/leaves/${selectedLeave.id}/reject`, { reviewNotes });
      
      alert('Leave request rejected');
      setShowViewLeaveModal(false);
      setSelectedLeave(null);
      setReviewNotes('');
      fetchAllRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveOvertime = async () => {
    if (!selectedOvertime) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      await api.post(`/overtime/${selectedOvertime.id}/approve`, { reviewNotes });
      
      alert('Overtime request approved successfully!');
      setShowViewOvertimeModal(false);
      setSelectedOvertime(null);
      setReviewNotes('');
      fetchAllRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve overtime request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectOvertime = async () => {
    if (!selectedOvertime || !reviewNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      await api.post(`/overtime/${selectedOvertime.id}/reject`, { reviewNotes });
      
      alert('Overtime request rejected');
      setShowViewOvertimeModal(false);
      setSelectedOvertime(null);
      setReviewNotes('');
      fetchAllRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject overtime request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveCashAdvance = async () => {
    if (!selectedCashAdvance) return;
    
    setSubmitting(true);
    setError('');
    
    try {
      const isAdmin = user?.role === 'ADMIN';
      const endpoint = isAdmin
        ? `/cash-advance/${selectedCashAdvance.id}/admin-approve`
        : `/cash-advance/${selectedCashAdvance.id}/manager-approve`;
      
      const body = isAdmin 
        ? { adminNotes: reviewNotes }
        : { managerNotes: reviewNotes };
      
      await api.post(endpoint, body);
      
      alert('Cash advance request approved!');
      setShowViewCashAdvanceModal(false);
      setSelectedCashAdvance(null);
      setReviewNotes('');
      fetchAllRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to approve cash advance request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectCashAdvance = async () => {
    if (!selectedCashAdvance || !reviewNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const rejectedBy = user?.role === 'ADMIN' ? 'admin' : 'manager';
      
      await api.post(`/cash-advance/${selectedCashAdvance.id}/reject`, { 
        reviewNotes,
        rejectedBy 
      });
      
      alert('Cash advance request rejected');
      setShowViewCashAdvanceModal(false);
      setSelectedCashAdvance(null);
      setReviewNotes('');
      fetchAllRequests();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject cash advance request');
    } finally {
      setSubmitting(false);
    }
  };

  // Update leave form when dates change
  useEffect(() => {
    if (leaveForm.startDate && leaveForm.endDate) {
      const days = calculateTotalDays(leaveForm.startDate, leaveForm.endDate);
      setLeaveForm(prev => ({ ...prev, totalDays: days }));
    }
  }, [leaveForm.startDate, leaveForm.endDate]);

  // Update overtime form when times change
  useEffect(() => {
    if (overtimeForm.startTime && overtimeForm.endTime) {
      const hours = calculateTotalHours(overtimeForm.startTime, overtimeForm.endTime);
      setOvertimeForm(prev => ({ ...prev, totalHours: hours }));
    }
  }, [overtimeForm.startTime, overtimeForm.endTime]);

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Filing</h2>
          <p className="text-gray-500 text-xs">Manage leave, overtime, and cash advance requests</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowLeaveModal(true)} className="flex items-center gap-2">
            <Calendar size={14} /> <span className="hidden sm:inline">File Leave</span>
          </Button>
          <Button size="sm" onClick={() => setShowOvertimeModal(true)} className="flex items-center gap-2">
            <Clock size={14} /> <span className="hidden sm:inline">File Overtime</span>
          </Button>
          <Button size="sm" onClick={() => setShowCashAdvanceModal(true)} className="flex items-center gap-2">
            <DollarSign size={14} /> <span className="hidden sm:inline">Request Cash Advance</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Total Requests</p>
            <h3 className="text-xl font-bold text-gray-900">{stats.total}</h3>
          </div>
          <div className="p-2 bg-blue-50 rounded-full text-blue-600">
            <FileText size={16} />
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Pending</p>
            <h3 className="text-xl font-bold text-yellow-600">{stats.pending}</h3>
          </div>
          <div className="p-2 bg-yellow-50 rounded-full text-yellow-600">
            <AlertCircle size={16} />
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Approved</p>
            <h3 className="text-xl font-bold text-green-600">{stats.approved}</h3>
          </div>
          <div className="p-2 bg-green-50 rounded-full text-green-600">
            <CheckCircle size={16} />
          </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Rejected</p>
            <h3 className="text-xl font-bold text-red-600">{stats.rejected}</h3>
          </div>
          <div className="p-2 bg-red-50 rounded-full text-red-600">
            <XCircle size={16} />
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('leave')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'leave'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Leave Requests
          </button>
          <button
            onClick={() => setActiveTab('overtime')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'overtime'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Overtime Requests
          </button>
          <button
            onClick={() => setActiveTab('cashadvance')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              activeTab === 'cashadvance'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            Cash Advance Requests
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <Card title={
        activeTab === 'leave' ? 'Leave Requests' :
        activeTab === 'overtime' ? 'Overtime Requests' :
        'Cash Advance Requests'
      }>
        <div className="overflow-x-auto">
          {activeTab === 'leave' && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Employee</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Leave Type</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Period</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Days</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Reason</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Status</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-xs text-gray-500">Loading...</td>
                  </tr>
                ) : filteredLeaveRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-xs text-gray-500">No leave requests found</td>
                  </tr>
                ) : (
                  filteredLeaveRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-gray-900">
                        {request.employee.lastName}, {request.employee.firstName}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-600">{request.leaveType.replace('_', ' ')}</td>
                      <td className="py-2 px-3 text-xs text-gray-600">
                        {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3 text-center text-xs font-mono">{request.totalDays}</td>
                      <td className="py-2 px-3 text-xs text-gray-600 max-w-xs truncate">{request.reason}</td>
                      <td className="py-2 px-3 text-center">{getStatusBadge(request.status)}</td>
                      <td className="py-2 px-3 text-center">
                        <Button size="sm" variant="ghost" onClick={() => handleViewLeave(request)}>View</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'overtime' && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Employee</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Date</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Time</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Hours</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Rate</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Pay</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Status</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-xs text-gray-500">Loading...</td>
                  </tr>
                ) : filteredOvertimeRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-4 text-center text-xs text-gray-500">No overtime requests found</td>
                  </tr>
                ) : (
                  filteredOvertimeRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-gray-900">
                        {request.employee.lastName}, {request.employee.firstName}
                      </td>
                      <td className="py-2 px-3 text-xs text-gray-600">{new Date(request.date).toLocaleDateString()}</td>
                      <td className="py-2 px-3 text-xs font-mono text-gray-600">
                        {new Date(request.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                        {new Date(request.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2 px-3 text-center text-xs font-mono">{request.totalHours}</td>
                      <td className="py-2 px-3 text-center text-xs font-mono">{request.overtimeRate}x</td>
                      <td className="py-2 px-3 text-center text-xs font-mono">₱{request.overtimePay?.toFixed(2) || '-'}</td>
                      <td className="py-2 px-3 text-center">{getStatusBadge(request.status)}</td>
                      <td className="py-2 px-3 text-center">
                        <Button size="sm" variant="ghost" onClick={() => handleViewOvertime(request)}>View</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === 'cashadvance' && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Employee</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-right">Amount</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Repayment Plan</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Manager</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Admin</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Status</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-xs text-gray-500">Loading...</td>
                  </tr>
                ) : filteredCashAdvanceRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-4 text-center text-xs text-gray-500">No cash advance requests found</td>
                  </tr>
                ) : (
                  filteredCashAdvanceRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-3 text-xs font-medium text-gray-900">
                        {request.employee.lastName}, {request.employee.firstName}
                      </td>
                      <td className="py-2 px-3 text-right text-xs font-mono text-gray-900">₱{request.amount.toFixed(2)}</td>
                      <td className="py-2 px-3 text-xs text-gray-600">{request.repaymentPlan}</td>
                      <td className="py-2 px-3 text-center">{getStatusBadge(request.managerApproval)}</td>
                      <td className="py-2 px-3 text-center">{getStatusBadge(request.adminApproval)}</td>
                      <td className="py-2 px-3 text-center">{getStatusBadge(request.status)}</td>
                      <td className="py-2 px-3 text-center">
                        <Button size="sm" variant="ghost" onClick={() => handleViewCashAdvance(request)}>View</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowLeaveModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">File Leave Request</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="VACATION">Vacation Leave</option>
                  <option value="SICK_LEAVE">Sick Leave</option>
                  <option value="EMERGENCY_LEAVE">Emergency Leave</option>
                  <option value="MATERNITY_LEAVE">Maternity Leave</option>
                  <option value="PATERNITY_LEAVE">Paternity Leave</option>
                  <option value="BEREAVEMENT_LEAVE">Bereavement Leave</option>
                  <option value="UNPAID_LEAVE">Unpaid Leave</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>ℹ️ Auto-Calculation:</strong> Your leave will automatically end when you clock in again. 
                  The total days will be calculated at that time.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  rows={3}
                  className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Please provide a reason for your leave request..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowLeaveModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Overtime Request Modal */}
      {showOvertimeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowOvertimeModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">File Overtime Request</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleOvertimeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={overtimeForm.date}
                    onChange={(e) => setOvertimeForm({ ...overtimeForm, date: e.target.value })}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={overtimeForm.startTime}
                    onChange={(e) => setOvertimeForm({ ...overtimeForm, startTime: e.target.value })}
                    className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>ℹ️ Auto-Calculation:</strong> Your overtime will automatically end when you clock out. 
                  Hours and pay will be calculated at that time.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={overtimeForm.reason}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, reason: e.target.value })}
                  rows={2}
                  className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Why is overtime needed?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project/Task (Optional)</label>
                <input
                  type="text"
                  value={overtimeForm.projectTask}
                  onChange={(e) => setOvertimeForm({ ...overtimeForm, projectTask: e.target.value })}
                  className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="What did you work on?"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowOvertimeModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cash Advance Request Modal */}
      {showCashAdvanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowCashAdvanceModal(false)}>
          <div className="bg-white rounded-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Request Cash Advance</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleCashAdvanceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                  <input
                    type="number"
                    value={cashAdvanceForm.amount}
                    onChange={(e) => setCashAdvanceForm({ ...cashAdvanceForm, amount: e.target.value })}
                    step="0.01"
                    min="1"
                    className="w-full pl-8 border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                    placeholder="0.00"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Maximum 50% of your monthly salary</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Repayment Plan</label>
                <select
                  value={cashAdvanceForm.repaymentPlan}
                  onChange={(e) => setCashAdvanceForm({ ...cashAdvanceForm, repaymentPlan: e.target.value })}
                  className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="Next Payroll">Next Payroll (Full Amount)</option>
                  <option value="2 Months">2 Months</option>
                  <option value="3 Months">3 Months</option>
                  <option value="4 Months">4 Months</option>
                  <option value="6 Months">6 Months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea
                  value={cashAdvanceForm.reason}
                  onChange={(e) => setCashAdvanceForm({ ...cashAdvanceForm, reason: e.target.value })}
                  rows={3}
                  className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Please provide a reason for your cash advance request..."
                  required
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Note:</strong> Cash advance requests require approval from both your manager and admin. 
                  The amount will be automatically deducted from your payroll based on the selected repayment plan.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowCashAdvanceModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View/Approval Modals */}
      <ViewLeaveModal
        isOpen={showViewLeaveModal}
        onClose={() => {
          setShowViewLeaveModal(false);
          setSelectedLeave(null);
          setReviewNotes('');
          setError('');
        }}
        leave={selectedLeave}
        reviewNotes={reviewNotes}
        setReviewNotes={setReviewNotes}
        onApprove={handleApproveLeave}
        onReject={handleRejectLeave}
        submitting={submitting}
        error={error}
        userRole={user?.role}
      />

      <ViewOvertimeModal
        isOpen={showViewOvertimeModal}
        onClose={() => {
          setShowViewOvertimeModal(false);
          setSelectedOvertime(null);
          setReviewNotes('');
          setError('');
        }}
        overtime={selectedOvertime}
        reviewNotes={reviewNotes}
        setReviewNotes={setReviewNotes}
        onApprove={handleApproveOvertime}
        onReject={handleRejectOvertime}
        submitting={submitting}
        error={error}
        userRole={user?.role}
      />

      <ViewCashAdvanceModal
        isOpen={showViewCashAdvanceModal}
        onClose={() => {
          setShowViewCashAdvanceModal(false);
          setSelectedCashAdvance(null);
          setReviewNotes('');
          setError('');
        }}
        cashAdvance={selectedCashAdvance}
        reviewNotes={reviewNotes}
        setReviewNotes={setReviewNotes}
        onApprove={handleApproveCashAdvance}
        onReject={handleRejectCashAdvance}
        submitting={submitting}
        error={error}
        userRole={user?.role}
      />
    </div>
  );
};

export default Filing;

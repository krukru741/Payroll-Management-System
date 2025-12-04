import React from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';

// Type definition (matches Filing.tsx)
interface LeaveRequest {
  id: string;
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
    department: string;
    position: string;
  };
  leaveType: string;
  startDate: string;
  endDate?: string;
  totalDays?: number;
  reason: string;
  status: string;
  reviewNotes?: string;
  createdAt: string;
}

interface ViewLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  leave: LeaveRequest | null;
  reviewNotes: string;
  setReviewNotes: (notes: string) => void;
  onApprove: () => void;
  onReject: () => void;
  submitting: boolean;
  error: string;
  userRole?: string;
}

const ViewLeaveModal: React.FC<ViewLeaveModalProps> = ({
  isOpen,
  onClose,
  leave,
  reviewNotes,
  setReviewNotes,
  onApprove,
  onReject,
  submitting,
  error,
  userRole
}) => {
  if (!leave) return null;

  const canApprove = userRole && ['ADMIN', 'MANAGER'].includes(userRole) && leave.status === 'PENDING';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Leave Request Details">
      <div className="space-y-4">
        {/* Employee Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Employee Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <p className="font-medium">{leave.employee.firstName} {leave.employee.lastName}</p>
            </div>
            <div>
              <span className="text-gray-500">Department:</span>
              <p className="font-medium">{leave.employee.department}</p>
            </div>
            <div>
              <span className="text-gray-500">Position:</span>
              <p className="font-medium">{leave.employee.position}</p>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <p className="font-medium">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  leave.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  leave.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  leave.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {leave.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Leave Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Leave Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Leave Type:</span>
              <span className="font-medium">{leave.leaveType.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Start Date:</span>
              <span className="font-medium">{new Date(leave.startDate).toLocaleDateString()}</span>
            </div>
            {leave.endDate && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">End Date:</span>
                  <span className="font-medium">{new Date(leave.endDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Days:</span>
                  <span className="font-medium">{leave.totalDays}</span>
                </div>
              </>
            )}
            {!leave.endDate && leave.status === 'APPROVED' && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
                ℹ️ Leave is active. End date will be calculated when employee clocks in.
              </div>
            )}
            <div className="pt-2 border-t">
              <span className="text-gray-500 block mb-1">Reason:</span>
              <p className="text-gray-900">{leave.reason}</p>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Filed on:</span>
              <span>{new Date(leave.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Review Notes */}
        {canApprove && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Notes {leave.status === 'PENDING' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder={leave.status === 'PENDING' ? "Add notes about your decision..." : "View review notes"}
              disabled={leave.status !== 'PENDING'}
            />
          </div>
        )}

        {!canApprove && leave.reviewNotes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
            <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">{leave.reviewNotes}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={submitting}
          >
            Close
          </Button>
          {canApprove && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={onReject}
                disabled={submitting}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                {submitting ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button
                type="button"
                onClick={onApprove}
                disabled={submitting}
              >
                {submitting ? 'Approving...' : 'Approve'}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ViewLeaveModal;

import React from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';

// Type definition (matches Filing.tsx)
interface OvertimeRequest {
  id: string;
  employeeId: string;
  employee: {
    firstName: string;
    lastName: string;
    department: string;
    position: string;
  };
  date: string;
  startTime: string;
  endTime?: string;
  totalHours?: number;
  overtimeRate: number;
  overtimePay?: number;
  reason: string;
  projectTask?: string;
  status: string;
  reviewNotes?: string;
  createdAt: string;
}

interface ViewOvertimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  overtime: OvertimeRequest | null;
  reviewNotes: string;
  setReviewNotes: (notes: string) => void;
  onApprove: () => void;
  onReject: () => void;
  submitting: boolean;
  error: string;
  userRole?: string;
}

const ViewOvertimeModal: React.FC<ViewOvertimeModalProps> = ({
  isOpen,
  onClose,
  overtime,
  reviewNotes,
  setReviewNotes,
  onApprove,
  onReject,
  submitting,
  error,
  userRole
}) => {
  if (!overtime) return null;

  const canApprove = userRole && ['ADMIN', 'MANAGER'].includes(userRole) && overtime.status === 'PENDING';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Overtime Request Details">
      <div className="space-y-4">
        {/* Employee Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Employee Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <p className="font-medium">{overtime.employee.firstName} {overtime.employee.lastName}</p>
            </div>
            <div>
              <span className="text-gray-500">Department:</span>
              <p className="font-medium">{overtime.employee.department}</p>
            </div>
            <div>
              <span className="text-gray-500">Position:</span>
              <p className="font-medium">{overtime.employee.position}</p>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <p className="font-medium">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  overtime.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  overtime.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  overtime.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {overtime.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Overtime Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Overtime Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span className="font-medium">{new Date(overtime.date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Start Time:</span>
              <span className="font-medium font-mono">
                {new Date(overtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            {overtime.endTime && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">End Time:</span>
                  <span className="font-medium font-mono">
                    {new Date(overtime.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Hours:</span>
                  <span className="font-medium font-mono">{overtime.totalHours} hrs</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Overtime Rate:</span>
                  <span className="font-medium font-mono">{overtime.overtimeRate}x</span>
                </div>
                {overtime.overtimePay && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Overtime Pay:</span>
                    <span className="font-medium font-mono">₱{overtime.overtimePay.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}
            {!overtime.endTime && overtime.status === 'APPROVED' && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-xs text-blue-800">
                ℹ️ Overtime is active. End time and pay will be calculated when employee clocks out.
              </div>
            )}
            <div className="pt-2 border-t">
              <span className="text-gray-500 block mb-1">Reason:</span>
              <p className="text-gray-900">{overtime.reason}</p>
            </div>
            {overtime.projectTask && (
              <div>
                <span className="text-gray-500 block mb-1">Project/Task:</span>
                <p className="text-gray-900">{overtime.projectTask}</p>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>Filed on:</span>
              <span>{new Date(overtime.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Review Notes */}
        {canApprove && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Notes {overtime.status === 'PENDING' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder={overtime.status === 'PENDING' ? "Add notes about your decision..." : "View review notes"}
              disabled={overtime.status !== 'PENDING'}
            />
          </div>
        )}

        {!canApprove && overtime.reviewNotes && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
            <p className="text-sm text-gray-600 bg-gray-50 rounded p-2">{overtime.reviewNotes}</p>
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

export default ViewOvertimeModal;

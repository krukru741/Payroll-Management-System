import React from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';

// Type definition (matches Filing.tsx)
interface CashAdvanceRequest {
  id: string;
  employeeId: string;
  employee: {
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
  remainingBalance: number;
  createdAt: string;
}

interface ViewCashAdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashAdvance: CashAdvanceRequest | null;
  reviewNotes: string;
  setReviewNotes: (notes: string) => void;
  onApprove: () => void;
  onReject: () => void;
  submitting: boolean;
  error: string;
  userRole?: string;
}

const ViewCashAdvanceModal: React.FC<ViewCashAdvanceModalProps> = ({
  isOpen,
  onClose,
  cashAdvance,
  reviewNotes,
  setReviewNotes,
  onApprove,
  onReject,
  submitting,
  error,
  userRole
}) => {
  if (!cashAdvance) return null;

  const canApprove = userRole && ['ADMIN', 'MANAGER'].includes(userRole) && cashAdvance.status === 'PENDING';
  const needsManagerApproval = cashAdvance.managerApproval === 'PENDING';
  const needsAdminApproval = cashAdvance.adminApproval === 'PENDING';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cash Advance Request Details">
      <div className="space-y-4">
        {/* Employee Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Employee Information</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Name:</span>
              <p className="font-medium">{cashAdvance.employee.firstName} {cashAdvance.employee.lastName}</p>
            </div>
            <div>
              <span className="text-gray-500">Department:</span>
              <p className="font-medium">{cashAdvance.employee.department}</p>
            </div>
            <div>
              <span className="text-gray-500">Position:</span>
              <p className="font-medium">{cashAdvance.employee.position}</p>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <p className="font-medium">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  cashAdvance.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                  cashAdvance.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                  cashAdvance.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {cashAdvance.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Cash Advance Details */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Cash Advance Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium font-mono text-lg">₱{cashAdvance.amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Repayment Plan:</span>
              <span className="font-medium">{cashAdvance.repaymentPlan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Remaining Balance:</span>
              <span className="font-medium font-mono">₱{cashAdvance.remainingBalance.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t">
              <span className="text-gray-500 block mb-1">Reason:</span>
              <p className="text-gray-900">{cashAdvance.reason}</p>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>Filed on:</span>
              <span>{new Date(cashAdvance.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Approval Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Approval Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Manager Approval:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                cashAdvance.managerApproval === 'APPROVED' ? 'bg-green-100 text-green-800' :
                cashAdvance.managerApproval === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {cashAdvance.managerApproval}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Admin Approval:</span>
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                cashAdvance.adminApproval === 'APPROVED' ? 'bg-green-100 text-green-800' :
                cashAdvance.adminApproval === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {cashAdvance.adminApproval}
              </span>
            </div>
          </div>
        </div>

        {/* Review Notes */}
        {canApprove && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Notes {cashAdvance.status === 'PENDING' && <span className="text-red-500">*</span>}
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
              placeholder={cashAdvance.status === 'PENDING' ? "Add notes about your decision..." : "View review notes"}
              disabled={cashAdvance.status !== 'PENDING'}
            />
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

export default ViewCashAdvanceModal;

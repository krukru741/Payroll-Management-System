import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import api from '../lib/axios';
import { Award, RefreshCw, Save } from 'lucide-react';

interface LeaveCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
}

const LeaveCreditsModal: React.FC<LeaveCreditsModalProps> = ({
  isOpen,
  onClose,
  employeeId,
  employeeName
}) => {
  const [credits, setCredits] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reason, setReason] = useState('');
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});

  const leaveTypeLabels: Record<string, string> = {
    VACATION: 'Vacation Leave',
    SICK_LEAVE: 'Sick Leave',
    EMERGENCY_LEAVE: 'Emergency Leave',
    MATERNITY_LEAVE: 'Maternity Leave',
    PATERNITY_LEAVE: 'Paternity Leave',
    BEREAVEMENT_LEAVE: 'Bereavement Leave',
    UNPAID_LEAVE: 'Unpaid Leave',
    OTHER: 'Other'
  };

  useEffect(() => {
    if (isOpen && employeeId) {
      fetchCredits();
    }
  }, [isOpen, employeeId]);

  const fetchCredits = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/leave-credits/${employeeId}`);
      setCredits(response.data);
      
      // Initialize adjustments with current credits
      const initialAdjustments: Record<string, number> = {};
      Object.keys(response.data.leaveCredits).forEach(leaveType => {
        initialAdjustments[leaveType] = response.data.leaveCredits[leaveType].credits;
      });
      setAdjustments(initialAdjustments);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch leave credits');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for this adjustment');
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      await api.post(`/leave-credits/${employeeId}/bulk-adjust`, {
        adjustments,
        reason
      });

      alert('Leave credits updated successfully!');
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update leave credits');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all leave credits to default values? This cannot be undone.')) {
      return;
    }

    try {
      setSaving(true);
      setError('');
      
      await api.post(`/leave-credits/${employeeId}/reset`);
      
      alert('Leave credits reset to defaults!');
      fetchCredits();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset leave credits');
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustment = (leaveType: string, value: number) => {
    setAdjustments(prev => ({
      ...prev,
      [leaveType]: Math.max(0, value)
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage Leave Credits - ${employeeName}`}>
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading credits...</div>
        ) : credits ? (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-blue-600" />
                <h4 className="font-semibold text-blue-900 text-sm">Leave Credits</h4>
              </div>
              <p className="text-xs text-blue-700">
                Adjust the number of leave days available for each leave type. Changes will be tracked with your reason.
              </p>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.keys(leaveTypeLabels).map(leaveType => (
                <div key={leaveType} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      {leaveTypeLabels[leaveType]}
                    </label>
                    {credits.leaveCredits[leaveType]?.isCustom && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={adjustments[leaveType] || 0}
                      onChange={(e) => handleAdjustment(leaveType, parseFloat(e.target.value) || 0)}
                      className="w-24 border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                    <span className="text-xs text-gray-500">days</span>
                    {credits.leaveCredits[leaveType]?.isCustom && (
                      <span className="text-xs text-gray-500">
                        (Last adjusted: {new Date(credits.leaveCredits[leaveType].adjustedAt).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                  {credits.leaveCredits[leaveType]?.reason && (
                    <p className="text-xs text-gray-500 mt-1 italic">
                      Reason: {credits.leaveCredits[leaveType].reason}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Adjustment <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                className="w-full border-gray-300 rounded-lg text-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., Annual credit renewal, Special allowance, Adjustment for..."
                required
              />
            </div>

            <div className="flex justify-between gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={handleReset}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <RefreshCw size={14} />
                Reset to Defaults
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !reason.trim()}
                  className="flex items-center gap-2"
                >
                  <Save size={14} />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </Modal>
  );
};

export default LeaveCreditsModal;

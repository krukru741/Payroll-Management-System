import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { PayrollResult } from '../utils/payroll';
import { Employee } from '../types';
import { Download } from 'lucide-react';
import { generatePayslipPDF } from '../utils/export';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { 
    emp: Employee; 
    data: PayrollResult; 
    cashAdvance?: number; 
    overtimeHours?: number; 
    lateMinutes?: number;
    daysAbsent?: number;
    absenceDeduction?: number;
  } | null;
  periodStart: string;
  periodEnd: string;
}

const PayslipModal: React.FC<PayslipModalProps> = ({ isOpen, onClose, data, periodStart, periodEnd }) => {
  if (!data) return null;

  const { emp, data: result, cashAdvance = 0, daysAbsent = 0, absenceDeduction = 0 } = data;

  const handleDownloadPDF = () => {
    generatePayslipPDF(emp, result, { start: periodStart, end: periodEnd });
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Payslip Preview"
    >
      <div className="space-y-4">
        {/* Payslip Header */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-4 rounded-lg border border-primary-200">
          <div className="flex justify-between items-start border-b border-primary-200 pb-3 mb-3">
             <div>
                <h2 className="text-lg font-bold text-primary-900">PAYSLIP</h2>
                <p className="text-xs text-primary-700">PayrollSys Inc.</p>
             </div>
             <div className="text-right">
                <p className="text-xs font-semibold text-primary-900">Period: {periodStart} - {periodEnd}</p>
                <p className="text-[10px] text-primary-600">Generated: {new Date().toLocaleDateString()}</p>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
               <span className="text-primary-600 block text-[10px] uppercase tracking-wider font-medium">Employee Name</span>
               <span className="font-semibold text-primary-900">{emp.lastName}, {emp.firstName}</span>
            </div>
             <div>
               <span className="text-primary-600 block text-[10px] uppercase tracking-wider font-medium">Employee ID</span>
               <span className="font-semibold text-primary-900">{emp.id}</span>
            </div>
             <div>
               <span className="text-primary-600 block text-[10px] uppercase tracking-wider font-medium">Department</span>
               <span className="font-medium text-primary-900">{emp.department}</span>
            </div>
             <div>
               <span className="text-primary-600 block text-[10px] uppercase tracking-wider font-medium">Position</span>
               <span className="font-medium text-primary-900">{emp.position}</span>
            </div>
          </div>
        </div>

        {/* Earnings Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b-2 border-green-500 pb-2 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-green-500 rounded"></span>
            Earnings
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Basic Pay (Semi-monthly)</span>
              <span className="font-mono font-semibold text-gray-900">₱{(emp.basicSalary / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Overtime Pay</span>
              <span className="font-mono font-semibold text-gray-900">₱{(result.grossPay - (emp.basicSalary / 2)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between pt-2 border-t-2 border-dashed border-gray-300 font-bold text-green-700">
              <span>GROSS PAY</span>
              <span className="text-base">₱{result.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>

        {/* Deductions Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b-2 border-red-500 pb-2 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-red-500 rounded"></span>
            Deductions
          </h4>
          
          {/* Government Contributions */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 bg-gray-50 px-2 py-1 rounded">Government Contributions</p>
            <div className="space-y-1.5 text-sm pl-2">
              <div className="flex justify-between">
                <span className="text-gray-600">SSS Contribution</span>
                <span className="font-mono text-gray-900">₱{result.deductions.sss.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">PhilHealth Contribution</span>
                <span className="font-mono text-gray-900">₱{result.deductions.philHealth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pag-IBIG Contribution</span>
                <span className="font-mono text-gray-900">₱{result.deductions.pagIbig.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Withholding Tax</span>
                <span className="font-mono text-gray-900">₱{result.deductions.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          {/* Other Deductions */}
          {(result.deductions.late > 0 || cashAdvance > 0 || absenceDeduction > 0) && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 bg-gray-50 px-2 py-1 rounded">Other Deductions</p>
              <div className="space-y-1.5 text-sm pl-2">
                {result.deductions.late > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Late Deduction</span>
                    <span className="font-mono text-gray-900">₱{result.deductions.late.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {absenceDeduction > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Absence Deduction ({daysAbsent} day{daysAbsent > 1 ? 's' : ''})</span>
                    <span className="font-mono text-gray-900">₱{absenceDeduction.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {cashAdvance > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cash Advance</span>
                    <span className="font-mono text-gray-900">₱{cashAdvance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Total Deductions */}
          <div className="flex justify-between pt-3 border-t-2 border-dashed border-gray-300 font-bold text-red-600">
            <span>TOTAL DEDUCTIONS</span>
            <span className="text-base">-₱{(result.deductions.total + cashAdvance + absenceDeduction).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {/* Net Pay */}
        <div className="bg-gradient-to-r from-primary-800 to-primary-900 text-white p-4 rounded-lg shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <span className="block text-primary-200 text-xs uppercase tracking-wider font-semibold">Net Pay</span>
              <span className="text-xs opacity-80">Take home pay</span>
            </div>
            <div className="text-2xl font-bold">
              ₱{(result.netPay - cashAdvance - absenceDeduction).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-gray-500 uppercase text-[10px] mb-1">Gross Pay</p>
              <p className="font-semibold text-gray-900">₱{result.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase text-[10px] mb-1">Deductions</p>
              <p className="font-semibold text-red-600">₱{(result.deductions.total + cashAdvance + absenceDeduction).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-gray-500 uppercase text-[10px] mb-1">Net Pay</p>
              <p className="font-semibold text-green-600">₱{(result.netPay - cashAdvance - absenceDeduction).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          <Button size="sm" onClick={handleDownloadPDF} className="flex items-center gap-2">
            <Download size={14} /> Download PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PayslipModal;
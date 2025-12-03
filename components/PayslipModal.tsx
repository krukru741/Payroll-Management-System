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
  data: { emp: Employee; data: PayrollResult } | null;
  periodStart: string;
  periodEnd: string;
}

const PayslipModal: React.FC<PayslipModalProps> = ({ isOpen, onClose, data, periodStart, periodEnd }) => {
  if (!data) return null;

  const { emp, data: result } = data;

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
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-start border-b border-gray-200 pb-3 mb-3">
             <div>
                <h2 className="text-base font-bold text-gray-900">PAYSLIP</h2>
                <p className="text-xs text-gray-500">PayrollSys Inc.</p>
             </div>
             <div className="text-right">
                <p className="text-xs font-semibold text-gray-900">Period: {periodStart} - {periodEnd}</p>
                <p className="text-[10px] text-gray-500">Date Generated: {new Date().toLocaleDateString()}</p>
             </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-xs mb-1">
            <div>
               <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Employee Name</span>
               <span className="font-semibold text-gray-900">{emp.lastName}, {emp.firstName}</span>
            </div>
             <div>
               <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Employee ID</span>
               <span className="font-semibold text-gray-900">{emp.id}</span>
            </div>
             <div>
               <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Department</span>
               <span className="font-medium text-gray-900">{emp.department}</span>
            </div>
             <div>
               <span className="text-gray-500 block text-[10px] uppercase tracking-wider">Position</span>
               <span className="font-medium text-gray-900">{emp.position}</span>
            </div>
          </div>
        </div>

        {/* Calculations Grid */}
        <div className="grid grid-cols-2 gap-4">
           {/* Earnings */}
           <div>
             <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Earnings</h4>
             <div className="space-y-1 text-xs">
               <div className="flex justify-between">
                 <span className="text-gray-600">Basic Pay (Semi-monthly)</span>
                 <span className="font-mono text-gray-900">₱{(emp.basicSalary / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Overtime</span>
                 <span className="font-mono text-gray-900">₱{(result.grossPay - (emp.basicSalary / 2)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="flex justify-between pt-1 border-t border-dashed border-gray-200 font-semibold">
                 <span>Total Earnings</span>
                 <span>₱{result.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
             </div>
           </div>

           {/* Deductions */}
           <div>
             <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-1 mb-2">Deductions</h4>
             <div className="space-y-1 text-xs">
               <div className="flex justify-between">
                 <span className="text-gray-600">SSS</span>
                 <span className="font-mono text-gray-900">₱{result.deductions.sss.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">PhilHealth</span>
                 <span className="font-mono text-gray-900">₱{result.deductions.philHealth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Pag-IBIG</span>
                 <span className="font-mono text-gray-900">₱{result.deductions.pagIbig.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-gray-600">Withholding Tax</span>
                 <span className="font-mono text-gray-900">₱{result.deductions.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
               <div className="flex justify-between pt-1 border-t border-dashed border-gray-200 font-semibold text-red-600">
                 <span>Total Deductions</span>
                 <span>-₱{result.deductions.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
             </div>
           </div>
        </div>

        {/* Net Pay */}
        <div className="bg-primary-900 text-white p-3 rounded-lg flex justify-between items-center shadow-md">
           <div>
             <span className="block text-primary-200 text-[10px] uppercase tracking-wider font-semibold">Net Pay</span>
             <span className="text-[10px] opacity-70">Take home pay</span>
           </div>
           <div className="text-xl font-bold">
             ₱{result.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
           </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
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
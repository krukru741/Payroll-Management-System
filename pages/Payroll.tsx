
import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { MOCK_PAYROLL_SUMMARY, MOCK_EMPLOYEES } from '../constants';
import { processPayrollForEmployee, PayrollResult } from '../utils/payroll';
import { 
  Calendar, 
  Download, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Calculator,
  CreditCard,
  FileOutput,
  BadgePercent,
  ChevronRight,
  Eye,
  Printer,
  X
} from 'lucide-react';

const Payroll: React.FC = () => {
  const [selectedPayslip, setSelectedPayslip] = useState<{ emp: any, data: PayrollResult } | null>(null);

  // Memoize payroll calculations
  const payrollData = useMemo(() => {
    return MOCK_EMPLOYEES.map(emp => {
      // Simulate random OT for demo variety
      const otPay = Math.floor(Math.random() * 3000); 
      return {
        emp,
        ...processPayrollForEmployee(emp, otPay)
      };
    });
  }, []);

  const totals = useMemo(() => {
    return payrollData.reduce((acc, curr) => ({
      gross: acc.gross + curr.grossPay,
      deductions: acc.deductions + curr.deductions.total,
      net: acc.net + curr.netPay
    }), { gross: 0, deductions: 0, net: 0 });
  }, [payrollData]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payroll Processing</h2>
          <p className="text-gray-500 text-sm">Period: {MOCK_PAYROLL_SUMMARY.periodStart} to {MOCK_PAYROLL_SUMMARY.periodEnd}</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline">
                <Download size={18} className="mr-2" />
                Export Report
            </Button>
            <Button>
                <CheckCircle size={18} className="mr-2" />
                Finalize Payroll
            </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-xl p-6 text-white shadow-lg">
            <p className="text-primary-200 text-sm font-medium">Total Net Pay</p>
            <h3 className="text-3xl font-bold mt-2">₱{totals.net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <div className="mt-4 flex items-center text-xs text-primary-200 bg-primary-800/50 inline-block px-2 py-1 rounded">
                <Calendar size={12} className="mr-1" /> Payment Date: May 15, 2024
            </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
            <p className="text-gray-500 text-sm font-medium">Gross Pay</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">₱{totals.gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-xs text-gray-400 mt-2">Before deductions</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
            <p className="text-gray-500 text-sm font-medium">Total Deductions</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">
                ₱{totals.deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-gray-400 mt-2">Tax, SSS, PhilHealth, Pag-IBIG</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Payroll Register */}
        <div className="lg:col-span-2">
            <Card title="Payroll Register (Draft)">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Employee</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Gross Pay</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Deductions</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Net Pay</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-center">Status</th>
                                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payrollData.map(({ emp, grossPay, deductions, netPay }, idx) => (
                                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-gray-900">{emp.lastName}, {emp.firstName}</div>
                                        <div className="text-xs text-gray-500">{emp.department}</div>
                                    </td>
                                    <td className="py-3 px-4 text-right font-mono text-sm">₱{grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-3 px-4 text-right font-mono text-sm text-red-500">-₱{deductions.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-3 px-4 text-right font-mono text-sm font-bold text-gray-900">₱{netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                            Processed
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <button 
                                          onClick={() => setSelectedPayslip({ emp, data: { employeeId: emp.id, grossPay, deductions, netPay } })}
                                          className="text-gray-400 hover:text-primary-600 transition-colors p-1"
                                          title="View Payslip"
                                        >
                                          <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-100 text-center">
                    <button className="text-sm text-primary-600 font-medium hover:text-primary-800">View All Entries</button>
                </div>
            </Card>
        </div>

        {/* Right Column: Status & Checklists */}
        <div className="space-y-6">
            {/* System Status - Phase 7 Complete */}
            <Card title="System Status">
                <div className="space-y-4">
                    <p className="text-xs text-gray-500 mb-2">Payroll Engine Modules</p>
                    
                    {[
                        { label: 'SSS Contribution Engine', status: 'Online', icon: Calculator },
                        { label: 'PhilHealth Formulas', status: 'Online', icon: Calculator },
                        { label: 'Pag-IBIG Calculation', status: 'Online', icon: Calculator },
                        { label: 'Withholding Tax Tables', status: 'Online', icon: BadgePercent },
                        { label: '13th Month Computation', status: 'Ready', icon: CreditCard },
                        { label: 'Payslip Generation', status: 'Online', icon: FileOutput },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-green-50 text-green-600">
                                    <item.icon size={16} />
                                </div>
                                <span className="text-sm text-gray-700 font-medium">{item.label}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                {item.status.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

             {/* Operational Issues */}
             <Card title="Action Required">
                <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                        <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={18} />
                        <div>
                            <h4 className="text-sm font-semibold text-red-900">Missing Attendance Logs</h4>
                            <p className="text-xs text-red-700 mt-1">3 employees have incomplete time entries for this period.</p>
                            <button className="text-xs font-medium text-red-600 mt-2 hover:underline flex items-center">
                                Review Logs <ChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
      </div>

      {/* Payslip Modal */}
      <Modal 
        isOpen={!!selectedPayslip} 
        onClose={() => setSelectedPayslip(null)} 
        title="Payslip Preview"
      >
        {selectedPayslip && (
          <div className="space-y-6">
            {/* Payslip Header */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-4">
                 <div>
                    <h2 className="text-lg font-bold text-gray-900">PAYSLIP</h2>
                    <p className="text-sm text-gray-500">PayrollSys Inc.</p>
                 </div>
                 <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">Period: {MOCK_PAYROLL_SUMMARY.periodStart} - {MOCK_PAYROLL_SUMMARY.periodEnd}</p>
                    <p className="text-xs text-gray-500">Date Generated: {new Date().toLocaleDateString()}</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                <div>
                   <span className="text-gray-500 block text-xs uppercase tracking-wider">Employee Name</span>
                   <span className="font-semibold text-gray-900">{selectedPayslip.emp.lastName}, {selectedPayslip.emp.firstName}</span>
                </div>
                 <div>
                   <span className="text-gray-500 block text-xs uppercase tracking-wider">Employee ID</span>
                   <span className="font-semibold text-gray-900">{selectedPayslip.emp.id}</span>
                </div>
                 <div>
                   <span className="text-gray-500 block text-xs uppercase tracking-wider">Department</span>
                   <span className="font-medium text-gray-900">{selectedPayslip.emp.department}</span>
                </div>
                 <div>
                   <span className="text-gray-500 block text-xs uppercase tracking-wider">Position</span>
                   <span className="font-medium text-gray-900">{selectedPayslip.emp.position}</span>
                </div>
              </div>
            </div>

            {/* Calculations Grid */}
            <div className="grid grid-cols-2 gap-8">
               {/* Earnings */}
               <div>
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2 mb-3">Earnings</h4>
                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between">
                     <span className="text-gray-600">Basic Pay (Semi-monthly)</span>
                     <span className="font-mono text-gray-900">₱{(selectedPayslip.emp.basicSalary / 2).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-600">Overtime</span>
                     <span className="font-mono text-gray-900">₱{(selectedPayslip.data.grossPay - (selectedPayslip.emp.basicSalary / 2)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="flex justify-between pt-2 border-t border-dashed border-gray-200 font-semibold">
                     <span>Total Earnings</span>
                     <span>₱{selectedPayslip.data.grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                 </div>
               </div>

               {/* Deductions */}
               <div>
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2 mb-3">Deductions</h4>
                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between">
                     <span className="text-gray-600">SSS</span>
                     <span className="font-mono text-gray-900">₱{selectedPayslip.data.deductions.sss.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-600">PhilHealth</span>
                     <span className="font-mono text-gray-900">₱{selectedPayslip.data.deductions.philHealth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-600">Pag-IBIG</span>
                     <span className="font-mono text-gray-900">₱{selectedPayslip.data.deductions.pagIbig.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-600">Withholding Tax</span>
                     <span className="font-mono text-gray-900">₱{selectedPayslip.data.deductions.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="flex justify-between pt-2 border-t border-dashed border-gray-200 font-semibold text-red-600">
                     <span>Total Deductions</span>
                     <span>-₱{selectedPayslip.data.deductions.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                 </div>
               </div>
            </div>

            {/* Net Pay */}
            <div className="bg-primary-900 text-white p-4 rounded-lg flex justify-between items-center shadow-lg">
               <div>
                 <span className="block text-primary-200 text-xs uppercase tracking-wider font-semibold">Net Pay</span>
                 <span className="text-xs opacity-70">Take home pay</span>
               </div>
               <div className="text-2xl font-bold">
                 ₱{selectedPayslip.data.netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}
               </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
               <Button variant="outline" onClick={() => setSelectedPayslip(null)}>Close</Button>
               <Button onClick={() => window.print()} className="flex items-center gap-2">
                 <Printer size={16} /> Print Payslip
               </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payroll;

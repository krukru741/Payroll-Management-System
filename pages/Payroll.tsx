import React, { useMemo, useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import PayslipModal from '../components/PayslipModal';
import { processPayrollForEmployee, PayrollResult } from '../utils/payroll';
import { Employee } from '../types';
import { 
  Calendar, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Calculator,
  CreditCard,
  FileOutput,
  BadgePercent,
  ChevronRight,
  Eye,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { getScope, hasPermission } from '../utils/rbac';

const Payroll: React.FC = () => {
  const { user } = useAuth();
  const { employees, loading } = useData();
  const [selectedPayslip, setSelectedPayslip] = useState<{ emp: Employee, data: PayrollResult } | null>(null);

  // Hardcoded period for demo (In a real app, this comes from a Period Selector)
  const currentPeriod = {
    start: '2024-05-01',
    end: '2024-05-15'
  };

  // Memoize payroll calculations
  const payrollData = useMemo(() => {
    return employees.map(emp => {
      // Simulate random OT for demo variety
      const otPay = Math.floor(Math.random() * 3000); 
      return {
        emp,
        ...processPayrollForEmployee(emp, otPay)
      };
    });
  }, [employees]);

  // RBAC Filtering
  const scope = user ? getScope(user.role, 'payroll', 'read') : 'none';
  const canProcess = user && hasPermission(user.role, 'payroll', 'process');

  const filteredPayrollData = payrollData.filter(({ emp }) => {
    if (scope === 'all') return true;
    if (scope === 'team') return emp.department === user?.department;
    if (scope === 'self') return emp.id === user?.employeeId;
    return false;
  });

  const totals = useMemo(() => {
    return filteredPayrollData.reduce((acc, curr) => ({
      gross: acc.gross + curr.grossPay,
      deductions: acc.deductions + curr.deductions.total,
      net: acc.net + curr.netPay
    }), { gross: 0, deductions: 0, net: 0 });
  }, [filteredPayrollData]);

  if (loading) return <div>Loading payroll data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payroll Processing</h2>
          <p className="text-gray-500 text-sm">Period: {currentPeriod.start} to {currentPeriod.end}</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline">
                <Download size={18} className="mr-2" />
                Export Report
            </Button>
            {canProcess ? (
              <Button>
                  <CheckCircle size={18} className="mr-2" />
                  Finalize Payroll
              </Button>
            ) : (
              <Button disabled variant="secondary" className="opacity-50 cursor-not-allowed">
                  <Lock size={16} className="mr-2" />
                  Read Only
              </Button>
            )}
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
                            {filteredPayrollData.map(({ emp, grossPay, deductions, netPay, employerContributions }) => (
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
                                          onClick={() => setSelectedPayslip({ emp, data: { employeeId: emp.id, grossPay, deductions, netPay, employerContributions } })}
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
                {filteredPayrollData.length === 0 && (
                   <div className="p-8 text-center text-gray-500">
                     You do not have permission to view payroll records or none exist for your scope.
                   </div>
                )}
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

      <PayslipModal 
        isOpen={!!selectedPayslip} 
        onClose={() => setSelectedPayslip(null)} 
        data={selectedPayslip}
        periodStart={currentPeriod.start}
        periodEnd={currentPeriod.end}
      />
    </div>
  );
};

export default Payroll;

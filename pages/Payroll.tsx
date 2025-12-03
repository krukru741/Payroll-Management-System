import React, { useMemo, useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import PayslipModal from '../components/PayslipModal';
import Modal from '../components/Modal';
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
import { exportPayrollToExcel } from '../utils/export';
import api from '../lib/axios';

const Payroll: React.FC = () => {
  const { user } = useAuth();
  const { employees, loading } = useData();
  const [selectedPayslip, setSelectedPayslip] = useState<{ emp: Employee, data: PayrollResult } | null>(null);
  const [missingLogs, setMissingLogs] = useState<any[]>([]);
  const [loadingMissingLogs, setLoadingMissingLogs] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);

  // Hardcoded period for demo (In a real app, this comes from a Period Selector)
  const currentPeriod = {
    start: '2024-05-01',
    end: '2024-05-15'
  };

  useEffect(() => {
    const fetchMissingLogs = async () => {
      try {
        const response = await api.get('/attendance/missing');
        setMissingLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch missing logs', error);
      } finally {
        setLoadingMissingLogs(false);
      }
    };
    fetchMissingLogs();
  }, []);

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

  const handleExport = () => {
    exportPayrollToExcel(filteredPayrollData, currentPeriod);
  };

  const handleFinalizeClick = () => {
    setShowFinalizeConfirm(true);
  };

  const executeFinalize = async () => {
    setShowFinalizeConfirm(false);
    setIsFinalizing(true);
    try {
      await api.post('/payroll/finalize-batch', {
        payrolls: filteredPayrollData,
        periodStart: currentPeriod.start,
        periodEnd: currentPeriod.end
      });
      alert('Payroll finalized successfully!');
    } catch (error) {
      console.error('Failed to finalize payroll', error);
      alert('Failed to finalize payroll. Please try again.');
    } finally {
      setIsFinalizing(false);
    }
  };

  if (loading) return <div>Loading payroll data...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Payroll Processing</h2>
          <p className="text-gray-500 text-xs">Period: {currentPeriod.start} to {currentPeriod.end}</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport} disabled={filteredPayrollData.length === 0}>
                <Download size={14} className="mr-2" />
                Export Report
            </Button>
            {canProcess ? (
              <Button size="sm" onClick={handleFinalizeClick} disabled={isFinalizing || filteredPayrollData.length === 0}>
                  <CheckCircle size={14} className="mr-2" />
                  {isFinalizing ? 'Finalizing...' : 'Finalize Payroll'}
              </Button>
            ) : (
              <Button disabled variant="secondary" size="sm" className="opacity-50 cursor-not-allowed">
                  <Lock size={14} className="mr-2" />
                  Read Only
              </Button>
            )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-primary-800 to-primary-900 rounded-lg p-4 text-white shadow-md">
            <p className="text-primary-200 text-xs font-medium uppercase tracking-wide">Total Net Pay</p>
            <h3 className="text-2xl font-bold mt-1">₱{totals.net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <div className="mt-2 flex items-center text-[10px] text-primary-200 bg-primary-800/50 inline-block px-2 py-0.5 rounded">
                <Calendar size={10} className="mr-1" /> Payment Date: May 15, 2024
            </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex flex-col justify-center">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Gross Pay</p>
            <h3 className="text-xl font-bold text-gray-900 mt-1">₱{totals.gross.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[10px] text-gray-400 mt-1">Before deductions</p>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm flex flex-col justify-center">
            <p className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Deductions</p>
            <h3 className="text-xl font-bold text-red-600 mt-1">
                ₱{totals.deductions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">Tax, SSS, PhilHealth, Pag-IBIG</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Payroll Register */}
        <div className="lg:col-span-2">
            <Card title="Payroll Register (Draft)">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Employee</th>
                                <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-right">Gross Pay</th>
                                <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-right">Deductions</th>
                                <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-right">Net Pay</th>
                                <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Status</th>
                                <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPayrollData.map(({ emp, grossPay, deductions, netPay, employerContributions }) => (
                                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-2 px-3">
                                        <div className="font-medium text-sm text-gray-900">{emp.lastName}, {emp.firstName}</div>
                                        <div className="text-[10px] text-gray-500">{emp.department}</div>
                                    </td>
                                    <td className="py-2 px-3 text-right font-mono text-xs">₱{grossPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-2 px-3 text-right font-mono text-xs text-red-500">-₱{deductions.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-2 px-3 text-right font-mono text-sm font-bold text-gray-900">₱{netPay.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-2 px-3 text-center">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                                            Processed
                                        </span>
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                        <button 
                                          onClick={() => setSelectedPayslip({ emp, data: { employeeId: emp.id, grossPay, deductions, netPay, employerContributions } })}
                                          className="text-gray-400 hover:text-primary-600 transition-colors p-1"
                                          title="View Payslip"
                                        >
                                          <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredPayrollData.length === 0 && (
                   <div className="p-6 text-center text-sm text-gray-500">
                     You do not have permission to view payroll records or none exist for your scope.
                   </div>
                )}
                <div className="p-3 border-t border-gray-100 text-center">
                    <button className="text-xs text-primary-600 font-medium hover:text-primary-800">View All Entries</button>
                </div>
            </Card>
        </div>

        {/* Right Column: Status & Checklists */}
        <div className="space-y-4">
            {/* System Status */}
            <Card title="System Status">
                <div className="space-y-3">
                    <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wide">Payroll Engine Modules</p>
                    
                    {[
                        { label: 'SSS Contribution Engine', status: 'Online', icon: Calculator },
                        { label: 'PhilHealth Formulas', status: 'Online', icon: Calculator },
                        { label: 'Pag-IBIG Calculation', status: 'Online', icon: Calculator },
                        { label: 'Withholding Tax Tables', status: 'Online', icon: BadgePercent },
                        { label: '13th Month Computation', status: 'Ready', icon: CreditCard },
                        { label: 'Payslip Generation', status: 'Online', icon: FileOutput },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between group">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 rounded-md bg-green-50 text-green-600">
                                    <item.icon size={14} />
                                </div>
                                <span className="text-xs text-gray-700 font-medium">{item.label}</span>
                            </div>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                                {item.status.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>

             {/* Operational Issues */}
             <Card title="Action Required">
                <div className="space-y-2">
                    {loadingMissingLogs ? (
                        <div className="text-xs text-gray-500 p-2">Checking logs...</div>
                    ) : missingLogs.length > 0 ? (
                        <div className="flex items-start gap-2 p-2 bg-red-50 rounded-lg border border-red-100">
                            <AlertCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                            <div>
                                <h4 className="text-xs font-semibold text-red-900">Missing Attendance Logs</h4>
                                <p className="text-[10px] text-red-700 mt-0.5">
                                    {missingLogs.length} employee{missingLogs.length > 1 ? 's have' : ' has'} incomplete time entries.
                                </p>
                                <button className="text-[10px] font-medium text-red-600 mt-1 hover:underline flex items-center">
                                    Review Logs <ChevronRight size={10} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg border border-green-100">
                            <CheckCircle className="text-green-500 flex-shrink-0" size={16} />
                            <p className="text-xs text-green-700 font-medium">All attendance logs are complete.</p>
                        </div>
                    )}
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

      <Modal 
        isOpen={showFinalizeConfirm} 
        onClose={() => setShowFinalizeConfirm(false)} 
        title="Confirm Finalization"
      >
         <div className="space-y-4">
           <p className="text-sm text-gray-600">
             Are you sure you want to finalize the payroll for this period? 
             <br/><br/>
             <span className="font-semibold text-red-600">This action cannot be undone.</span>
           </p>
           <div className="flex justify-end gap-2 pt-2">
             <Button variant="outline" size="sm" onClick={() => setShowFinalizeConfirm(false)}>Cancel</Button>
             <Button size="sm" onClick={executeFinalize}>Confirm Finalize</Button>
           </div>
         </div>
      </Modal>
    </div>
  );
};

export default Payroll;
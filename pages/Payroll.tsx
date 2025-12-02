import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { MOCK_PAYROLL_SUMMARY, MOCK_EMPLOYEES } from '../constants';
import { 
  Calendar, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  AlertCircle,
  FileText,
  Calculator,
  CreditCard,
  FileOutput,
  BadgePercent,
  ChevronRight
} from 'lucide-react';

const Payroll: React.FC = () => {
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
            <h3 className="text-3xl font-bold mt-2">₱{MOCK_PAYROLL_SUMMARY.totalNet.toLocaleString()}</h3>
            <div className="mt-4 flex items-center text-xs text-primary-200 bg-primary-800/50 inline-block px-2 py-1 rounded">
                <Calendar size={12} className="mr-1" /> Payment Date: May 15, 2024
            </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
            <p className="text-gray-500 text-sm font-medium">Gross Pay</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-1">₱{MOCK_PAYROLL_SUMMARY.totalGross.toLocaleString()}</h3>
            <p className="text-xs text-gray-400 mt-2">Before deductions</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col justify-center">
            <p className="text-gray-500 text-sm font-medium">Total Deductions</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">
                ₱{(MOCK_PAYROLL_SUMMARY.totalGross - MOCK_PAYROLL_SUMMARY.totalNet).toLocaleString()}
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
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {MOCK_EMPLOYEES.slice(0, 5).map((emp, idx) => {
                                // Mock calculations
                                const gross = emp.basicSalary / 2; // Half month
                                const ot = Math.floor(Math.random() * 2000);
                                const totalGross = gross + ot;
                                const deductions = totalGross * 0.15;
                                const net = totalGross - deductions;

                                return (
                                    <tr key={emp.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="font-medium text-gray-900">{emp.lastName}, {emp.firstName}</div>
                                            <div className="text-xs text-gray-500">{emp.department}</div>
                                        </td>
                                        <td className="py-3 px-4 text-right font-mono text-sm">₱{totalGross.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-right font-mono text-sm text-red-500">-₱{deductions.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-right font-mono text-sm font-bold text-gray-900">₱{net.toLocaleString()}</td>
                                        <td className="py-3 px-4 text-center">
                                            {idx === 2 ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    <AlertTriangle size={12} className="mr-1" /> Review
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    Draft
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
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

                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                        <FileText className="text-yellow-600 mt-0.5 flex-shrink-0" size={18} />
                        <div>
                            <h4 className="text-sm font-semibold text-yellow-900">Unapproved Overtime</h4>
                            <p className="text-xs text-yellow-700 mt-1">5 OT requests pending approval from managers.</p>
                            <button className="text-xs font-medium text-yellow-700 mt-2 hover:underline flex items-center">
                                Review Requests <ChevronRight size={12} />
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Development Roadmap / Missing Features */}
            <Card title="Pending Features (Phase 7)">
                <div className="space-y-4">
                    <p className="text-xs text-gray-500 italic mb-2">Modules pending backend integration per system spec.</p>
                    
                    {[
                        { label: 'SSS Contribution Engine', status: 'Pending', icon: Calculator },
                        { label: 'PhilHealth Formulas', status: 'Pending', icon: Calculator },
                        { label: 'Pag-IBIG Calculation', status: 'Pending', icon: Calculator },
                        { label: 'Withholding Tax Tables', status: 'Pending', icon: BadgePercent },
                        { label: '13th Month Computation', status: 'Scheduled', icon: CreditCard },
                        { label: 'Payslip PDF Generation', status: 'Dev', icon: FileOutput },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between group">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-50 text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-500 transition-colors">
                                    <item.icon size={16} />
                                </div>
                                <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                item.status === 'Dev' ? 'bg-blue-100 text-blue-700' : 
                                item.status === 'Scheduled' ? 'bg-purple-100 text-purple-700' : 
                                'bg-gray-100 text-gray-500'
                            }`}>
                                {item.status.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default Payroll;
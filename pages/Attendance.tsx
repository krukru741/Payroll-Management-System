import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import api from '../lib/axios';
import Card from '../components/Card';
import Button from '../components/Button';
import { Calendar, Clock, User, AlertCircle, CheckCircle, XCircle, Filter, Search, Plus, X } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  timeIn: string;
  timeOut: string | null;
  status: string;
  hoursWorked: number;
  employee: {
    firstName: string;
    lastName: string;
  };
}

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Helper function to get first and last day of current month
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0]
    };
  };
  
  const monthRange = getCurrentMonthRange();
  const [filters, setFilters] = useState({
    startDate: monthRange.start,
    endDate: monthRange.end,
    employeeId: user?.role === 'EMPLOYEE' ? user.employeeId || '' : ''
  });
  
  const { employees } = useData();
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [manualEntry, setManualEntry] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    timeIn: '',
    timeOut: '',
    status: 'PRESENT'
  });

  useEffect(() => {
    if (showManualModal && user?.role === 'EMPLOYEE' && user.employeeId) {
        setManualEntry(prev => ({ ...prev, employeeId: user.employeeId! }));
    }
  }, [showManualModal, user]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...manualEntry,
        timeIn: manualEntry.timeIn ? `${manualEntry.date}T${manualEntry.timeIn}:00` : null,
        timeOut: manualEntry.timeOut ? `${manualEntry.date}T${manualEntry.timeOut}:00` : null
      };
      await api.post('/attendance', payload);
      
      setFilters(prev => ({
        ...prev,
        startDate: manualEntry.date,
        endDate: manualEntry.date
      }));
      
      setShowManualModal(false);
      alert('Attendance record created successfully');
    } catch (error) {
      console.error('Failed to create attendance', error);
      alert('Failed to create attendance record');
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const response = await api.get('/attendance', {
        params: filters
      });
      setAttendance(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEmployee || user?.role === 'EMPLOYEE') {
      fetchAttendance();
    }
  }, [filters.startDate, filters.endDate, selectedEmployee]);

  const stats = useMemo(() => {
    return {
      present: attendance.filter(a => a.status === 'PRESENT').length,
      late: attendance.filter(a => a.status === 'LATE').length,
      absent: attendance.filter(a => a.status === 'ABSENT').length,
      incomplete: attendance.filter(a => !a.timeOut).length
    };
  }, [attendance]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleViewRecords = (employee: any) => {
    setSelectedEmployee(employee);
    setFilters(prev => ({ ...prev, employeeId: employee.id }));
  };

  const handleBackToList = () => {
    setSelectedEmployee(null);
    setFilters(prev => ({ ...prev, employeeId: '' }));
  };

  // For employees, always show their records
  if (user?.role === 'EMPLOYEE') {
    return (
      <div className="space-y-4">
        {/* Header & Filters */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Attendance</h2>
            <p className="text-gray-500 text-xs">View your attendance records</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-1 px-2">
                <Calendar size={14} className="text-gray-400" />
                <input 
                  type="date" 
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleDateChange}
                  className="text-xs border-none focus:ring-0 p-0 text-gray-600"
                />
                <span className="text-gray-400 text-xs">-</span>
                <input 
                  type="date" 
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleDateChange}
                  className="text-xs border-none focus:ring-0 p-0 text-gray-600"
                />
              </div>
              <Button size="sm" variant="ghost" onClick={fetchAttendance}>
                <Filter size={14} />
              </Button>
            </div>
            <Button size="sm" onClick={() => setShowManualModal(true)} className="flex items-center gap-2">
              <Plus size={14} /> <span className="hidden sm:inline">Manual Entry</span>
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Present</p>
              <h3 className="text-xl font-bold text-green-600">{stats.present}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-full text-green-600">
              <CheckCircle size={16} />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Late</p>
              <h3 className="text-xl font-bold text-yellow-600">{stats.late}</h3>
            </div>
            <div className="p-2 bg-yellow-50 rounded-full text-yellow-600">
              <Clock size={16} />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Absent</p>
              <h3 className="text-xl font-bold text-red-600">{stats.absent}</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-full text-red-600">
              <XCircle size={16} />
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Incomplete</p>
              <h3 className="text-xl font-bold text-orange-600">{stats.incomplete}</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-full text-orange-600">
              <AlertCircle size={16} />
            </div>
          </div>
        </div>

        {/* Attendance Table */}
        <Card title="Attendance Records">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Date</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Time In</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Time Out</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Hours</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-xs text-gray-500">Loading attendance records...</td>
                  </tr>
                ) : attendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-xs text-gray-500">No attendance records found for this period.</td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-2 px-3 text-xs text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-3 text-xs font-mono text-gray-600">
                        {new Date(record.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2 px-3 text-xs font-mono text-gray-600">
                        {record.timeOut ? new Date(record.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                      </td>
                      <td className="py-2 px-3 text-center text-xs font-mono">
                        {record.hoursWorked ? record.hoursWorked.toFixed(2) : '-'}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium 
                          ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' : 
                            record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' : 
                            record.status === 'ABSENT' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Manual Entry Modal */}
        {showManualModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Manual Attendance Entry</h3>
                <button onClick={() => setShowManualModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleManualSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
                  <input 
                    type="text" 
                    value={user.name} 
                    disabled 
                    className="w-full text-sm border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date"
                    required
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    value={manualEntry.date}
                    onChange={e => setManualEntry({...manualEntry, date: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Time In</label>
                    <input 
                      type="time"
                      className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      value={manualEntry.timeIn}
                      onChange={e => setManualEntry({...manualEntry, timeIn: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Time Out</label>
                    <input 
                      type="time"
                      className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      value={manualEntry.timeOut}
                      onChange={e => setManualEntry({...manualEntry, timeOut: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    value={manualEntry.status}
                    onChange={e => setManualEntry({...manualEntry, status: e.target.value})}
                  >
                    <option value="PRESENT">Present</option>
                    <option value="LATE">Late</option>
                    <option value="ABSENT">Absent</option>
                    <option value="HALF_DAY">Half Day</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button type="button" variant="ghost" onClick={() => setShowManualModal(false)}>Cancel</Button>
                  <Button type="submit">Save Record</Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Admin/Manager view - Show employee list or selected employee's records
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {selectedEmployee ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}'s Attendance` : 'Attendance Management'}
          </h2>
          <p className="text-gray-500 text-xs">
            {selectedEmployee ? 'View and manage attendance records' : 'Select an employee to view their attendance'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedEmployee && (
            <>
              <Button size="sm" variant="ghost" onClick={handleBackToList}>
                ← Back to List
              </Button>
              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center gap-1 px-2">
                  <Calendar size={14} className="text-gray-400" />
                  <input 
                    type="date" 
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleDateChange}
                    className="text-xs border-none focus:ring-0 p-0 text-gray-600"
                  />
                  <span className="text-gray-400 text-xs">-</span>
                  <input 
                    type="date" 
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleDateChange}
                    className="text-xs border-none focus:ring-0 p-0 text-gray-600"
                  />
                </div>
                <Button size="sm" variant="ghost" onClick={fetchAttendance}>
                  <Filter size={14} />
                </Button>
              </div>
              <Button size="sm" onClick={() => setShowManualModal(true)} className="flex items-center gap-2">
                <Plus size={14} /> <span className="hidden sm:inline">Manual Entry</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {!selectedEmployee ? (
        /* Employee List */
        <Card title="Employees">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Employee ID</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Name</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Department</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Position</th>
                  <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs font-mono text-gray-600">{employee.id}</td>
                    <td className="py-2 px-3 text-xs font-medium text-gray-900">
                      {employee.lastName}, {employee.firstName}
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-600">{employee.department}</td>
                    <td className="py-2 px-3 text-xs text-gray-600">{employee.position}</td>
                    <td className="py-2 px-3 text-center">
                      <Button size="sm" variant="ghost" onClick={() => handleViewRecords(employee)}>
                        View Records
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        /* Selected Employee's Attendance Records */
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Present</p>
                <h3 className="text-xl font-bold text-green-600">{stats.present}</h3>
              </div>
              <div className="p-2 bg-green-50 rounded-full text-green-600">
                <CheckCircle size={16} />
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Late</p>
                <h3 className="text-xl font-bold text-yellow-600">{stats.late}</h3>
              </div>
              <div className="p-2 bg-yellow-50 rounded-full text-yellow-600">
                <Clock size={16} />
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Absent</p>
                <h3 className="text-xl font-bold text-red-600">{stats.absent}</h3>
              </div>
              <div className="p-2 bg-red-50 rounded-full text-red-600">
                <XCircle size={16} />
              </div>
            </div>
            <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Incomplete</p>
                <h3 className="text-xl font-bold text-orange-600">{stats.incomplete}</h3>
              </div>
              <div className="p-2 bg-orange-50 rounded-full text-orange-600">
                <AlertCircle size={16} />
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <Card title="Attendance Records">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Date</th>
                    <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Time In</th>
                    <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Time Out</th>
                    <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Hours</th>
                    <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-xs text-gray-500">Loading attendance records...</td>
                    </tr>
                  ) : attendance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-xs text-gray-500">No attendance records found for this period.</td>
                    </tr>
                  ) : (
                    attendance.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-2 px-3 text-xs text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-3 text-xs font-mono text-gray-600">
                          {new Date(record.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-2 px-3 text-xs font-mono text-gray-600">
                          {record.timeOut ? new Date(record.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </td>
                        <td className="py-2 px-3 text-center text-xs font-mono">
                          {record.hoursWorked ? record.hoursWorked.toFixed(2) : '-'}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium 
                            ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' : 
                              record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' : 
                              record.status === 'ABSENT' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Manual Entry Modal */}
      {showManualModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Manual Attendance Entry</h3>
              <button onClick={() => setShowManualModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
                <input 
                  type="text" 
                  value={`${selectedEmployee.firstName} ${selectedEmployee.lastName}`} 
                  disabled 
                  className="w-full text-sm border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date"
                  required
                  className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={manualEntry.date}
                  onChange={e => setManualEntry({...manualEntry, date: e.target.value, employeeId: selectedEmployee.id})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time In</label>
                  <input 
                    type="time"
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    value={manualEntry.timeIn}
                    onChange={e => setManualEntry({...manualEntry, timeIn: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time Out</label>
                  <input 
                    type="time"
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    value={manualEntry.timeOut}
                    onChange={e => setManualEntry({...manualEntry, timeOut: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={manualEntry.status}
                  onChange={e => setManualEntry({...manualEntry, status: e.target.value})}
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="ABSENT">Absent</option>
                  <option value="HALF_DAY">Half Day</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowManualModal(false)}>Cancel</Button>
                <Button type="submit">Save Record</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Attendance</h2>
          <p className="text-gray-500 text-xs">Manage employee attendance records</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
           <div className="flex items-center gap-1 px-2">
              <Calendar size={14} className="text-gray-400" />
              <input 
                type="date" 
                name="startDate"
                value={filters.startDate}
                onChange={handleDateChange}
                className="text-xs border-none focus:ring-0 p-0 text-gray-600"
              />
              <span className="text-gray-400 text-xs">-</span>
              <input 
                type="date" 
                name="endDate"
                value={filters.endDate}
                onChange={handleDateChange}
                className="text-xs border-none focus:ring-0 p-0 text-gray-600"
              />
           </div>
           <Button size="sm" variant="ghost" onClick={fetchAttendance}>
             <Filter size={14} />
           </Button>
        </div>
        <Button size="sm" onClick={() => setShowManualModal(true)} className="flex items-center gap-2">
            <Plus size={14} /> <span className="hidden sm:inline">Manual Entry</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Present</p>
             <h3 className="text-xl font-bold text-green-600">{stats.present}</h3>
           </div>
           <div className="p-2 bg-green-50 rounded-full text-green-600">
             <CheckCircle size={16} />
           </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Late</p>
             <h3 className="text-xl font-bold text-yellow-600">{stats.late}</h3>
           </div>
           <div className="p-2 bg-yellow-50 rounded-full text-yellow-600">
             <Clock size={16} />
           </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Absent</p>
             <h3 className="text-xl font-bold text-red-600">{stats.absent}</h3>
           </div>
           <div className="p-2 bg-red-50 rounded-full text-red-600">
             <XCircle size={16} />
           </div>
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
           <div>
             <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold">Incomplete</p>
             <h3 className="text-xl font-bold text-orange-600">{stats.incomplete}</h3>
           </div>
           <div className="p-2 bg-orange-50 rounded-full text-orange-600">
             <AlertCircle size={16} />
           </div>
        </div>
      </div>

      {/* Attendance Table */}
      <Card title="Attendance Records">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Date</th>
                <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Employee</th>
                <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Time In</th>
                <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase">Time Out</th>
                <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Hours</th>
                <th className="py-2 px-3 text-[10px] font-semibold text-gray-500 uppercase text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-xs text-gray-500">Loading attendance records...</td>
                </tr>
              ) : attendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-xs text-gray-500">No attendance records found for this period.</td>
                </tr>
              ) : (
                attendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-xs text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-medium text-xs text-gray-900">{record.employee.lastName}, {record.employee.firstName}</div>
                    </td>
                    <td className="py-2 px-3 text-xs font-mono text-gray-600">
                      {new Date(record.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2 px-3 text-xs font-mono text-gray-600">
                      {record.timeOut ? new Date(record.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-2 px-3 text-center text-xs font-mono">
                      {record.hoursWorked ? record.hoursWorked.toFixed(2) : '-'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium 
                        ${record.status === 'PRESENT' ? 'bg-green-100 text-green-800' : 
                          record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' : 
                          record.status === 'ABSENT' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Manual Entry Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Manual Attendance Entry</h3>
              <button onClick={() => setShowManualModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Employee</label>
                {user?.role === 'EMPLOYEE' ? (
                    <input 
                        type="text" 
                        value={user.name} 
                        disabled 
                        className="w-full text-sm border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                ) : (
                    <select 
                      required
                      className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                      value={manualEntry.employeeId}
                      onChange={e => setManualEntry({...manualEntry, employeeId: e.target.value})}
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.lastName}, {emp.firstName}</option>
                      ))}
                    </select>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                <input 
                  type="date"
                  required
                  className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={manualEntry.date}
                  onChange={e => setManualEntry({...manualEntry, date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time In</label>
                  <input 
                    type="time"
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    value={manualEntry.timeIn}
                    onChange={e => setManualEntry({...manualEntry, timeIn: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Time Out</label>
                  <input 
                    type="time"
                    className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                    value={manualEntry.timeOut}
                    onChange={e => setManualEntry({...manualEntry, timeOut: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full text-sm border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
                  value={manualEntry.status}
                  onChange={e => setManualEntry({...manualEntry, status: e.target.value})}
                >
                  <option value="PRESENT">Present</option>
                  <option value="LATE">Late</option>
                  <option value="ABSENT">Absent</option>
                  <option value="HALF_DAY">Half Day</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button type="button" variant="ghost" onClick={() => setShowManualModal(false)}>Cancel</Button>
                <Button type="submit">Save Record</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;

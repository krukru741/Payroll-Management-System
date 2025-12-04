import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import Card from '../components/Card';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Clock, DollarSign, Calendar, Filter } from 'lucide-react';
import { POSITION_DEPARTMENT_MAP } from '../constants';

const Analytics: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<any>(null);
  const [leaveData, setLeaveData] = useState<any>(null);
  const [overtimeData, setOvertimeData] = useState<any>(null);
  const [cashAdvanceData, setCashAdvanceData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');

  const departments = ['ALL', ...Object.keys(POSITION_DEPARTMENT_MAP)];

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, selectedDepartment]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        department: selectedDepartment
      };

      const [summaryRes, leaveRes, overtimeRes, cashAdvanceRes] = await Promise.all([
        api.get('/analytics/summary', { params }),
        api.get('/analytics/leave', { params }),
        api.get('/analytics/overtime', { params }),
        api.get('/analytics/cash-advance', { params })
      ]);

      setSummary(summaryRes.data);
      setLeaveData(leaveRes.data);
      setOvertimeData(overtimeRes.data);
      setCashAdvanceData(cashAdvanceRes.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading analytics...</div>;
  }

  // Prepare chart data
  const leaveByTypeData = leaveData?.byType ? Object.entries(leaveData.byType).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value
  })) : [];

  const leaveByMonthData = leaveData?.byMonth ? Object.entries(leaveData.byMonth).map(([month, count]) => ({
    month,
    count
  })) : [];

  const overtimeByMonthData = overtimeData?.byMonth ? Object.entries(overtimeData.byMonth).map(([month, data]: [string, any]) => ({
    month,
    hours: data.hours
  })) : [];

  const cashAdvanceByMonthData = cashAdvanceData?.byMonth ? Object.entries(cashAdvanceData.byMonth).map(([month, data]: [string, any]) => ({
    month,
    amount: data.amount
  })) : [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-500 text-sm">Overview of leave, overtime, and cash advance data</p>
        </div>
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="border-gray-300 rounded-lg text-sm h-[38px] min-w-[150px]"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Leave Requests</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.leave?.total || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-yellow-600">{summary?.leave?.pending || 0} pending</span>
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Overtime Hours</p>
              <p className="text-2xl font-bold text-gray-900">{overtimeData?.totalHours?.toFixed(1) || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-yellow-600">{summary?.overtime?.pending || 0} pending</span>
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <Clock className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Cash Advance</p>
              <p className="text-2xl font-bold text-gray-900">₱{cashAdvanceData?.totalAmount?.toLocaleString() || 0}</p>
              <p className="text-xs text-gray-500 mt-1">
                <span className="text-yellow-600">{summary?.cashAdvance?.pending || 0} pending</span>
              </p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <DollarSign className="text-yellow-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave Trends */}
        <Card title="Leave Requests Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={leaveByMonthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} name="Requests" />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Leave by Type */}
        <Card title="Leave by Type">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={leaveByTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {leaveByTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Overtime Hours */}
        <Card title="Overtime Hours by Month">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overtimeByMonthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="hours" fill="#10b981" name="Hours" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Cash Advance */}
        <Card title="Cash Advance by Month">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cashAdvanceByMonthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#f59e0b" name="Amount (₱)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

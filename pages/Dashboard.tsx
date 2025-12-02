import React from 'react';
import Card from '../components/Card';
import { MOCK_PAYROLL_SUMMARY, PAYROLL_HISTORY_DATA, DEPARTMENT_DISTRIBUTION, COLORS } from '../constants';
import { Users, DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const StatCard = ({ title, value, subtext, icon: Icon, colorClass }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 mt-2">{value}</h3>
      <p className="text-xs text-gray-500 mt-1">{subtext}</p>
    </div>
    <div className={`p-3 rounded-lg ${colorClass}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Employees" 
          value={MOCK_PAYROLL_SUMMARY.totalEmployees}
          subtext="+2 from last month"
          icon={Users}
          colorClass="bg-primary-500"
        />
        <StatCard 
          title="Payroll Cost" 
          value={`₱${(MOCK_PAYROLL_SUMMARY.totalGross / 1000000).toFixed(2)}M`}
          subtext="Current period estimate"
          icon={DollarSign}
          colorClass="bg-secondary-400 text-primary-900" // Override icon color for secondary
        />
        <StatCard 
          title="On Time %" 
          value="94.5%"
          subtext="-1.2% from average"
          icon={Clock}
          colorClass="bg-primary-800"
        />
        <StatCard 
          title="Pending Requests" 
          value="12"
          subtext="Leaves & Adjustments"
          icon={AlertCircle}
          colorClass="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Card title="Payroll History (6 Months)">
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PAYROLL_HISTORY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₱${value/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Total']}
                  />
                  <Bar dataKey="amount" fill="#076653" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Secondary Chart */}
        <div className="lg:col-span-1">
          <Card title="Department Headcount">
            <div className="h-80 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={DEPARTMENT_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {DEPARTMENT_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {DEPARTMENT_DISTRIBUTION.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xs text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Activity Section */}
      <Card title="Recent Activity">
        <div className="space-y-4">
          {[
            { user: 'Alice Rivera', action: 'Requested Vacation Leave', time: '2 hours ago', type: 'Leave' },
            { user: 'Mark Santos', action: 'Approved OT for Team A', time: '4 hours ago', type: 'Approval' },
            { user: 'System', action: 'Payroll Period 2024-05-01 Generated', time: '1 day ago', type: 'System' },
            { user: 'David Chen', action: 'Submitted Loan Application', time: '1 day ago', type: 'Loan' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                  item.type === 'System' ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.type === 'System' ? 'SYS' : item.user.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.action}</p>
                  <p className="text-xs text-gray-500">{item.user}</p>
                </div>
              </div>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Clock size={12} /> {item.time}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
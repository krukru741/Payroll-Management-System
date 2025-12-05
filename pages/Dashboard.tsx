import React, { useMemo, useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import { PAYROLL_HISTORY_DATA, COLORS } from '../constants';
import { Users, DollarSign, Clock, AlertCircle, Calendar, CreditCard, FileText, CheckCircle, Megaphone, LogIn, LogOut } from 'lucide-react';
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
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { UserRole, AppUser } from '../types';
import api from '../lib/axios';

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: "Annual Physical Exam Schedule",
    content: "The APE is scheduled for next week (May 20-24). Please sign up for your preferred slot at the HR office or via the portal.",
    author: "HR Department",
    date: "2 hours ago",
    type: "Important"
  },
  {
    id: 2,
    title: "System Maintenance Notice",
    content: "PayrollSys will be undergoing scheduled maintenance this Saturday from 10:00 PM to 2:00 AM. Access will be intermittent.",
    author: "IT Support",
    date: "1 day ago",
    type: "System"
  },
  {
    id: 3,
    title: "Q2 Townhall Meeting",
    content: "Join us for the quarterly townhall meeting this Friday at 3:00 PM via Zoom. We will be discussing the new benefits package.",
    author: "Management",
    date: "2 days ago",
    type: "Event"
  }
];

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ElementType;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 flex items-start justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
      <h3 className="text-xl font-bold text-gray-900 mt-1">{value}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{subtext}</p>
    </div>
    <div className={`p-2 rounded-lg ${colorClass}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const AnnouncementItem: React.FC<{ item: typeof ANNOUNCEMENTS[0] }> = ({ item }) => (
  <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-primary-200 transition-colors">
     <div className="flex justify-between items-start mb-1.5">
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          {item.type === 'Important' && <AlertCircle size={14} className="text-red-500" />}
          {item.title}
        </h4>
        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{item.date}</span>
     </div>
     <p className="text-xs text-gray-600 mb-2 leading-relaxed">{item.content}</p>
     <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
            item.type === 'Important' ? 'bg-red-50 text-red-700 border-red-100' :
            item.type === 'System' ? 'bg-blue-50 text-blue-700 border-blue-100' :
            'bg-green-50 text-green-700 border-green-100'
        }`}>
            {item.type}
        </span>
        <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
          By {item.author}
        </span>
     </div>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { employees } = useData();
  const { user } = useAuth();
  const [adminStats, setAdminStats] = useState({
    pendingRequests: 0,
    payrollHistory: [],
    attendanceRate: 0
  });
  const [attendanceStatus, setAttendanceStatus] = useState<'in' | 'out'>('out');
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [todayRecord, setTodayRecord] = useState<any>(null);

  useEffect(() => {
    api.get('/analytics/admin-dashboard')
      .then(res => setAdminStats(res.data))
      .catch(err => console.error('Failed to fetch admin stats', err));

    // Fetch attendance status for admin/manager
    if (user?.employeeId) {
      const fetchStatus = async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const response = await api.get('/attendance', {
            params: {
              employeeId: user.employeeId,
              startDate: today,
              endDate: today
            }
          });
          
          if (response.data.length > 0) {
            const record = response.data[0];
            setTodayRecord(record);
            if (record.timeIn && !record.timeOut) {
              setAttendanceStatus('in');
            } else {
              setAttendanceStatus('out');
            }
          }
        } catch (error) {
          console.error('Failed to fetch attendance status', error);
        } finally {
          setLoadingAttendance(false);
        }
      };
      
      fetchStatus();
    } else {
      setLoadingAttendance(false);
    }
  }, [user?.employeeId]);

  const handleClockIn = async () => {
    if (!user?.employeeId) {
      alert('Your account is not linked to an employee record.');
      return;
    }
    setLoadingAttendance(true);
    try {
      await api.post('/attendance/clock-in', {
        employeeId: user.employeeId,
        timestamp: new Date().toISOString()
      });
      setAttendanceStatus('in');
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get('/attendance', {
        params: { employeeId: user.employeeId, startDate: today, endDate: today }
      });
      if (response.data.length > 0) setTodayRecord(response.data[0]);
    } catch (error) {
      console.error('Failed to clock in', error);
      alert('Failed to clock in');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleClockOut = async () => {
    if (!user?.employeeId) {
      alert('Your account is not linked to an employee record.');
      return;
    }
    setLoadingAttendance(true);
    try {
      await api.post('/attendance/clock-out', {
        employeeId: user.employeeId,
        timestamp: new Date().toISOString()
      });
      setAttendanceStatus('out');
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get('/attendance', {
        params: { employeeId: user.employeeId, startDate: today, endDate: today }
      });
      if (response.data.length > 0) setTodayRecord(response.data[0]);
    } catch (error) {
      console.error('Failed to clock out', error);
      alert('Failed to clock out');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const stats = useMemo(() => {
    const totalEmployees = employees.length;
    // Estimate monthly cost (Basic * 12 / 24 periods * 2 + overhead) ~ simple sum for demo
    const totalMonthlyBasic = employees.reduce((sum, e) => sum + e.basicSalary, 0);
    
    return {
      totalEmployees,
      payrollCost: totalMonthlyBasic,
    };
  }, [employees]);

  // Recalculate department distribution based on real data
  const dynamicDeptDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(e => {
      counts[e.department] = (counts[e.department] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [employees]);

  return (
    <div className="space-y-4">
      {/* Time Tracker Section - Same design as Employee Dashboard */}
      {user?.employeeId && (
        <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-lg p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-1">Admin Dashboard</h2>
            <p className="text-primary-100 max-w-xl">
              Track your attendance and manage the system
            </p>
          </div>
          
          {/* Clock In/Out Card */}
          <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20 w-full md:w-auto min-w-[200px]">
            <p className="text-primary-100 text-xs font-medium uppercase tracking-wide mb-2">Time Tracker</p>
            <div className="text-3xl font-bold mb-1 font-mono">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-xs text-primary-100 mb-3">
              {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            
            {attendanceStatus === 'out' && (!todayRecord || !todayRecord.timeOut) ? (
              <button 
                onClick={handleClockIn}
                disabled={loadingAttendance}
                className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <LogIn size={16} /> Clock In
              </button>
            ) : attendanceStatus === 'in' ? (
              <button 
                onClick={handleClockOut}
                disabled={loadingAttendance}
                className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                <LogOut size={16} /> Clock Out
              </button>
            ) : (
              <div className="w-full py-2 bg-gray-500/50 text-white rounded-md font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                <CheckCircle size={16} /> Completed
              </div>
            )}
          </div>

          {/* Decorative Circle */}
          <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          title="Total Employees" 
          value={stats.totalEmployees}
          subtext="Active database records"
          icon={Users}
          colorClass="bg-primary-500"
        />
        <StatCard 
          title="Payroll Cost" 
          value={`₱${(stats.payrollCost / 1000000).toFixed(2)}M`}
          subtext="Monthly basic salary total"
          icon={DollarSign}
          colorClass="bg-secondary-400 text-primary-900"
        />
        <StatCard 
          title="Attendance Rate" 
          value={`${adminStats.attendanceRate}%`}
          subtext="Present today"
          icon={Clock}
          colorClass="bg-primary-800"
        />
        <StatCard 
          title="Pending Requests" 
          value={adminStats.pendingRequests}
          subtext="Leaves & Adjustments"
          icon={AlertCircle}
          colorClass="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <Card title="Payroll History (6 Months)">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={adminStats.payrollHistory.length > 0 ? adminStats.payrollHistory : PAYROLL_HISTORY_DATA} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₱${value/1000}k`} />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    formatter={(value: number) => [`₱${value.toLocaleString()}`, 'Total Net Pay']}
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
            <div className="h-64 w-full flex items-center justify-center">
              {dynamicDeptDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={dynamicDeptDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dynamicDeptDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 text-sm text-center">No data available</div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {dynamicDeptDistribution.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-xs text-gray-600">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Announcement Wall Section */}
      <Card 
        title="Announcement Wall" 
        action={
          <Button size="sm" variant="outline" className="flex items-center gap-2">
            <Megaphone size={14} /> Post New
          </Button>
        }
      >
        <div className="space-y-4">
          {ANNOUNCEMENTS.map((item) => (
            <AnnouncementItem key={item.id} item={item} />
          ))}
        </div>
      </Card>

      {/* Footer */}
      <footer className="mt-6 py-3 border-t border-gray-200 bg-white rounded-lg">
        <div className="text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} HRIS Payroll Management System. All rights reserved.</p>
          <p className="mt-1 text-xs">Version 1.0.0 </p>
        </div>
      </footer>
    </div>
  );
};

const EmployeeDashboard: React.FC<{ user: AppUser }> = ({ user }) => {
  const [attendanceStatus, setAttendanceStatus] = useState<'in' | 'out'>('out');
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [stats, setStats] = useState({
    pendingTasks: 0,
    nextPayday: '-',
    latestNetPay: 0,
    leaveCredits: 0
  });

  useEffect(() => {
    if (user.employeeId) {
      // Fetch attendance status
      const fetchStatus = async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const response = await api.get('/attendance', {
            params: {
              employeeId: user.employeeId,
              startDate: today,
              endDate: today
            }
          });
          
          if (response.data.length > 0) {
            const record = response.data[0];
            setTodayRecord(record);
            if (record.timeIn && !record.timeOut) {
              setAttendanceStatus('in');
            } else {
              setAttendanceStatus('out');
            }
          }
        } catch (error) {
          console.error('Failed to fetch attendance status', error);
        } finally {
          setLoadingAttendance(false);
        }
      };
      
      fetchStatus();

      // Fetch dashboard stats
      api.get(`/employees/${user.employeeId}/dashboard-stats`)
        .then(res => setStats(res.data))
        .catch(err => console.error('Failed to fetch stats', err));
    }
  }, [user.employeeId]);

  const handleClockIn = async () => {
    if (!user.employeeId) {
      alert('Your account is not linked to an employee record. Please contact HR.');
      return;
    }
    setLoadingAttendance(true);
    try {
      await api.post('/attendance/clock-in', {
        employeeId: user.employeeId,
        timestamp: new Date().toISOString()
      });
      setAttendanceStatus('in');
      // Refresh record
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get('/attendance', {
        params: { employeeId: user.employeeId, startDate: today, endDate: today }
      });
      if (response.data.length > 0) setTodayRecord(response.data[0]);
    } catch (error) {
      console.error('Failed to clock in', error);
      alert('Failed to clock in');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleClockOut = async () => {
    if (!user.employeeId) {
      alert('Your account is not linked to an employee record. Please contact HR.');
      return;
    }
    setLoadingAttendance(true);
    try {
      await api.post('/attendance/clock-out', {
        employeeId: user.employeeId,
        timestamp: new Date().toISOString()
      });
      setAttendanceStatus('out');
       // Refresh record
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get('/attendance', {
        params: { employeeId: user.employeeId, startDate: today, endDate: today }
      });
      if (response.data.length > 0) setTodayRecord(response.data[0]);
    } catch (error) {
      console.error('Failed to clock out', error);
      alert('Failed to clock out');
    } finally {
      setLoadingAttendance(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Welcome Section with Clock In/Out */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-600 rounded-lg p-6 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">Welcome back, {user.name.split(' ')[0]}!</h2>
          <p className="text-primary-100 max-w-xl mb-4">
            You have <span className="font-bold text-white">{stats.pendingTasks}</span> pending tasks today.
          </p>
           <div className="flex gap-2">
             <Button variant="secondary" size="sm">View Payslip</Button>
             <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors backdrop-blur-sm">File Leave</button>
           </div>
        </div>
        
        {/* Clock In/Out Card */}
        <div className="relative z-10 bg-white/10 backdrop-blur-md p-4 rounded-lg border border-white/20 w-full md:w-auto min-w-[200px]">
            <p className="text-primary-100 text-xs font-medium uppercase tracking-wide mb-2">Time Tracker</p>
            <div className="text-3xl font-bold mb-1 font-mono">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-xs text-primary-100 mb-3">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            
            {attendanceStatus === 'out' && (!todayRecord || !todayRecord.timeOut) ? (
                <button 
                    onClick={handleClockIn}
                    disabled={loadingAttendance}
                    className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                    <LogIn size={16} /> Clock In
                </button>
            ) : attendanceStatus === 'in' ? (
                <button 
                    onClick={handleClockOut}
                    disabled={loadingAttendance}
                    className="w-full py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                    <LogOut size={16} /> Clock Out
                </button>
            ) : (
                <div className="w-full py-2 bg-gray-500/50 text-white rounded-md font-semibold text-sm flex items-center justify-center gap-2 cursor-not-allowed">
                    <CheckCircle size={16} /> Completed
                </div>
            )}
        </div>

        {/* Decorative Circle */}
        <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* Personal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard 
          title="Next Payday" 
          value={stats.nextPayday}
          subtext="Upcoming"
          icon={Calendar}
          colorClass="bg-primary-500"
        />
        <StatCard 
          title="Latest Net Pay" 
          value={`₱${stats.latestNetPay.toLocaleString()}`}
          subtext="Last Period"
          icon={CreditCard}
          colorClass="bg-green-600"
        />
        <StatCard 
          title="Leave Credits" 
          value={stats.leaveCredits.toFixed(1)}
          subtext="Available Days"
          icon={FileText}
          colorClass="bg-blue-500"
        />
        <StatCard 
          title="Attendance" 
          value={todayRecord ? (todayRecord.status === 'PRESENT' ? 'Present' : todayRecord.status) : 'No Record'}
          subtext="Today"
          icon={CheckCircle}
          colorClass={todayRecord ? "bg-teal-500" : "bg-gray-400"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Announcement Wall */}
        <div className="lg:col-span-2">
           <Card title="Announcement Wall">
             <div className="space-y-4">
               {ANNOUNCEMENTS.map((item) => (
                 <AnnouncementItem key={item.id} item={item} />
               ))}
             </div>
             <div className="mt-4 text-center">
                <button className="text-sm text-primary-600 font-medium hover:text-primary-800">View Older Posts</button>
             </div>
           </Card>
        </div>

        {/* Quick Links / Reminders */}
        <div className="space-y-4">
           <Card title="Reminders">
             <div className="space-y-3">
               <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Tax Annualization</p>
                  <p className="text-xs opacity-90">Please submit your Form 2316 from previous employer by May 20.</p>
               </div>
               <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
                  <p className="font-semibold mb-1">Company Townhall</p>
                  <p className="text-xs opacity-90">Join us on May 18 at 3:00 PM via Zoom.</p>
               </div>
             </div>
           </Card>

           <div className="bg-primary-900 rounded-lg p-4 text-white relative overflow-hidden">
              <h3 className="font-bold text-base relative z-10">Need Assistance?</h3>
              <p className="text-sm text-primary-200 mt-2 relative z-10 mb-4">Contact HR for payroll discrepancies or filing concerns.</p>
              <Button size="sm" variant="secondary" className="w-full relative z-10">Contact Support</Button>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                 <Users size={100} />
              </div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 py-3 border-t border-gray-200 bg-white rounded-lg">
        <div className="text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} HRIS Payroll Management System. All rights reserved.</p>
          <p className="mt-1 text-xs">Version 1.0.0 </p>
        </div>
      </footer>
    </div>
  );
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  return user.role === UserRole.EMPLOYEE ? <EmployeeDashboard user={user} /> : <AdminDashboard />;
};

export default Dashboard;

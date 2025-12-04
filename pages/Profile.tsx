import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import api from '../lib/axios';
import { User, Briefcase, FileText, Heart, MapPin, Phone, Mail, Calendar, Clock, Award } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { getEmployeeById } = useData();
  const [activeTab, setActiveTab] = useState('personal');
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [leaveBalance, setLeaveBalance] = useState<any>(null);
  const [loadingBalance, setLoadingBalance] = useState(true);

  // Fetch today's attendance - MUST be before any conditional returns
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      if (!user?.employeeId) {
        setLoadingAttendance(false);
        return;
      }

      try {
        setLoadingAttendance(true);
        const today = new Date().toISOString().split('T')[0];
        const response = await api.get('/attendance', {
          params: {
            employeeId: user.employeeId,
            date: today
          }
        });
        
        // Get today's attendance (first record if exists)
        if (response.data && response.data.length > 0) {
          console.log('Today\'s attendance data:', response.data[0]);
          setTodayAttendance(response.data[0]);
        } else {
          console.log('No attendance data found for today');
        }
      } catch (error) {
        console.error('Failed to fetch attendance:', error);
      } finally {
        setLoadingAttendance(false);
      }
    };

    fetchTodayAttendance();
  }, [user?.employeeId]);

  // Fetch leave balance
  useEffect(() => {
    const fetchLeaveBalance = async () => {
      if (!user?.employeeId) {
        setLoadingBalance(false);
        return;
      }

      try {
        setLoadingBalance(true);
        const response = await api.get(`/leaves/balance/${user.employeeId}`);
        setLeaveBalance(response.data);
      } catch (error) {
        console.error('Failed to fetch leave balance:', error);
      } finally {
        setLoadingBalance(false);
      }
    };

    fetchLeaveBalance();
  }, [user?.employeeId]);


  if (!user || !user.employeeId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <User size={64} className="mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold">Profile Not Available</h2>
        <p>Your user account is not linked to an employee record.</p>
      </div>
    );
  }

  const employee = getEmployeeById(user.employeeId);

  if (!employee) {
    return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">
        Error: Employee record not found for ID {user.employeeId}
      </div>
    );
  }

  const InfoItem = ({ label, value }: { label: string, value: string | number | undefined }) => (
    <div>
      <span className="block text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-0.5">{label}</span>
      <span className="block text-sm font-medium text-gray-900">{value || 'N/A'}</span>
    </div>
  );

  const TabButton = ({ tabName, label }: { tabName: string, label: string }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
        activeTab === tabName
          ? 'bg-white text-primary-700 shadow-sm border border-gray-200'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-20 bg-gradient-to-r from-primary-700 to-primary-500"></div>
          <div className="px-4 -mt-10 flex items-end gap-3">
            <img
              src={employee.avatarUrl}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-white"
            />
            <div className="pb-1">
              <h1 className="text-xl font-bold text-gray-900">{employee.firstName} {employee.lastName}</h1>
              <p className="text-xs text-gray-500">{employee.position}</p>
            </div>
          </div>
          <div className="px-4 py-3 flex flex-wrap gap-2 items-center border-b border-gray-100">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 uppercase tracking-wide">
              {employee.department}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-50 text-green-700 uppercase tracking-wide">
              {employee.status}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 uppercase tracking-wide">
              ID: {employee.id}
            </span>
          </div>
          <div className="p-1 bg-gray-50/50 flex gap-1 overflow-x-auto">
              <TabButton tabName="personal" label="Personal Info" />
              <TabButton tabName="employment" label="Employment" />
              <TabButton tabName="ids" label="Government IDs" />
              <TabButton tabName="emergency" label="Emergency Contact" />
          </div>
        </div>
        
        {/* Tab Content */}
        <div>
          {activeTab === 'personal' && (
            <Card>
              <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3 uppercase tracking-wide">
                  <User size={16} className="text-primary-500" />
                  Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoItem label="First Name" value={employee.firstName} />
                  <InfoItem label="Middle Name" value={employee.middleName} />
                  <InfoItem label="Last Name" value={employee.lastName} />
                  <InfoItem label="Gender" value={employee.gender} />
                  <InfoItem label="Civil Status" value={employee.civilStatus} />
                  <InfoItem label="Birth Date" value={new Date(employee.birthDate).toLocaleDateString()} />
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                    <InfoItem label="Email Address" value={employee.email} />
                    <InfoItem label="Contact Number" value={employee.contactNo} />
                    <div className="md:col-span-3">
                      <span className="block text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-0.5">Address</span>
                      <p className="text-sm text-gray-800">{employee.address}</p>
                    </div>
                  </div>
              </div>
            </Card>
          )}

          {activeTab === 'employment' && (
            <Card>
               <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3 uppercase tracking-wide">
                  <Briefcase size={16} className="text-primary-500" />
                  Employment Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <InfoItem label="Department" value={employee.department} />
                  <InfoItem label="Position" value={employee.position} />
                  <InfoItem label="Date Hired" value={new Date(employee.dateHired).toLocaleDateString()} />
                  <div className="col-span-full pt-3 border-t border-gray-100">
                      <span className="block text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-0.5">Monthly Salary</span>
                      <span className="text-lg font-mono font-semibold text-gray-900">
                          ₱{employee.basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                  </div>
              </div>
            </Card>
          )}

          {activeTab === 'ids' && (
             <Card>
               <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3 uppercase tracking-wide">
                  <FileText size={16} className="text-primary-500" />
                  Government IDs
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <InfoItem label="SSS No." value={employee.governmentIds?.sss} />
                 <InfoItem label="PhilHealth No." value={employee.governmentIds?.philHealth} />
                 <InfoItem label="Pag-IBIG No." value={employee.governmentIds?.pagIbig} />
                 <InfoItem label="TIN" value={employee.governmentIds?.tin} />
              </div>
            </Card>
          )}

          {activeTab === 'emergency' && (
             <Card>
               <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2 mb-3 uppercase tracking-wide">
                  <Heart size={16} className="text-primary-500" />
                  Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <InfoItem label="Full Name" value={employee.emergencyContact?.fullName} />
                 <InfoItem label="Relationship" value={employee.emergencyContact?.relationship} />
                 <InfoItem label="Contact Number" value={employee.emergencyContact?.contactNumber} />
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="lg:col-span-1 space-y-4">
          <Card title="Leave Credits">
            {loadingBalance ? (
              <div className="text-center text-sm text-gray-500 py-4">Loading...</div>
            ) : leaveBalance ? (
              <div className="space-y-3">
                {/* Top 4 leave types including unpaid */}
                {['VACATION', 'SICK_LEAVE', 'EMERGENCY_LEAVE', 'UNPAID_LEAVE'].map(leaveType => {
                  const balance = leaveBalance.leaveBalances[leaveType];
                  const label = leaveType.replace('_', ' ');
                  const isUnpaid = leaveType === 'UNPAID_LEAVE';
                  return (
                    <div key={leaveType} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award size={14} className={isUnpaid ? "text-gray-400" : "text-blue-600"} />
                        <span className="text-xs font-medium text-gray-700">{label}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {isUnpaid ? '∞' : (balance?.remaining || 0)}
                        </span>
                        {!isUnpaid && (
                          <span className="text-xs text-gray-500"> / {balance?.entitlement || 0} days</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-700 uppercase">Total Remaining</span>
                    <span className="text-sm font-bold text-primary-600">
                      {leaveBalance.totals?.remaining || 0} days
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-gray-500 py-4">
                No leave balance data
              </div>
            )}
          </Card>

          <Card title="Work Schedule">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{employee.workSchedule || 'Not Set'}</p>
                <p className="text-xs text-gray-500">Regular Shift</p>
              </div>
            </div>
          </Card>

          <Card title="Today's Attendance">
            {loadingAttendance ? (
              <div className="text-center text-sm text-gray-500 py-4">Loading...</div>
            ) : todayAttendance ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500 uppercase">Time In</span>
                  <span className="font-semibold text-gray-800 text-sm">
                    {todayAttendance.timeIn 
                      ? new Date(todayAttendance.timeIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                      : '--:--'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">Time Out</span>
                  <span className={`font-semibold text-sm ${todayAttendance.timeOut ? 'text-gray-800' : 'text-red-500'}`}>
                    {todayAttendance.timeOut 
                      ? new Date(todayAttendance.timeOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
                      : '--:--'
                    }
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                    todayAttendance.timeOut 
                      ? 'bg-gray-100 text-gray-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {todayAttendance.timeOut ? 'Clocked Out' : 'On Duty'}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center text-sm text-gray-500 py-4">
                No attendance record for today
              </div>
            )}
          </Card>
      </div>
    </div>
  );
};

export default Profile;

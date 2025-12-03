import React, { useState } from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { User, Briefcase, FileText, Heart, MapPin, Phone, Mail, Calendar, Clock } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { getEmployeeById } = useData();
  const [activeTab, setActiveTab] = useState('personal');

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
      <span className="block text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="block text-sm font-medium text-gray-900">{value || 'N/A'}</span>
    </div>
  );

  const TabButton = ({ tabName, label }: { tabName: string, label: string }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabName
          ? 'bg-primary-100 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-primary-700 to-primary-500"></div>
          <div className="p-4 -mt-12 flex items-end gap-4">
            <img
              src={employee.avatarUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg bg-white"
            />
            <div className="pb-1">
              <h1 className="text-2xl font-bold text-gray-900">{employee.firstName} {employee.lastName}</h1>
              <p className="text-gray-500">{employee.position}</p>
            </div>
          </div>
          <div className="px-6 pb-4 flex flex-wrap gap-2 items-center border-b border-gray-200">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
              {employee.department}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">
              {employee.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
              ID: {employee.id}
            </span>
          </div>
          <div className="p-2 bg-gray-50/50 flex gap-1">
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
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <User size={20} className="text-primary-500" />
                  Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InfoItem label="First Name" value={employee.firstName} />
                  <InfoItem label="Middle Name" value={employee.middleName} />
                  <InfoItem label="Last Name" value={employee.lastName} />
                  <InfoItem label="Gender" value={employee.gender} />
                  <InfoItem label="Civil Status" value={employee.civilStatus} />
                  <InfoItem label="Birth Date" value={new Date(employee.birthDate).toLocaleDateString()} />
                  <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
                    <InfoItem label="Email Address" value={employee.email} />
                    <InfoItem label="Contact Number" value={employee.contactNo} />
                    <div className="md:col-span-3">
                      <span className="block text-xs text-gray-500 uppercase tracking-wide">Address</span>
                      <p className="text-sm text-gray-800">{employee.address}</p>
                    </div>
                  </div>
              </div>
            </Card>
          )}

          {activeTab === 'employment' && (
            <Card>
               <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                  <Briefcase size={20} className="text-primary-500" />
                  Employment Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <InfoItem label="Department" value={employee.department} />
                  <InfoItem label="Position" value={employee.position} />
                  <InfoItem label="Date Hired" value={new Date(employee.dateHired).toLocaleDateString()} />
                  <div className="col-span-full pt-4 border-t border-gray-100">
                      <span className="block text-xs text-gray-500 uppercase tracking-wide">Monthly Salary</span>
                      <span className="text-xl font-mono font-semibold text-gray-900">
                          ₱{employee.basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                  </div>
              </div>
            </Card>
          )}

          {activeTab === 'ids' && (
             <Card>
               <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                  <FileText size={20} className="text-primary-500" />
                  Government IDs
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                 <InfoItem label="SSS No." value={employee.governmentIds?.sss} />
                 <InfoItem label="PhilHealth No." value={employee.governmentIds?.philHealth} />
                 <InfoItem label="Pag-IBIG No." value={employee.governmentIds?.pagIbig} />
                 <InfoItem label="TIN" value={employee.governmentIds?.tin} />
              </div>
            </Card>
          )}

          {activeTab === 'emergency' && (
             <Card>
               <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                  <Heart size={20} className="text-primary-500" />
                  Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <InfoItem label="Full Name" value={employee.emergencyContact?.fullName} />
                 <InfoItem label="Relationship" value={employee.emergencyContact?.relationship} />
                 <InfoItem label="Contact Number" value={employee.emergencyContact?.contactNumber} />
              </div>
            </Card>
          )}
        </div>
      </div>

      <div className="lg:col-span-1 space-y-6">
          <Card title="Today's Attendance">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-500">Time In</span>
                <span className="font-semibold text-gray-800">08:05 AM</span>
            </div>
            <div className="flex justify-between items-center mt-3">
                <span className="text-sm font-medium text-gray-500">Time Out</span>
                <span className="font-semibold text-red-500">--:--</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                    On Duty
                </span>
            </div>
          </Card>
      </div>
    </div>
  );
};

export default Profile;

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { User, Briefcase, FileText, Heart, MapPin, Phone, Mail, Calendar } from 'lucide-react';

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
    <div className="max-w-6xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-primary-700 to-primary-500"></div>
        <div className="p-6 -mt-16 flex items-end gap-6">
          <img
            src={employee.avatarUrl}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg bg-white"
          />
          <div className="pb-1">
            <h1 className="text-3xl font-bold text-gray-900">{employee.firstName} {employee.lastName}</h1>
            <p className="text-gray-600 font-medium">{employee.position}</p>
          </div>
        </div>
        <div className="px-6 pb-4 flex flex-wrap gap-3 items-center border-b border-gray-200">
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
        <div className="p-4 bg-gray-50/50 flex gap-2">
            <TabButton tabName="personal" label="Personal Info" />
            <TabButton tabName="employment" label="Employment" />
            <TabButton tabName="ids" label="Government IDs" />
            <TabButton tabName="emergency" label="Emergency Contact" />
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'personal' && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                    <User size={20} className="text-primary-500" />
                    Personal Details
                </h3>
                <div className="space-y-4">
                    <InfoItem label="First Name" value={employee.firstName} />
                    <InfoItem label="Middle Name" value={employee.middleName} />
                    <InfoItem label="Last Name" value={employee.lastName} />
                    <InfoItem label="Gender" value={employee.gender} />
                    <InfoItem label="Civil Status" value={employee.civilStatus} />
                    <InfoItem label="Birth Date" value={new Date(employee.birthDate).toLocaleDateString()} />
                </div>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                        <MapPin size={20} className="text-primary-500" />
                        Address
                    </h3>
                    <p className="text-sm text-gray-700">{employee.address}</p>
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                        <Phone size={20} className="text-primary-500" />
                        Contact
                    </h3>
                    <div className="space-y-4">
                        <InfoItem label="Email Address" value={employee.email} />
                        <InfoItem label="Contact Number" value={employee.contactNo} />
                    </div>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'employment' && (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
             <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                <Briefcase size={20} className="text-primary-500" />
                Employment Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <InfoItem label="Department" value={employee.department} />
                <InfoItem label="Position" value={employee.position} />
                <InfoItem label="Date Hired" value={new Date(employee.dateHired).toLocaleDateString()} />
                <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wide">Monthly Salary</span>
                    <span className="text-xl font-mono font-semibold text-gray-900">
                        ₱{employee.basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'ids' && (
           <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
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
          </div>
        )}

        {activeTab === 'emergency' && (
           <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8">
             <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-6">
                <Heart size={20} className="text-primary-500" />
                Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <InfoItem label="Full Name" value={employee.emergencyContact?.fullName} />
               <InfoItem label="Relationship" value={employee.emergencyContact?.relationship} />
               <InfoItem label="Contact Number" value={employee.emergencyContact?.contactNumber} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

import React from 'react';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { User, Briefcase, FileText, Heart, MapPin, Phone, Mail, Calendar } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { getEmployeeById } = useData();

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

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
      <Icon size={18} className="text-primary-500" />
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">{title}</h3>
    </div>
  );

  const InfoItem = ({ label, value }: { label: string, value: string | number | undefined }) => (
    <div className="mb-3">
      <span className="block text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</span>
      <span className="block text-sm font-medium text-gray-900">{value || '-'}</span>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-primary-800 to-primary-600 z-0"></div>
        
        <div className="relative z-10 mt-12 sm:mt-8">
            <img 
              src={employee.avatarUrl} 
              alt="Profile" 
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md bg-white"
            />
        </div>
        
        <div className="relative z-10 sm:mt-16 text-center sm:text-left flex-1">
           <h1 className="text-2xl font-bold text-gray-900">{employee.firstName} {employee.lastName}</h1>
           <p className="text-gray-500 font-medium">{employee.position}</p>
           <div className="flex flex-wrap gap-3 mt-3 justify-center sm:justify-start">
             <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
               {employee.department}
             </span>
             <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
               {employee.status}
             </span>
             <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-600 border border-gray-200">
               ID: {employee.id}
             </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <SectionHeader icon={User} title="Personal Information" />
          <div className="grid grid-cols-2 gap-4">
             <InfoItem label="First Name" value={employee.firstName} />
             <InfoItem label="Last Name" value={employee.lastName} />
             <InfoItem label="Middle Name" value={employee.middleName} />
             <InfoItem label="Gender" value={employee.gender} />
             <InfoItem label="Civil Status" value={employee.civilStatus} />
             <InfoItem label="Birth Date" value={employee.birthDate} />
             <InfoItem label="Age" value={employee.age} />
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-50 border-dashed">
            <div className="grid grid-cols-1 gap-4">
               <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-gray-400 mt-0.5" />
                  <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wide">Address</span>
                    <span className="text-sm text-gray-900">{employee.address}</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Mail size={16} className="text-gray-400" />
                  <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wide">Email</span>
                    <span className="text-sm text-gray-900">{employee.email}</span>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <Phone size={16} className="text-gray-400" />
                  <div>
                    <span className="block text-xs text-gray-500 uppercase tracking-wide">Contact No.</span>
                    <span className="text-sm text-gray-900">{employee.contactNo}</span>
                  </div>
               </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionHeader icon={Briefcase} title="Employment" />
             <div className="grid grid-cols-2 gap-4">
               <InfoItem label="Department" value={employee.department} />
               <InfoItem label="Position" value={employee.position} />
               <div className="col-span-2 flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <div>
                     <span className="block text-xs text-gray-500 uppercase tracking-wide">Date Hired</span>
                     <span className="text-sm font-semibold text-gray-900">{new Date(employee.dateHired).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
               </div>
               <div className="col-span-2 pt-2 border-t border-gray-50">
                   <span className="block text-xs text-gray-500 uppercase tracking-wide mb-1">Basic Monthly Salary</span>
                   <span className="text-lg font-mono font-bold text-gray-900">₱{employee.basicSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
               </div>
            </div>
          </Card>

          <Card>
            <SectionHeader icon={FileText} title="Government IDs" />
             <div className="grid grid-cols-2 gap-4">
               <InfoItem label="SSS No." value={employee.governmentIds?.sss} />
               <InfoItem label="PhilHealth No." value={employee.governmentIds?.philHealth} />
               <InfoItem label="Pag-IBIG No." value={employee.governmentIds?.pagIbig} />
               <InfoItem label="TIN" value={employee.governmentIds?.tin} />
            </div>
          </Card>

          <Card>
            <SectionHeader icon={Heart} title="Emergency Contact" />
             <div className="grid grid-cols-1 gap-4">
               <InfoItem label="Name" value={employee.emergencyContact?.fullName} />
               <div className="grid grid-cols-2 gap-4">
                  <InfoItem label="Relationship" value={employee.emergencyContact?.relationship} />
                  <InfoItem label="Contact No." value={employee.emergencyContact?.contactNumber} />
               </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
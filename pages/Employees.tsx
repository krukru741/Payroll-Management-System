import React, { useState } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { MOCK_EMPLOYEES } from '../constants';
import { Employee, EmployeeStatus, Department } from '../types';
import { Plus, Search, Filter, MoreHorizontal, Mail, Edit, Trash2, Camera, User, Briefcase, DollarSign } from 'lucide-react';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Initial Form State
  const initialFormState = {
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    department: Department.ENGINEERING,
    status: EmployeeStatus.ACTIVE,
    dateHired: new Date().toISOString().split('T')[0],
    basicSalary: 0,
  };

  const [formData, setFormData] = useState(initialFormState);

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE: return 'bg-green-100 text-green-800';
      case EmployeeStatus.INACTIVE: return 'bg-gray-100 text-gray-800';
      case EmployeeStatus.ON_LEAVE: return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'basicSalary' ? (value === '' ? 0 : parseFloat(value)) : value
    }));
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleEdit = (employee: Employee) => {
    setEditingId(employee.id);
    setFormData({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      status: employee.status,
      dateHired: employee.dateHired,
      basicSalary: employee.basicSalary,
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    }
    setActiveMenuId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing employee
      setEmployees(prev => prev.map(emp => 
        emp.id === editingId 
          ? { ...emp, ...formData } 
          : emp
      ));
    } else {
      // Add new employee
      const newEmployee: Employee = {
        id: `EMP-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
        ...formData,
        avatarUrl: `https://picsum.photos/100/100?random=${Math.floor(Math.random() * 1000)}`
      };
      setEmployees([newEmployee, ...employees]);
    }
    
    handleCloseModal();
  };

  // Get current avatar for edit mode
  const currentAvatar = editingId 
    ? employees.find(e => e.id === editingId)?.avatarUrl 
    : `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=0D8ABC&color=fff`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <p className="text-gray-500 text-sm">Manage your team members and their roles.</p>
        </div>
        <Button onClick={handleOpenAddModal}>
          <Plus size={18} className="mr-2" />
          Add Employee
        </Button>
      </div>

      <Card className="p-0">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-white">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search by name or department..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={18} />
            Filters
          </Button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Employee ID</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Hired</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                    {emp.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-8 w-8 rounded-full object-cover border border-gray-200 mr-3" src={emp.avatarUrl} alt="" />
                      <div className="text-sm font-medium text-gray-900">{emp.firstName}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {emp.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {emp.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {emp.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(emp.status)}`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(emp.dateHired).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`mailto:${emp.email}`} className="text-gray-400 hover:text-primary-500 p-1" title="Send Email">
                        <Mail size={16} />
                      </a>
                      
                      <div className="relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                          className={`p-1 rounded transition-colors ${activeMenuId === emp.id ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-primary-500'}`}
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === emp.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 text-left">
                              <button 
                                onClick={() => handleEdit(emp)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit size={14} className="text-gray-500" /> Edit Details
                              </button>
                              <button 
                                onClick={() => handleDelete(emp.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 size={14} className="text-red-500" /> Delete Employee
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                    No employees found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-sm text-gray-500">Showing {filteredEmployees.length} of {employees.length} results</span>
          <div className="flex gap-2">
             <Button variant="outline" size="sm" disabled>Previous</Button>
             <Button variant="outline" size="sm">Next</Button>
          </div>
        </div>
      </Card>

      {/* Add/Edit Employee Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingId ? "Edit Employee Details" : "New Employee Registration"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Profile Photo Section */}
          <div className="flex items-center gap-5 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="relative">
               <img 
                 src={currentAvatar} 
                 alt="Profile" 
                 className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
               />
               <button type="button" className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm border border-gray-200 text-gray-500 hover:text-primary-600 transition-colors">
                 <Camera size={14} />
               </button>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Profile Photo</h4>
              <p className="text-xs text-gray-500 mt-1">Upload a professional photo (JPG, PNG).<br/>Max size 2MB.</p>
            </div>
          </div>

          {/* Personal Info Group */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
              <User size={16} className="text-primary-500" />
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Personal Information</h4>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  required
                  placeholder="e.g. John"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  required
                  placeholder="e.g. Doe"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="john.doe@company.com"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Employment Details Group */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 mt-2">
              <Briefcase size={16} className="text-primary-500" />
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Employment Details</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Position</label>
                <input
                  type="text"
                  name="position"
                  required
                  placeholder="e.g. Software Engineer"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  value={formData.position}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Department</label>
                <div className="relative">
                  <select
                    name="department"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    {Object.values(Department).map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Date Hired</label>
                <input
                  type="date"
                  name="dateHired"
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                  value={formData.dateHired}
                  onChange={handleInputChange}
                />
              </div>

               <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
                <div className="relative">
                  <select
                    name="status"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm appearance-none"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    {Object.values(EmployeeStatus).map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Compensation Group */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100 mt-2">
              <DollarSign size={16} className="text-primary-500" />
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Compensation</h4>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Basic Monthly Salary</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₱</span>
                <input
                  type="number"
                  name="basicSalary"
                  min="0"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm font-mono"
                  value={formData.basicSalary || ''}
                  onChange={handleInputChange}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">This amount is used for tax and contribution calculations.</p>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit">{editingId ? 'Save Changes' : 'Register Employee'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
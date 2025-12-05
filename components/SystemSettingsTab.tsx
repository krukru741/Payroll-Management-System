import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Building2, DollarSign, Calendar, Clock, Settings as SettingsIcon, Loader } from 'lucide-react';
import api from '../lib/axios';
import Button from './Button';

interface SystemSettings {
  company?: any;
  payroll?: any;
  leave?: any;
  attendance?: any;
  system?: any;
}

const SystemSettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('company');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/settings');
      setSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (category: string, data: any) => {
    setSaving(category);
    try {
      await api.put(`/settings/${category}`, { settings: data });
      alert('Settings saved successfully');
      fetchSettings();
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(null);
    }
  };

  const updateSetting = (category: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof SystemSettings],
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Loader className="animate-spin mx-auto mb-2" size={32} />
        <p className="text-gray-500">Loading settings...</p>
      </div>
    );
  }

  const sections = [
    { id: 'company', label: 'Company Information', icon: Building2 },
    { id: 'payroll', label: 'Payroll Configuration', icon: DollarSign },
    { id: 'leave', label: 'Leave Policies', icon: Calendar },
    { id: 'attendance', label: 'Attendance Rules', icon: Clock },
    { id: 'system', label: 'System Preferences', icon: SettingsIcon }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">System Settings</h2>
        <p className="text-sm text-gray-500">Configure system-wide settings and policies</p>
      </div>

      {/* Section Navigation */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {sections.map(section => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon size={16} />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Company Information */}
      {activeSection === 'company' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 size={20} />
            Company Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={settings.company?.name || ''}
                onChange={(e) => updateSetting('company', 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={settings.company?.address || ''}
                onChange={(e) => updateSetting('company', 'address', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={settings.company?.phone || ''}
                  onChange={(e) => updateSetting('company', 'phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.company?.email || ''}
                  onChange={(e) => updateSetting('company', 'email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / Business Registration</label>
              <input
                type="text"
                value={settings.company?.taxId || ''}
                onChange={(e) => updateSetting('company', 'taxId', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={() => handleSave('company', settings.company)} disabled={saving === 'company'}>
                {saving === 'company' ? <><Loader size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </Button>
              <Button variant="outline" onClick={fetchSettings}>
                <RotateCcw size={16} /> Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payroll Configuration */}
      {activeSection === 'payroll' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign size={20} />
            Payroll Configuration
          </h3>
          <div className="space-y-6">
            {/* Pay Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pay Period</label>
              <select
                value={settings.payroll?.payPeriod || 'SEMI_MONTHLY'}
                onChange={(e) => updateSetting('payroll', 'payPeriod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="SEMI_MONTHLY">Semi-Monthly (15th & End of Month)</option>
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>

            {/* Tax Rates */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Withholding Tax Rates (%)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">0 - 250,000</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.taxRates?.bracket1 || 0}
                    onChange={(e) => updateSetting('payroll', 'taxRates', {
                      ...settings.payroll?.taxRates,
                      bracket1: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">250,001 - 400,000</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.taxRates?.bracket2 || 15}
                    onChange={(e) => updateSetting('payroll', 'taxRates', {
                      ...settings.payroll?.taxRates,
                      bracket2: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">400,001 - 800,000</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.taxRates?.bracket3 || 20}
                    onChange={(e) => updateSetting('payroll', 'taxRates', {
                      ...settings.payroll?.taxRates,
                      bracket3: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">800,001 - 2,000,000</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.taxRates?.bracket4 || 25}
                    onChange={(e) => updateSetting('payroll', 'taxRates', {
                      ...settings.payroll?.taxRates,
                      bracket4: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">2,000,001 - 8,000,000</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.taxRates?.bracket5 || 30}
                    onChange={(e) => updateSetting('payroll', 'taxRates', {
                      ...settings.payroll?.taxRates,
                      bracket5: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Above 8,000,000</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.taxRates?.bracket6 || 35}
                    onChange={(e) => updateSetting('payroll', 'taxRates', {
                      ...settings.payroll?.taxRates,
                      bracket6: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* SSS/PhilHealth/Pag-IBIG Rates */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Government Contribution Rates (%)</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">SSS Employee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.sssRate?.employee || 4.5}
                    onChange={(e) => updateSetting('payroll', 'sssRate', {
                      ...settings.payroll?.sssRate,
                      employee: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">SSS Employer</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.sssRate?.employer || 9.5}
                    onChange={(e) => updateSetting('payroll', 'sssRate', {
                      ...settings.payroll?.sssRate,
                      employer: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">SSS EC (Employer)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.sssRate?.ec || 1.0}
                    onChange={(e) => updateSetting('payroll', 'sssRate', {
                      ...settings.payroll?.sssRate,
                      ec: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">PhilHealth Employee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.philHealthRate?.employee || 2.0}
                    onChange={(e) => updateSetting('payroll', 'philHealthRate', {
                      ...settings.payroll?.philHealthRate,
                      employee: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">PhilHealth Employer</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.philHealthRate?.employer || 2.0}
                    onChange={(e) => updateSetting('payroll', 'philHealthRate', {
                      ...settings.payroll?.philHealthRate,
                      employer: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Pag-IBIG Employee</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.pagIbigRate?.employee || 2.0}
                    onChange={(e) => updateSetting('payroll', 'pagIbigRate', {
                      ...settings.payroll?.pagIbigRate,
                      employee: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Pag-IBIG Employer</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.pagIbigRate?.employer || 2.0}
                    onChange={(e) => updateSetting('payroll', 'pagIbigRate', {
                      ...settings.payroll?.pagIbigRate,
                      employer: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
            
            {/* Overtime Multipliers */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Overtime Multipliers</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Regular OT</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.overtimeMultipliers?.regular || 1.25}
                    onChange={(e) => updateSetting('payroll', 'overtimeMultipliers', {
                      ...settings.payroll?.overtimeMultipliers,
                      regular: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Rest Day</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.overtimeMultipliers?.restDay || 1.3}
                    onChange={(e) => updateSetting('payroll', 'overtimeMultipliers', {
                      ...settings.payroll?.overtimeMultipliers,
                      restDay: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Special Holiday</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.overtimeMultipliers?.specialHoliday || 1.3}
                    onChange={(e) => updateSetting('payroll', 'overtimeMultipliers', {
                      ...settings.payroll?.overtimeMultipliers,
                      specialHoliday: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Regular Holiday</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.overtimeMultipliers?.regularHoliday || 2.0}
                    onChange={(e) => updateSetting('payroll', 'overtimeMultipliers', {
                      ...settings.payroll?.overtimeMultipliers,
                      regularHoliday: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Late Deductions */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">Late Deductions</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Deduction per minute (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.lateDeduction?.perMinute || 0}
                    onChange={(e) => updateSetting('payroll', 'lateDeduction', {
                      ...settings.payroll?.lateDeduction,
                      perMinute: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Deduction per hour (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={settings.payroll?.lateDeduction?.perHour || 0}
                    onChange={(e) => updateSetting('payroll', 'lateDeduction', {
                      ...settings.payroll?.lateDeduction,
                      perHour: parseFloat(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input
                  type="checkbox"
                  id="enableLateDeduction"
                  checked={settings.payroll?.lateDeduction?.enabled || false}
                  onChange={(e) => updateSetting('payroll', 'lateDeduction', {
                    ...settings.payroll?.lateDeduction,
                    enabled: e.target.checked
                  })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="enableLateDeduction" className="text-sm text-gray-700">Enable automatic late deductions</label>
              </div>
            </div>

            {/* 13th Month */}
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">13th Month Pay Calculation</label>
              <select
                value={settings.payroll?.thirteenthMonthMethod || 'BASIC_SALARY'}
                onChange={(e) => updateSetting('payroll', 'thirteenthMonthMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="BASIC_SALARY">Basic Salary Only</option>
                <option value="TOTAL_EARNINGS">Total Earnings (with allowances)</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={() => handleSave('payroll', settings.payroll)} disabled={saving === 'payroll'}>
                {saving === 'payroll' ? <><Loader size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </Button>
              <Button variant="outline" onClick={fetchSettings}>
                <RotateCcw size={16} /> Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Policies */}
      {activeSection === 'leave' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar size={20} />
            Leave Policies
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vacation Leave (days/year)</label>
                <input
                  type="number"
                  value={settings.leave?.vacationLeave || 15}
                  onChange={(e) => updateSetting('leave', 'vacationLeave', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sick Leave (days/year)</label>
                <input
                  type="number"
                  value={settings.leave?.sickLeave || 15}
                  onChange={(e) => updateSetting('leave', 'sickLeave', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Leave (days/year)</label>
                <input
                  type="number"
                  value={settings.leave?.emergencyLeave || 3}
                  onChange={(e) => updateSetting('leave', 'emergencyLeave', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maternity Leave (days)</label>
                <input
                  type="number"
                  value={settings.leave?.maternityLeave || 105}
                  onChange={(e) => updateSetting('leave', 'maternityLeave', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paternity Leave (days)</label>
                <input
                  type="number"
                  value={settings.leave?.paternityLeave || 7}
                  onChange={(e) => updateSetting('leave', 'paternityLeave', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accrual Method</label>
              <select
                value={settings.leave?.accrualMethod || 'ANNUAL'}
                onChange={(e) => updateSetting('leave', 'accrualMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="ANNUAL">Annual (All credits at start of year)</option>
                <option value="MONTHLY">Monthly (Prorated per month)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="allowCarryOver"
                checked={settings.leave?.allowCarryOver || false}
                onChange={(e) => updateSetting('leave', 'allowCarryOver', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="allowCarryOver" className="text-sm text-gray-700">Allow carry-over of unused leave credits</label>
            </div>

            {settings.leave?.allowCarryOver && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Carry-Over (days)</label>
                <input
                  type="number"
                  value={settings.leave?.maxCarryOver || 5}
                  onChange={(e) => updateSetting('leave', 'maxCarryOver', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={() => handleSave('leave', settings.leave)} disabled={saving === 'leave'}>
                {saving === 'leave' ? <><Loader size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </Button>
              <Button variant="outline" onClick={fetchSettings}>
                <RotateCcw size={16} /> Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Rules */}
      {activeSection === 'attendance' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={20} />
            Attendance Rules
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work Start Time</label>
                <input
                  type="time"
                  value={settings.attendance?.workStart || '08:00'}
                  onChange={(e) => updateSetting('attendance', 'workStart', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Work End Time</label>
                <input
                  type="time"
                  value={settings.attendance?.workEnd || '17:00'}
                  onChange={(e) => updateSetting('attendance', 'workEnd', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grace Period (minutes)</label>
              <input
                type="number"
                value={settings.attendance?.gracePeriodMinutes || 15}
                onChange={(e) => updateSetting('attendance', 'gracePeriodMinutes', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">Late arrivals within this period won't be marked as late</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requireOTApproval"
                checked={settings.attendance?.requireOTApproval || false}
                onChange={(e) => updateSetting('attendance', 'requireOTApproval', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="requireOTApproval" className="text-sm text-gray-700">Require approval for overtime</label>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={() => handleSave('attendance', settings.attendance)} disabled={saving === 'attendance'}>
                {saving === 'attendance' ? <><Loader size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </Button>
              <Button variant="outline" onClick={fetchSettings}>
                <RotateCcw size={16} /> Reset
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* System Preferences */}
      {activeSection === 'system' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <SettingsIcon size={20} />
            System Preferences
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Format</label>
                <select
                  value={settings.system?.dateFormat || 'MM/DD/YYYY'}
                  onChange={(e) => updateSetting('system', 'dateFormat', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={settings.system?.currency || 'PHP'}
                  onChange={(e) => updateSetting('system', 'currency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="PHP">PHP (₱)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={settings.system?.timezone || 'Asia/Manila'}
                onChange={(e) => updateSetting('system', 'timezone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="Asia/Manila">Asia/Manila (GMT+8)</option>
                <option value="UTC">UTC</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="emailNotifications"
                checked={settings.system?.emailNotifications || false}
                onChange={(e) => updateSetting('system', 'emailNotifications', e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="emailNotifications" className="text-sm text-gray-700">Enable email notifications</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.system?.sessionTimeout || 30}
                onChange={(e) => updateSetting('system', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={() => handleSave('system', settings.system)} disabled={saving === 'system'}>
                {saving === 'system' ? <><Loader size={16} className="animate-spin" /> Saving...</> : <><Save size={16} /> Save Changes</>}
              </Button>
              <Button variant="outline" onClick={fetchSettings}>
                <RotateCcw size={16} /> Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettingsTab;

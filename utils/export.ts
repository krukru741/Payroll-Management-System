import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Employee } from '../types';
import { PayrollResult } from './payroll';

// Define type for autoTable using intersection to preserve jsPDF methods
type JsPDFWithAutoTable = jsPDF & {
  lastAutoTable: { finalY: number };
};

export const generatePayslipPDF = (employee: Employee, payroll: PayrollResult, period: { start: string, end: string }) => {
  const doc = new jsPDF() as JsPDFWithAutoTable;

  // -- Styling Constants --
  const PRIMARY_COLOR = [7, 102, 83]; // #076653
  const TEXT_COLOR = [30, 30, 30];
  const LINE_COLOR = [200, 200, 200];

  // -- Header --
  doc.setFillColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYSLIP', 14, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('PayrollSys Inc.', 14, 32);

  doc.text(`Period: ${period.start} to ${period.end}`, 196, 25, { align: 'right' });
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 196, 32, { align: 'right' });

  // -- Employee Details --
  doc.setTextColor(TEXT_COLOR[0], TEXT_COLOR[1], TEXT_COLOR[2]);
  doc.setFontSize(10);
  
  const startY = 55;
  
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE DETAILS', 14, startY);
  doc.setDrawColor(LINE_COLOR[0], LINE_COLOR[1], LINE_COLOR[2]);
  doc.line(14, startY + 2, 196, startY + 2);

  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${employee.lastName}, ${employee.firstName} ${employee.middleName || ''}`, 14, startY + 10);
  doc.text(`Employee ID: ${employee.id}`, 14, startY + 16);
  doc.text(`Department: ${employee.department}`, 100, startY + 10);
  doc.text(`Position: ${employee.position}`, 100, startY + 16);
  
  // -- Earnings Table --
  const currencyFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });
  
  const earningsData = [
    ['Basic Salary (Semi-Monthly)', currencyFormatter.format(employee.basicSalary / 2)],
    ['Overtime', currencyFormatter.format(payroll.grossPay - (employee.basicSalary / 2))],
    ['', ''],
    ['TOTAL EARNINGS', currencyFormatter.format(payroll.grossPay)]
  ];

  autoTable(doc, {
    startY: startY + 25,
    head: [['EARNINGS', 'AMOUNT']],
    body: earningsData,
    theme: 'striped',
    headStyles: { fillColor: [7, 102, 83], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 'auto', halign: 'right' }
    },
    didParseCell: function (data) {
        if (data.row.index === earningsData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
        }
    }
  });

  // -- Deductions Table --
  const deductionsData = [
    ['SSS Contribution', currencyFormatter.format(payroll.deductions.sss)],
    ['PhilHealth Contribution', currencyFormatter.format(payroll.deductions.philHealth)],
    ['Pag-IBIG Contribution', currencyFormatter.format(payroll.deductions.pagIbig)],
    ['Withholding Tax', currencyFormatter.format(payroll.deductions.tax)],
    ['', ''],
    ['TOTAL DEDUCTIONS', `(${currencyFormatter.format(payroll.deductions.total)})`]
  ];

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [['DEDUCTIONS', 'AMOUNT']],
    body: deductionsData,
    theme: 'striped',
    headStyles: { fillColor: [180, 50, 50], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 'auto', halign: 'right' }
    },
    didParseCell: function (data) {
        if (data.row.index === deductionsData.length - 1) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [200, 50, 50];
        }
    }
  });

  // -- Net Pay --
  const netPayY = doc.lastAutoTable.finalY + 15;
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(14, netPayY, 182, 20, 2, 2, 'F');
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('NET PAY', 20, netPayY + 13);
  
  doc.setFontSize(16);
  doc.text(currencyFormatter.format(payroll.netPay), 180, netPayY + 13, { align: 'right' });

  // -- Footer --
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150, 150, 150);
  doc.text('This is a system generated payslip.', 105, 280, { align: 'center' });

  doc.save(`Payslip_${employee.lastName}_${period.start}.pdf`);
};

export const exportPayrollToExcel = (
  data: { emp: Employee, grossPay: number, deductions: { total: number }, netPay: number }[], 
  period: { start: string, end: string }
) => {
  // Flatten data for Excel
  const excelData = data.map(item => ({
    'Employee ID': item.emp.id,
    'Last Name': item.emp.lastName,
    'First Name': item.emp.firstName,
    'Department': item.emp.department,
    'Position': item.emp.position,
    'Gross Pay': item.grossPay,
    'Total Deductions': item.deductions.total,
    'Net Pay': item.netPay,
    'Payment Status': 'Processed'
  }));

  const worksheet = XLSX.utils.json_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  
  XLSX.utils.book_append_sheet(workbook, worksheet, "Payroll Register");
  
  // Set column widths
  const wscols = [
    { wch: 15 }, // ID
    { wch: 15 }, // Last
    { wch: 15 }, // First
    { wch: 20 }, // Dept
    { wch: 20 }, // Pos
    { wch: 15 }, // Gross
    { wch: 15 }, // Ded
    { wch: 15 }, // Net
    { wch: 15 }, // Status
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `Payroll_Register_${period.start}_${period.end}.xlsx`);
};
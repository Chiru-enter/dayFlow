import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { getOvertimeRequests } from './overtimeService';

const getMonthBounds = (period) => ({
  start: `${period}-01`,
  end: `${period}-31`,
});

const inPeriod = (date, period) => {
  const { start, end } = getMonthBounds(period);
  return date >= start && date <= end;
};

const daysInPeriod = (period) => {
  const [year, month] = period.split('-').map(Number);
  const days = new Date(year, month, 0).getDate();
  let workingDays = 0;
  for (let day = 1; day <= days; day += 1) {
    const weekday = new Date(year, month - 1, day).getDay();
    if (weekday !== 0 && weekday !== 6) workingDays += 1;
  }
  return workingDays;
};

export const calculatePayslip = async (employee, period) => {
  const [attendanceSnapshot, leaveSnapshot, overtime] = await Promise.all([
    getDocs(collection(db, 'attendance')),
    getDocs(collection(db, 'leaveRequests')),
    getOvertimeRequests(employee.uid),
  ]);

  const attendance = attendanceSnapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) => item.userId === employee.uid && inPeriod(item.date, period));
  const leaves = leaveSnapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) => item.userId === employee.uid && inPeriod(item.startDate, period));
  const approvedOvertime = overtime.filter((item) => item.status?.toLowerCase() === 'approved' && inPeriod(item.date, period));
  const salary = employee.salary || {};
  const basicSalary = Number(salary.base) || 0;
  const allowances = Number(salary.allowances) || 0;
  const deductions = Number(salary.deductions) || 0;
  const overtimeHours = approvedOvertime.reduce((total, item) => total + (Number(item.hours) || 0), 0);
  const overtimeRate = Number(salary.overtimeRate ?? employee.overtimeRate) || 0;
  const overtimePay = overtimeHours * overtimeRate;
  const grossEarnings = basicSalary + allowances + overtimePay;
  const totalDeductions = deductions;
  const halfDays = leaves.filter((item) => item.type?.toLowerCase().includes('half') && item.status?.toLowerCase() === 'approved').length;
  const leaveDays = leaves
    .filter((item) => !item.type?.toLowerCase().includes('half') && item.status?.toLowerCase() === 'approved')
    .reduce((total, item) => total + Math.max(1, Math.round((new Date(item.endDate) - new Date(item.startDate)) / 86400000) + 1), 0);

  return {
    employeeUid: employee.uid,
    payPeriod: period,
    generatedAt: new Date().toISOString(),
    employee: {
      name: employee.name || employee.displayName || 'Employee',
      employeeId: employee.employeeId || '',
      email: employee.email || '',
      department: employee.department || '',
      jobTitle: employee.jobTitle || '',
    },
    earnings: { basicSalary, allowances, overtimePay, other: 0, grossEarnings },
    deductions: { pf: deductions, tax: 0, other: 0, total: totalDeductions },
    netSalary: grossEarnings - totalDeductions,
    attendance: {
      workingDays: daysInPeriod(period),
      presentDays: attendance.filter((item) => item.status?.toLowerCase() === 'present').length,
      halfDays,
      leaveDays,
      overtimeHours,
    },
  };
};

export const savePayslip = async (payslip) => {
  await setDoc(doc(db, 'users', payslip.employeeUid, 'payslips', payslip.payPeriod), payslip);
  return payslip;
};

export const getPayslipHistory = async (employeeUid) => {
  const snapshot = await getDocs(collection(db, 'users', employeeUid, 'payslips'));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => b.payPeriod.localeCompare(a.payPeriod));
};

export const downloadPayslip = (payslip) => {
  const lines = [
    `DAYFLOW PAYSLIP - ${payslip.payPeriod}`,
    `Employee: ${payslip.employee.name}`,
    `Employee ID: ${payslip.employee.employeeId}`,
    `Email: ${payslip.employee.email}`,
    `Department: ${payslip.employee.department}`,
    `Job title: ${payslip.employee.jobTitle}`,
    '',
    `Basic salary: ${payslip.earnings.basicSalary}`,
    `Allowances: ${payslip.earnings.allowances}`,
    `Overtime (${payslip.attendance.overtimeHours} hours): ${payslip.earnings.overtimePay}`,
    `Gross earnings: ${payslip.earnings.grossEarnings}`,
    `Deductions: ${payslip.deductions.total}`,
    `Net salary: ${payslip.netSalary}`,
    '',
    `Working days: ${payslip.attendance.workingDays}`,
    `Present days: ${payslip.attendance.presentDays}`,
    `Half days: ${payslip.attendance.halfDays}`,
    `Leave days: ${payslip.attendance.leaveDays}`,
  ];
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain' }));
  link.download = `dayflow-payslip-${payslip.payPeriod}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
};

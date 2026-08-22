import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';

export const getAllEmployees = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const employees = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
    return employees;
  } catch (err) {
    console.error('Error fetching employees:', err);
    throw err;
  }
};

export const updateEmployeeSalary = async (uid, salaryData) => {
  try {
    const docRef = doc(db, 'users', uid);
    await updateDoc(docRef, {
      salary: salaryData,
    });
    return salaryData;
  } catch (err) {
    console.error('Error updating employee salary:', err);
    throw err;
  }
};

export const getPayrollRecords = async () => {
  return [];
};

export const processPayroll = async () => {
  return null;
};
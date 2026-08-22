import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';

const USERS_COLLECTION = 'users';

/**
 * Fetch all employees from the users collection
 * @returns {Promise<Array>} Array of employee objects with uid
 */
export const getAllEmployees = async () => {
  try {
    const snapshot = await getDocs(collection(db, USERS_COLLECTION));
    const employees = snapshot.docs.map((doc) => ({
      uid: doc.id,
      ...doc.data(),
    }));
    return employees;
  } catch (err) {
    console.error('Error fetching all employees:', err);
    throw err;
  }
};

/**
 * Fetch a specific employee by UID
 * @param {string} uid - The employee's document UID
 * @returns {Promise<Object|null>} Employee object with uid, or null if not found
 */
export const getEmployeeById = async (uid) => {
  if (!uid) {
    return null;
  }

  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      uid: docSnap.id,
      ...docSnap.data(),
    };
  } catch (err) {
    console.error('Error fetching employee:', err);
    throw err;
  }
};

/**
 * Update employee information (only supplied fields)
 * @param {string} uid - The employee's document UID
 * @param {Object} data - Fields to update (name, email, phone, address, jobTitle, department, joinDate, role, etc.)
 * @returns {Promise<Object>} Updated employee data
 */
export const updateEmployee = async (uid, data) => {
  if (!uid) {
    throw new Error('Employee UID is required');
  }

  if (!data || Object.keys(data).length === 0) {
    throw new Error('Update data is required');
  }

  try {
    const docRef = doc(db, USERS_COLLECTION, uid);
    await updateDoc(docRef, data);

    // Return the updated employee data with UID
    return {
      uid,
      ...data,
    };
  } catch (err) {
    console.error('Error updating employee:', err);
    throw err;
  }
};

export const getUsers = async () => {
  return [];
};

export const getUserProfile = async () => {
  return null;
};
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';

const CONCERNS_COLLECTION = 'employeeConcerns';

const mapConcern = (item) => ({ id: item.id, ...item.data() });

export const createConcern = async ({ employeeUid, employeeName, employeeId, department, jobTitle, subject, category, description }) => {
  if (!employeeUid) throw new Error('Please sign in before submitting a concern.');
  if (!subject?.trim() || !category || !description?.trim()) {
    throw new Error('Please complete the subject, category, and description.');
  }

  const concern = {
    employeeUid,
    employeeName: employeeName || 'Employee',
    employeeId: employeeId || '',
    department: department || '',
    jobTitle: jobTitle || '',
    subject: subject.trim(),
    category,
    description: description.trim(),
    status: 'Pending',
    adminResponse: '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const concernRef = await addDoc(collection(db, CONCERNS_COLLECTION), concern);
  return { id: concernRef.id, ...concern };
};

export const getMyConcerns = async (employeeUid) => {
  if (!employeeUid) return [];
  const snapshot = await getDocs(query(
    collection(db, CONCERNS_COLLECTION),
    where('employeeUid', '==', employeeUid),
    orderBy('createdAt', 'desc'),
  ));
  return snapshot.docs.map(mapConcern);
};

export const getAllConcerns = async () => {
  const snapshot = await getDocs(query(
    collection(db, CONCERNS_COLLECTION),
    orderBy('createdAt', 'desc'),
  ));
  return snapshot.docs.map(mapConcern);
};

export const updateConcern = async (concernId, updates) => {
  if (!concernId) throw new Error('Concern ID is required.');
  await updateDoc(doc(db, CONCERNS_COLLECTION, concernId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

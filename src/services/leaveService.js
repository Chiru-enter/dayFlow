import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';

const LEAVE_REQUESTS_COLLECTION = 'leaveRequests';

export const getMyLeaveRequests = async (userId) => {
  if (!userId) {
    return [];
  }

  const q = query(
    collection(db, LEAVE_REQUESTS_COLLECTION),
    where('userId', '==', userId),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const submitLeaveRequest = async (userId, leaveData = {}) => {
  if (!userId) {
    throw new Error('Please sign in to submit a leave request.');
  }

  const payload = {
    userId,
    type: leaveData.type || '',
    startDate: leaveData.startDate || '',
    endDate: leaveData.endDate || '',
    remarks: leaveData.remarks || '',
    status: 'Pending',
    adminComment: '',
    updatedAt: serverTimestamp(),
  };

  const ref = await addDoc(collection(db, LEAVE_REQUESTS_COLLECTION), payload);
  return { id: ref.id, ...payload };
};

export const getLeaveRequest = async (requestId) => {
  if (!requestId) {
    return null;
  }

  const ref = doc(db, LEAVE_REQUESTS_COLLECTION, requestId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return { id: snapshot.id, ...snapshot.data() };
};
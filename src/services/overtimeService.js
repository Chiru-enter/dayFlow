import { addDoc, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firestore';

const COLLECTION = 'overtimeRequests';

export const getOvertimeRequests = async (userId) => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((item) => !userId || item.userId === userId);
};

export const submitOvertimeRequest = async (userId, data) => {
  if (!userId) throw new Error('Please sign in to submit overtime.');
  const payload = {
    userId,
    date: data.date,
    hours: Number(data.hours) || 0,
    reason: data.reason || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  const ref = await addDoc(collection(db, COLLECTION), payload);
  return { id: ref.id, ...payload };
};

export const updateOvertimeStatus = async (requestId, status, adminComment = '') => {
  await updateDoc(doc(db, COLLECTION, requestId), {
    status,
    adminComment,
    updatedAt: new Date().toISOString(),
  });
};

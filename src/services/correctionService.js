import { addDoc, collection, doc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';
import { createNotification } from './notificationService';

const COLLECTION = 'attendanceCorrections';
export const getCorrections = async (userId) => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).filter((item) => !userId || item.userId === userId);
};
export const submitCorrection = async (userId, data) => {
  const payload = { userId, date: data.date, requestedCheckIn: data.requestedCheckIn, requestedCheckOut: data.requestedCheckOut, reason: data.reason, status: 'pending', createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(db, COLLECTION), payload);
  return { id: ref.id, ...payload };
};
export const decideCorrection = async (request, status, adminComment = '') => {
  await updateDoc(doc(db, COLLECTION, request.id), { status, adminComment, updatedAt: new Date().toISOString() });
  if (status === 'approved') {
    const attendanceId = `${request.userId}_${request.date}`;
    await setDoc(doc(db, 'attendance', attendanceId), {
      userId: request.userId,
      date: request.date,
      checkIn: request.requestedCheckIn || null,
      checkOut: request.requestedCheckOut || null,
      status: 'Present',
    }, { merge: true });
  }
  await createNotification({ userId: request.userId, type: `attendance-correction-${status}`, title: `Attendance correction ${status}`, message: `Your attendance correction for ${request.date} was ${status}.` });
};

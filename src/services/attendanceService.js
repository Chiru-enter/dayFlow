import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  addDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';

const ATTENDANCE_COLLECTION = 'attendance';

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const getDateRange = () => {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  return {
    startKey: start.toISOString().slice(0, 10),
    endKey: end.toISOString().slice(0, 10),
  };
};

export const getTodayAttendance = async (userId) => {
  if (!userId) {
    return null;
  }

  const todayKey = getTodayKey();
  const q = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('userId', '==', userId),
    where('date', '==', todayKey),
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return null;
  }

  const [record] = snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  return record;
};

export const getWeeklyAttendance = async (userId) => {
  if (!userId) {
    return [];
  }

  const { startKey } = getDateRange();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 6);
  const endKey = endDate.toISOString().slice(0, 10);

  const q = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('userId', '==', userId),
    where('date', '>=', startKey),
    where('date', '<=', endKey),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const checkIn = async (userId) => {
  if (!userId) {
    throw new Error('Please sign in to check in.');
  }

  const todayKey = getTodayKey();
  const todayAttendance = await getTodayAttendance(userId);

  if (todayAttendance) {
    const attendanceRef = doc(db, ATTENDANCE_COLLECTION, todayAttendance.id);
    await updateDoc(attendanceRef, {
      checkIn: new Date().toISOString(),
      status: 'Present',
    });
    return { ...todayAttendance, checkIn: new Date().toISOString(), status: 'Present' };
  }

  const attendanceRef = doc(collection(db, ATTENDANCE_COLLECTION));
  const payload = {
    userId,
    date: todayKey,
    checkIn: new Date().toISOString(),
    checkOut: null,
    status: 'Present',
  };

  await setDoc(attendanceRef, payload);
  return { id: attendanceRef.id, ...payload };
};

export const checkOut = async (userId) => {
  if (!userId) {
    throw new Error('Please sign in to check out.');
  }

  const todayAttendance = await getTodayAttendance(userId);

  if (!todayAttendance) {
    throw new Error('No check-in record found for today.');
  }

  const attendanceRef = doc(db, ATTENDANCE_COLLECTION, todayAttendance.id);
  const checkOutTime = new Date().toISOString();

  await updateDoc(attendanceRef, {
    checkOut: checkOutTime,
    status: 'Present',
  });

  return {
    ...todayAttendance,
    checkOut: checkOutTime,
    status: 'Present',
  };
};
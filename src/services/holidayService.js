import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';

const COLLECTION = 'holidays';
export const getHolidays = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
};
export const createHoliday = async (data) => {
  const ref = await addDoc(collection(db, COLLECTION), data);
  return { id: ref.id, ...data };
};
export const updateHoliday = (id, data) => updateDoc(doc(db, COLLECTION, id), data);
export const deleteHoliday = (id) => deleteDoc(doc(db, COLLECTION, id));

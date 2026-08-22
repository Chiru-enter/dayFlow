import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firestore';

const COLLECTION = 'announcements';
export const getAnnouncements = async () => {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort((a, b) => String(b.publicationDate || '').localeCompare(String(a.publicationDate || '')));
};
export const createAnnouncement = async (data) => {
  const payload = { ...data, publicationDate: data.publicationDate || new Date().toISOString().slice(0, 10), createdAt: new Date().toISOString() };
  const ref = await addDoc(collection(db, COLLECTION), payload);
  return { id: ref.id, ...payload };
};
export const updateAnnouncement = (id, data) => updateDoc(doc(db, COLLECTION, id), data);
export const deleteAnnouncement = (id) => deleteDoc(doc(db, COLLECTION, id));

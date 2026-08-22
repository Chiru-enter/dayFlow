import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/firestore';

const NOTIFICATIONS_COLLECTION = 'notifications';
const USERS_COLLECTION = 'users';

const notificationsCollection = collection(db, NOTIFICATIONS_COLLECTION);

export const createNotification = async ({ userId, type, title, message }) => {
  if (!userId) throw new Error('A notification recipient is required.');
  if (!title || !message) throw new Error('A notification title and message are required.');

  const notification = {
    userId,
    type: type || 'general',
    title,
    message,
    read: false,
    createdAt: serverTimestamp(),
  };

  const notificationRef = await addDoc(notificationsCollection, notification);
  return { id: notificationRef.id, ...notification };
};

export const createNotificationsForAdmins = async (notification) => {
  const adminsSnapshot = await getDocs(
    query(collection(db, USERS_COLLECTION), where('role', '==', 'admin')),
  );

  return Promise.all(
    adminsSnapshot.docs.map((admin) => createNotification({ ...notification, userId: admin.id })),
  );
};

export const getNotifications = async (userId) => {
  if (!userId) return [];

  const snapshot = await getDocs(query(
    notificationsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
  ));

  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
};

export const subscribeToNotifications = (userId, onChange, onError) => {
  if (!userId) return () => {};

  return onSnapshot(
    query(notificationsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc')),
    (snapshot) => onChange(snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))),
    onError,
  );
};

export const getUnreadNotificationCount = async (userId) => {
  if (!userId) return 0;

  const snapshot = await getDocs(query(
    notificationsCollection,
    where('userId', '==', userId),
    where('read', '==', false),
  ));
  return snapshot.size;
};

export const markNotificationAsRead = async (notificationId, userId) => {
  if (!notificationId || !userId) return;
  const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
  const notificationSnapshot = await getDoc(notificationRef);
  if (!notificationSnapshot.exists() || notificationSnapshot.data().userId !== userId) {
    throw new Error('You can only update your own notifications.');
  }
  await updateDoc(notificationRef, { read: true });
};

export const markAllNotificationsAsRead = async (userId) => {
  if (!userId) return;

  const snapshot = await getDocs(query(
    notificationsCollection,
    where('userId', '==', userId),
    where('read', '==', false),
  ));
  const batch = writeBatch(db);
  snapshot.docs.forEach((item) => batch.update(item.ref, { read: true }));
  await batch.commit();
};

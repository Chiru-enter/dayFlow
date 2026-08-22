<<<<<<< Updated upstream
import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase/auth';
import { db } from '../firebase/firestore';
=======
import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../firebase/auth";
import { db } from "../firebase/firestore";
>>>>>>> Stashed changes

const AuthContext = createContext(null);

const emptyProfile = {
  employeeId: '', role: 'employee', phone: '', address: '', profilePicUrl: '',
  jobTitle: '', department: '', joinDate: '',
  salary: { base: 0, allowances: 0, deductions: 0 },
};

const getAuthError = (error) => ({
  'auth/email-already-in-use': 'An account already exists for this email.',
  'auth/invalid-credential': 'The email or password is incorrect.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/user-not-found': 'The email or password is incorrect.',
}[error?.code] || 'Authentication failed. Please try again.');

const profileForUser = async (firebaseUser) => {
  const snapshot = await getDoc(doc(db, 'users', firebaseUser.uid));
  return { ...firebaseUser, ...(snapshot.exists() ? snapshot.data() : emptyProfile) };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
<<<<<<< Updated upstream
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setUser(await profileForUser(firebaseUser));
    } catch {
      setUser({ ...firebaseUser, ...emptyProfile });
    } finally {
      setLoading(false);
    }
  }), []);

  const login = async (email, password) => {
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const nextUser = await profileForUser(credential.user);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      throw new Error(getAuthError(error));
    }
  };

  const signup = async ({ name, email, password, employeeId, role }) => {
    if (!name.trim() || !email.trim() || !password || !employeeId.trim() || !role) {
      throw new Error('Please complete all required fields.');
    }
    try {
      const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await updateProfile(credential.user, { displayName: name.trim() });
      const profile = { ...emptyProfile, name: name.trim(), email: email.trim(), employeeId: employeeId.trim(), role };
      await setDoc(doc(db, 'users', credential.user.uid), profile);
      const nextUser = { ...credential.user, ...profile };
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      throw new Error(getAuthError(error));
    }
  };

  return <AuthContext.Provider value={{ user, loading, login, signup, logout: () => signOut(auth) }}>{children}</AuthContext.Provider>;
=======
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setUserProfile(userDocSnap.data());
          } else {
            console.warn("User profile not found in Firestore");
            setUserProfile(null);
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    logout,
    setUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
>>>>>>> Stashed changes
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
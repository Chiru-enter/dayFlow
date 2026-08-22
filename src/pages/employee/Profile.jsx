import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../firebase/firestore';

function Profile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        const snapshot = await getDoc(doc(db, 'users', user.uid));
        if (!snapshot.exists()) {
          setError('Your employee profile is not available yet.');
          return;
        }
        const data = snapshot.data();
        setProfile(data);
        setForm({ name: data.name || user.displayName || '', phone: data.phone || '', address: data.address || '' });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load your profile.');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [authLoading, user]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.uid) return;
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await updateDoc(doc(db, 'users', user.uid), { name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() });
      setProfile((current) => ({ ...current, ...form }));
      setSuccessMessage('Profile updated successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save your profile.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <EmployeeFrame><Loading message="Loading your profile..." /></EmployeeFrame>;
  if (!user) return <EmployeeFrame><div className="empty-state">Please sign in to view your profile.</div></EmployeeFrame>;
  if (!profile) return <EmployeeFrame><div className="empty-state error-state">{error || 'Your employee profile is not available yet.'}</div></EmployeeFrame>;

  return <EmployeeFrame><section className="panel profile-panel"><div className="panel-header"><div><p className="eyebrow">Account</p><h3>Employee profile</h3></div></div><form onSubmit={handleSubmit}><div className="leave-form-grid">
    <ProfileField label="Name" name="name" value={form.name} onChange={handleChange} />
    <ProfileField label="Email" value={profile.email || user.email || ''} readOnly />
    <ProfileField label="Employee ID" value={profile.employeeId || 'Not provided'} readOnly />
    <ProfileField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
    <ProfileField label="Job title" value={profile.jobTitle || 'Not provided'} readOnly />
    <ProfileField label="Department" value={profile.department || 'Not provided'} readOnly />
    <ProfileField label="Join date" value={profile.joinDate || 'Not provided'} readOnly />
    <div className="field-group full-span"><label htmlFor="profile-address">Address</label><textarea id="profile-address" name="address" rows="3" value={form.address} onChange={handleChange} /></div>
  </div>{error && <div className="empty-state error-state" role="alert">{error}</div>}{successMessage && <div className="empty-state success-state" role="status">{successMessage}</div>}<div className="leave-actions"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button></div></form></section></EmployeeFrame>;
}

function ProfileField({ label, name, value, onChange, readOnly = false }) {
  return <div className="field-group"><label htmlFor={name || label}>{label}</label><input id={name || label} name={name} value={value} onChange={onChange} readOnly={readOnly} /></div>;
}

function EmployeeFrame({ children }) {
  return <div className="employee-page-shell"><Sidebar /><main className="employee-main-panel"><Navbar title="Profile" />{children}</main></div>;
}

export default Profile;
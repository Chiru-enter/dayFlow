<<<<<<< Updated upstream
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
=======
import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firestore";

const initialForm = {
  phone: "",
  address: "",
  profilePicUrl: "",
};

const styles = {
  page: { minHeight: "100vh", padding: "40px 24px", background: "#f5f7fb", color: "#172033", textAlign: "left" },
  shell: { maxWidth: "980px", margin: "0 auto" },
  header: { marginBottom: "28px" },
  eyebrow: { margin: "0 0 8px", color: "#64748b", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" },
  title: { margin: 0, color: "#172033", fontSize: "32px", lineHeight: 1.2 },
  subtitle: { margin: "10px 0 0", color: "#64748b", fontSize: "16px" },
  grid: { display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(280px, 0.8fr)", gap: "20px", alignItems: "start" },
  card: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "24px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)" },
  sectionTitle: { margin: "0 0 20px", color: "#172033", fontSize: "19px" },
  fields: { display: "grid", gap: "17px" },
  label: { display: "grid", gap: "7px", color: "#334155", fontSize: "14px", fontWeight: 600 },
  input: { width: "100%", boxSizing: "border-box", padding: "11px 12px", border: "1px solid #cbd5e1", borderRadius: "6px", color: "#172033", background: "#fff", font: "inherit" },
  readOnly: { padding: "10px 0", borderBottom: "1px solid #e2e8f0", color: "#475569", fontSize: "15px" },
  button: { marginTop: "22px", padding: "11px 18px", border: 0, borderRadius: "6px", background: "#2563eb", color: "#fff", fontWeight: 700, cursor: "pointer" },
  message: { margin: "16px 0 0", fontSize: "14px" },
};

function Profile() {
  const { user, userProfile, loading: authLoading, setUserProfile } = useAuth();
  const [profile, setProfile] = useState(userProfile);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (authLoading || !user) return;

      setLoading(true);
      setMessage({ type: "", text: "" });
      try {
        const profileSnapshot = await getDoc(doc(db, "users", user.uid));
        if (!profileSnapshot.exists()) throw new Error("Your employee profile could not be found.");

        const nextProfile = profileSnapshot.data();
        if (active) {
          setProfile(nextProfile);
          setForm({
            phone: nextProfile.phone || "",
            address: nextProfile.address || "",
            profilePicUrl: nextProfile.profilePicUrl || "",
          });
        }
      } catch (error) {
        if (active) setMessage({ type: "error", text: error.message || "Unable to load your profile." });
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();
    return () => { active = false; };
  }, [authLoading, user]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setMessage({ type: "", text: "" });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      await updateDoc(doc(db, "users", user.uid), form);
      const updatedProfile = { ...profile, ...form };
      setProfile(updatedProfile);
      setUserProfile(updatedProfile);
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Unable to save your profile." });
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || loading) return <main style={styles.page}><div style={styles.shell}><p>Loading your profile...</p></div></main>;
  if (!user || !profile) return <main style={styles.page}><div style={styles.shell}><p style={{ color: "#b42318" }}>{message.text || "Profile unavailable."}</p></div></main>;

  const readOnlyFields = [
    ["Employee ID", profile.employeeId || "Not assigned"],
    ["Email", profile.email || user.email || "Not available"],
    ["Job title", profile.jobTitle || "Not specified"],
    ["Department", profile.department || "Not specified"],
    ["Join date", profile.joinDate || "Not specified"],
  ];

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <header style={styles.header}>
          <p style={styles.eyebrow}>Employee workspace</p>
          <h1 style={styles.title}>My profile</h1>
          <p style={styles.subtitle}>Keep your contact details current for the HR team.</p>
        </header>
        <div style={styles.grid}>
          <form style={styles.card} onSubmit={handleSubmit}>
            <h2 style={styles.sectionTitle}>Contact information</h2>
            <div style={styles.fields}>
              <label style={styles.label} htmlFor="phone">Phone<input id="phone" name="phone" value={form.phone} onChange={handleChange} style={styles.input} /></label>
              <label style={styles.label} htmlFor="address">Address<textarea id="address" name="address" value={form.address} onChange={handleChange} rows="4" style={{ ...styles.input, resize: "vertical" }} /></label>
              <label style={styles.label} htmlFor="profilePicUrl">Profile picture URL<input id="profilePicUrl" name="profilePicUrl" type="url" value={form.profilePicUrl} onChange={handleChange} style={styles.input} /></label>
            </div>
            <button type="submit" disabled={saving} style={{ ...styles.button, opacity: saving ? 0.65 : 1 }}>{saving ? "Saving..." : "Save changes"}</button>
            {message.text && <p role="status" style={{ ...styles.message, color: message.type === "error" ? "#b42318" : "#147d4d" }}>{message.text}</p>}
          </form>
          <section style={styles.card} aria-labelledby="employment-details">
            <h2 id="employment-details" style={styles.sectionTitle}>Employment details</h2>
            <div style={styles.fields}>
              <div style={styles.readOnly}><strong>Name</strong><br />{profile.name || "Not available"}</div>
              {readOnlyFields.map(([label, value]) => <div key={label} style={styles.readOnly}><strong>{label}</strong><br />{value}</div>)}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
>>>>>>> Stashed changes
}

export default Profile;
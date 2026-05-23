import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { AdminFeedback } from '../../components/admin/AdminFeedback';
import { formatDate } from '../../lib/adminUtils';

const ROLES = ['customer', 'creator', 'admin'];

export function AdminShopProfilesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  async function load() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, role, verified, created_at, updated_at')
      .order('created_at', { ascending: false });
    if (error) setFeedback({ type: 'error', message: error.message });
    else setProfiles(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    document.title = 'Shop Profiles — CMS';
    load();
  }, []);

  async function updateProfile(id, patch) {
    const { error } = await supabase.from('profiles').update(patch).eq('id', id);
    if (error) setFeedback({ type: 'error', message: error.message });
    else {
      setFeedback({ type: 'success', message: 'Profile updated.' });
      load();
    }
  }

  if (loading) return <p style={{ color: 'var(--admin-muted)' }}>Loading…</p>;

  return (
    <>
      <h1 className="admin-page-title">Shop — Profiles</h1>
      <p style={{ color: 'var(--admin-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
        User accounts linked to auth. Assign <strong>admin</strong> or <strong>creator</strong> for marketplace roles.
      </p>
      <AdminFeedback feedback={feedback} />

      {profiles.length === 0 ? (
        <p style={{ color: 'var(--admin-muted)' }}>
          No profiles yet. Profiles are created when users sign up, or run migrations and sign in once.
        </p>
      ) : (
        <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Joined</th>
                <th>Save</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => (
                <ProfileRow key={p.id} profile={p} onSave={updateProfile} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function ProfileRow({ profile, onSave }) {
  const [role, setRole] = useState(profile.role);
  const [verified, setVerified] = useState(profile.verified);
  const [fullName, setFullName] = useState(profile.full_name ?? '');

  useEffect(() => {
    setRole(profile.role);
    setVerified(profile.verified);
    setFullName(profile.full_name ?? '');
  }, [profile]);

  return (
    <tr>
      <td>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={{ width: '100%', maxWidth: 180 }}
        />
      </td>
      <td style={{ color: 'var(--admin-muted)', fontSize: '0.8rem' }}>{profile.username ?? '—'}</td>
      <td>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </td>
      <td>
        <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
      </td>
      <td>{formatDate(profile.created_at)}</td>
      <td>
        <button
          type="button"
          className="admin-btn admin-btn-secondary admin-btn-sm"
          onClick={() => onSave(profile.id, { role, verified, full_name: fullName || null })}
        >
          Save
        </button>
      </td>
    </tr>
  );
}

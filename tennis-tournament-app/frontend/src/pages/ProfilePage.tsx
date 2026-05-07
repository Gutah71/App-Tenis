import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, getUserStats, updateName, updateEmail, updateNotifications } from '../services/userService';
import type { User, UserStats } from '../types';

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);

  const [notifToggling, setNotifToggling] = useState(false);

  useEffect(() => {
    Promise.all([getProfile(), getUserStats()])
      .then(([p, s]) => { setProfile(p); setStats(s); })
      .catch(() => {/* use cached user */})
      .finally(() => setLoading(false));
  }, []);

  const displayed = profile ?? authUser;

  async function handleSaveName() {
    if (!newName.trim()) return;
    setNameSaving(true);
    setNameError('');
    try {
      const updated = await updateName(newName.trim());
      setProfile(updated);
      updateUser(updated);
      setEditingName(false);
    } catch (e: unknown) {
      setNameError(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setNameSaving(false);
    }
  }

  async function handleSaveEmail() {
    if (!newEmail.trim()) return;
    setEmailSaving(true);
    setEmailError('');
    try {
      const updated = await updateEmail(newEmail.trim());
      setProfile(updated);
      updateUser(updated);
      setEditingEmail(false);
    } catch (e: unknown) {
      setEmailError(e instanceof Error ? e.message : 'Error al actualizar');
    } finally {
      setEmailSaving(false);
    }
  }

  async function handleToggleNotifications() {
    if (!displayed || notifToggling) return;
    setNotifToggling(true);
    try {
      const updated = await updateNotifications(!displayed.notificationsEnabled);
      setProfile(updated);
      updateUser(updated);
    } catch {
      // silently ignore
    } finally {
      setNotifToggling(false);
    }
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Cargando perfil...</p>;
  if (!displayed) return <p className="text-center py-16 text-gray-500">No has iniciado sesión.</p>;

  const ROLE_LABELS: Record<string, string> = { PLAYER: 'Jugador', ORGANIZER: 'Organizador' };

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12 space-y-6">
      <div className="card">
        <h1 className="section-title">Mi perfil</h1>
        <dl className="mt-6 space-y-5">
          <div className="pb-4 border-b border-brand-border">
            <dt className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Nombre de usuario</dt>
            {editingName ? (
              <div className="space-y-2">
                <input
                  autoFocus
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                  className="input-field"
                  placeholder="Nuevo nombre"
                  maxLength={50}
                />
                {nameError && <p className="text-xs text-red-400">{nameError}</p>}
                <div className="flex gap-2">
                  <button onClick={() => void handleSaveName()} disabled={nameSaving || !newName.trim()} className="btn-primary text-sm disabled:opacity-50">
                    {nameSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => { setEditingName(false); setNameError(''); }} className="btn-secondary text-sm">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <dd className="font-medium text-white">{displayed.name}</dd>
                <button
                  onClick={() => { setNewName(displayed.name); setEditingName(true); }}
                  className="text-xs text-brand-green hover:text-brand-green-light border border-brand-green/40 hover:border-brand-green px-3 py-1.5 rounded transition-colors"
                >
                  Editar nombre
                </button>
              </div>
            )}
          </div>
          <div className="pb-4 border-b border-brand-border">
            <dt className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Email</dt>
            {editingEmail ? (
              <div className="space-y-2">
                <input
                  autoFocus
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleSaveEmail(); if (e.key === 'Escape') setEditingEmail(false); }}
                  className="input-field"
                  placeholder="Nuevo email"
                />
                {emailError && <p className="text-xs text-red-400">{emailError}</p>}
                <div className="flex gap-2">
                  <button onClick={() => void handleSaveEmail()} disabled={emailSaving || !newEmail.trim()} className="btn-primary text-sm disabled:opacity-50">
                    {emailSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => { setEditingEmail(false); setEmailError(''); }} className="btn-secondary text-sm">Cancelar</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <dd className="font-medium text-white">{displayed.email}</dd>
                <button
                  onClick={() => { setNewEmail(displayed.email); setEditingEmail(true); }}
                  className="text-xs text-brand-green hover:text-brand-green-light border border-brand-green/40 hover:border-brand-green px-3 py-1.5 rounded transition-colors"
                >
                  Editar email
                </button>
              </div>
            )}
          </div>
          <div>
            <dt className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Rol</dt>
            <dd className="font-medium text-white mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-brand-green"></span>
              {ROLE_LABELS[displayed.role] ?? displayed.role}
            </dd>
          </div>
          <div className="pt-4 border-t border-brand-border">
            <div className="flex items-center justify-between">
              <div>
                <dt className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Notificaciones por email</dt>
                <dd className="text-sm text-gray-400 mt-1">
                  {displayed.notificationsEnabled !== false ? 'Recibirás emails de partidos, ligas y torneos' : 'Las notificaciones están pausadas'}
                </dd>
              </div>
              <button
                onClick={() => void handleToggleNotifications()}
                disabled={notifToggling}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                  displayed.notificationsEnabled !== false ? 'bg-brand-green' : 'bg-gray-600'
                } ${notifToggling ? 'opacity-50' : ''}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    displayed.notificationsEnabled !== false ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </dl>
      </div>

      {stats && displayed.role === 'PLAYER' && (
        <div className="card">
          <h2 className="font-bold text-white text-lg mb-6">Mis estadísticas</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-brand-surface-2 rounded-lg p-4 border border-brand-border">
                <p className="text-xs text-gray-500 font-medium uppercase">Torneos jugados</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.tournamentsPlayed}</p>
              </div>
              <div className="bg-brand-surface-2 rounded-lg p-4 border border-brand-border">
                <p className="text-xs text-brand-green font-medium uppercase">Torneos ganados</p>
                <p className="text-2xl font-bold text-brand-green mt-1">{stats.tournamentsWon}</p>
              </div>
            </div>

            <div className="bg-brand-surface-2/50 border border-brand-border rounded-lg p-4 space-y-3">
              <p className="text-xs text-gray-500 font-medium uppercase mb-3">Partidos</p>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xs text-gray-500">Jugados</p>
                  <p className="text-xl font-bold text-white">{stats.matchesPlayed}</p>
                </div>
                <div>
                  <p className="text-xs text-brand-green">Ganados</p>
                  <p className="text-xl font-bold text-brand-green">{stats.matchesWon}</p>
                </div>
                <div>
                  <p className="text-xs text-red-400">Perdidos</p>
                  <p className="text-xl font-bold text-red-400">{stats.matchesLost}</p>
                </div>
              </div>
            </div>

            <div className="bg-brand-surface-2/50 rounded-lg p-4 border border-brand-border">
              <p className="text-xs text-gray-500 font-medium uppercase mb-3">Sets</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Ganados</span>
                <span className="text-lg font-bold text-brand-green">{stats.setsWon}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-400">Perdidos</span>
                <span className="text-lg font-bold text-gray-300">{stats.setsLost}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useAuth, ApiError } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function ProfilePage() {
  const { user, token, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate('/');
  }

  async function handleSave() {
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await updateUser({ name: name.trim() });
      setEditing(false);
      setSuccess('Nombre actualizado correctamente');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al actualizar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await api.delete('/users/profile', token!);
      logout();
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Error al eliminar la cuenta');
    }
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Mi perfil</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center gap-4">
          <span className="w-14 h-14 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xl font-bold">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <div>
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border rounded px-2 py-1 text-sm w-40"
                  autoFocus
                />
                <button
                  onClick={handleSave}
                  disabled={saving || name.trim().length < 2}
                  className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  onClick={() => { setEditing(false); setName(user.name); setError(''); }}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-800">{user.name}</p>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-green-600 hover:text-green-800"
                  title="Editar nombre"
                >
                  ✏️
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className="inline-block mt-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              {user.role === 'PLAYER' ? 'Jugador' : 'Organizador'}
            </span>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <hr />

        <div className="text-sm text-gray-500">
          Miembro desde: {new Date(user.createdAt).toLocaleDateString('es-ES')}
        </div>

        <hr />

        <div className="flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Cerrar sesión
          </button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-gray-400 hover:text-red-500"
            >
              Eliminar cuenta
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">¿Estás seguro?</span>
              <button
                onClick={handleDelete}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Sí, eliminar
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                No
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ContactPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Simulamos el envío (no hay backend de email)
    setSent(true);
  }

  if (sent) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <div className="bg-white rounded-lg shadow p-8">
          <span className="text-4xl mb-4 block">✅</span>
          <h2 className="text-xl font-bold text-green-700 mb-2">¡Mensaje enviado!</h2>
          <p className="text-gray-500 text-sm mb-4">
            Gracias por contactarnos. Te responderemos lo antes posible.
          </p>
          <button
            onClick={() => { setSent(false); setMessage(''); }}
            className="text-sm text-green-600 hover:underline"
          >
            Enviar otro mensaje
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-12">
      <h1 className="text-2xl font-bold text-green-700 mb-6">Contacto</h1>
      <p className="text-gray-600 mb-6">
        ¿Tienes alguna duda o sugerencia? Escríbenos y te responderemos lo antes posible.
      </p>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={5}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Escribe tu mensaje..."
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-700 text-white px-6 py-2 rounded-md font-medium hover:bg-green-800"
        >
          Enviar mensaje
        </button>
      </form>
    </div>
  );
}

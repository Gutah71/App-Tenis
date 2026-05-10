import { useState, FormEvent } from 'react';
import request from '../services/api';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await request('/contact', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });
      setSuccess(true);
      setName(''); setEmail(''); setMessage('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="section-title">Contáctanos</h1>
        <p className="section-subtitle">¿Tienes alguna pregunta o sugerencia? Escríbenos, estaremos encantados de ayudarte</p>
      </div>

      <div className="card mb-8 space-y-5">
        {success && (
          <div className="bg-brand-green/10 border border-brand-green/30 text-brand-green rounded-lg px-4 py-3 text-sm font-medium">
            ¡Mensaje enviado! Nos pondremos en contacto contigo pronto.
          </div>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Nombre</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Tu nombre"
            />
          </div>
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="label">Mensaje</label>
            <textarea
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="input-field resize-none"
              placeholder="Escribe tu mensaje aquí..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Enviando...' : 'Enviar mensaje'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2 className="font-semibold text-white mb-6">Información de contacto</h2>
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-gray-400">tennistournamenttfg@gmail.com</span>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-400">IES Zayas y Sotomayor</span>
          </li>
          <li className="flex items-start gap-3">
            <svg className="w-5 h-5 text-brand-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-400">Lunes a viernes, 9:00 – 18:00</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

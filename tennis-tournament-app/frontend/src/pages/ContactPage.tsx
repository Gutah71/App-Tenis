export default function ContactPage() {
  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Contáctanos</h1>
      <p className="text-gray-500 mb-8">¿Tienes alguna pregunta o sugerencia? Escríbenos.</p>

      <div className="bg-white rounded-lg shadow p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="tu@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje</label>
          <textarea
            rows={5}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            placeholder="Escribe tu mensaje aquí..."
          />
        </div>
        <button
          type="button"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 font-medium"
        >
          Enviar mensaje
        </button>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Información de contacto</h2>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>📧 tenis@tfg.local</li>
          <li>📍 Universidad — Campus Deportivo</li>
          <li>🕐 Lunes a viernes, 9:00 – 18:00</li>
        </ul>
      </div>
    </div>
  );
}

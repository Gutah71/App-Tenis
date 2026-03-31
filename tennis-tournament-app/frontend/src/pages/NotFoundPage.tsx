import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-24 max-w-md mx-auto">
      <span className="text-6xl">🎾</span>
      <h1 className="text-7xl font-extrabold text-gray-200 mt-4">404</h1>
      <p className="text-gray-500 mt-4 mb-2 text-lg">¡Fuera de pista!</p>
      <p className="text-gray-400 text-sm mb-8">
        La página que buscas no existe o ha sido eliminada.
      </p>
      <Link
        to="/"
        className="inline-block bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-green-800 transition-colors text-sm"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

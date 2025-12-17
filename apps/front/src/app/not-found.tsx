import Link from 'next/link';

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">
          Хуудас олдсонгүй
        </h2>
        <p className="text-gray-500 mb-8">
          Уучлаарай, таны хайсан хуудас олдсонгүй.
        </p>
        <Link
          href="/"
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          Нүүр хуудас руу буцах
        </Link>
      </div>
    </div>
  );
}

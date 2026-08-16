import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="pt-32 pb-20 px-4 text-center bg-coconut-50 min-h-screen flex flex-col items-center justify-center">
      <h2 className="font-serif text-3xl font-bold text-slate-900 mb-2">Page Not Found</h2>
      <p className="text-sm text-slate-600 mb-6">Could not find requested resource.</p>
      <Link
        href="/"
        className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-5 rounded-xl shadow text-sm transition"
      >
        Return Home
      </Link>
    </div>
  );
}

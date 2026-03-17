import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-7xl font-bold text-lime-400 mb-4">404</h1>
      <p className="text-lg text-gray-400 mb-8">Page not found</p>
      <Link
        href="/"
        className="bg-lime-400 text-black hover:bg-lime-500 font-semibold px-6 py-3 rounded-lg transition"
      >
        Back to Home
      </Link>
    </div>
  );
}

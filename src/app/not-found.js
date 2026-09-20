import Link from "next/link";

export default function NotFound() {
  return (
    <main className="my-32 w-full dark:bg-dark flex justify-center font-mr">
      <div className="relative flex flex-col items-center justify-center">
        <h1 className={`inline-block text-dark dark:text-light
      text-6xl font-bold w-full capitalize xl:text-8xl text-center`}>404</h1>
        <h2 className={`inline-block text-dark dark:text-light
      text-5xl font-bold w-full capitalize xl:text-6xl text-center mt-4 tracking-wide leading-snug`}>Page Not Found!</h2>
        <Link
          href="/"
          className="liquid-glass self-center mt-8 inline-block px-6 py-2 font-semibold text-dark dark:text-light"
        >
          Go To Home
        </Link>
      </div>
    </main>
  );
}

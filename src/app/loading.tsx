import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[1000] flex min-h-dvh items-center justify-center bg-white px-6 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="relative flex size-36 items-center justify-center overflow-hidden rounded-full border-4 border-sky-100 bg-white p-1 shadow-[0_18px_50px_-18px_rgba(3,105,161,0.55)] dark:border-sky-900">
          <Image
            src="/images/agiliza-logo-corporate.jpg"
            alt="Agiliza"
            width={144}
            height={144}
            priority
            className="h-full w-full rounded-full object-contain"
          />
        </div>
        <div>
          <p className="text-xl font-bold tracking-tight text-blue-950 dark:text-sky-100">
            Agiliza
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Logística y mensajería empresarial
          </p>
        </div>
        <div
          role="status"
          aria-label="Cargando aplicación"
          className="size-8 animate-spin rounded-full border-4 border-sky-100 border-t-blue-700 dark:border-slate-700 dark:border-t-sky-400"
        />
      </div>
    </div>
  );
}
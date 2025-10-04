import { CryptoForm } from '@/components/crypto-form';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 z-0 h-full w-full bg-transparent bg-[linear-gradient(to_right,hsl(var(--primary)/0.1)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--primary)/0.1)_1px,transparent_1px)] bg-[size:20px_20px] [animation:matrix_3s_linear_infinite]" />
      <div className="z-10 w-full max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary font-headline [animation:title-glow_3s_ease-in-out_infinite]">
            CryptoText
          </h1>
          <p className="text-muted-foreground mt-2 text-base sm:text-lg">
            Securely encrypt and decrypt your text messages.
          </p>
        </header>
        <CryptoForm />
      </div>
    </main>
  );
}

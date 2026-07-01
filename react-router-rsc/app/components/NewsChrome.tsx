import { CompactMenu } from "./InteractiveControls";

const navItems = ["World", "Business", "Culture", "Science"];

export function NewsChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-[var(--rule)] bg-[var(--paper)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between gap-4">
            <a href="/" className="font-serif text-3xl font-black tracking-normal sm:text-5xl">
              Framework Gazette
            </a>
            <div className="hidden items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)] md:flex">
              <span>Global desk</span>
              <span className="h-2 w-2 bg-[var(--accent)]" />
              <span>08:30 UTC</span>
            </div>
            <CompactMenu sections={navItems} />
          </div>
          <nav className="mt-4 hidden border-t border-[var(--rule)] pt-3 text-sm font-bold uppercase tracking-[0.16em] text-[var(--steel)] md:block">
            <ul className="flex gap-8">
              {navItems.map((item) => (
                <li key={item}>
                  <a href="/">{item}</a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      {children}
      <footer className="border-t border-[var(--rule)] bg-[#eee7db]">
        <div className="mx-auto grid max-w-7xl gap-3 px-4 py-8 text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)] sm:px-6 md:grid-cols-3 lg:px-8">
          <p>Framework Gazette</p>
          <p>Independent SSR benchmark edition</p>
          <p className="md:text-right">Images served locally</p>
        </div>
      </footer>
    </>
  );
}

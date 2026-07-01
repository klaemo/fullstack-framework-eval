import { useState } from 'react'

export function CompactMenu({ sections }: { sections: string[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="border border-[var(--ink)] px-3 py-2 text-xs font-bold uppercase tracking-[0.18em]"
        aria-expanded={open}
        aria-controls="compact-nav"
        onClick={() => setOpen((value) => !value)}
      >
        Menu
      </button>
      {open ? (
        <nav
          id="compact-nav"
          className="absolute left-4 right-4 top-24 z-10 border border-[var(--rule)] bg-[var(--paper)] p-4 shadow-lg"
        >
          <ul className="grid gap-3 text-sm font-bold uppercase tracking-[0.16em] text-[var(--steel)]">
            {sections.map((section) => (
              <li key={section}>
                <a href="/">{section}</a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </div>
  )
}

export function SaveStoryButton({ storyId }: { storyId: string }) {
  const [saved, setSaved] = useState(false)

  return (
    <button
      className="border border-[var(--ink)] px-3 py-2 text-xs font-black uppercase tracking-[0.16em]"
      data-story-id={storyId}
      onClick={() => setSaved((value) => !value)}
      type="button"
    >
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}

export function NewsletterForm() {
  const [joined, setJoined] = useState(false)

  return (
    <form
      className="mt-5 grid gap-3"
      onSubmit={(event) => {
        event.preventDefault()
        setJoined(true)
      }}
    >
      <label className="text-sm font-bold" htmlFor="ts-newsletter">
        Morning brief
      </label>
      <div className="flex gap-2">
        <input
          id="ts-newsletter"
          type="email"
          placeholder="email@example.com"
          className="min-w-0 flex-1 border border-[var(--rule)] bg-white px-3 py-2 text-sm"
        />
        <button className="bg-[var(--ink)] px-4 py-2 text-sm font-bold text-white" type="submit">
          Join
        </button>
      </div>
      <p className="text-xs font-bold text-[var(--muted)]">
        {joined ? 'Briefing queued.' : 'One briefing, no noise.'}
      </p>
    </form>
  )
}

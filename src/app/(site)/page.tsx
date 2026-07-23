import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Command,
  LockKeyhole,
  MousePointer2,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import SearchLauncher from '@/components/SearchLauncher';
import { categories, getAllActiveTools, getToolsByCategory } from '@/lib/tools';
import { getHomeMetadata, organizationJsonLd, websiteJsonLd } from '@/lib/seo';

export const metadata = getHomeMetadata();

const popularToolIds = [
  'json-formatter',
  'pdf-merger',
  'image-resizer',
  'word-counter',
  'password-generator',
  'regex-tester',
];

const categoryStyles: Record<string, string> = {
  developer: 'from-indigo-500/20 to-violet-500/5 text-indigo-600 dark:text-indigo-300',
  pdf: 'from-rose-500/20 to-orange-500/5 text-rose-600 dark:text-rose-300',
  image: 'from-fuchsia-500/20 to-pink-500/5 text-fuchsia-600 dark:text-fuchsia-300',
  text: 'from-cyan-500/20 to-sky-500/5 text-cyan-700 dark:text-cyan-300',
  security: 'from-emerald-500/20 to-teal-500/5 text-emerald-700 dark:text-emerald-300',
  calculator: 'from-amber-500/20 to-yellow-500/5 text-amber-700 dark:text-amber-300',
  api: 'from-blue-500/20 to-indigo-500/5 text-blue-600 dark:text-blue-300',
  web: 'from-violet-500/20 to-purple-500/5 text-violet-600 dark:text-violet-300',
};

const homeFaqs = [
  {
    q: 'Are FreeWebTools really free?',
    a: 'Yes. Every active tool is available without an account, subscription, premium tier, or usage quota.',
  },
  {
    q: 'Do my files and text leave my device?',
    a: 'Most tools process files and text locally in your browser. Network tools connect directly to the destination you choose, and each tool page explains its processing boundary.',
  },
  {
    q: 'What can I do with FreeWebTools?',
    a: 'You can format and convert data, merge or split PDFs, resize images, transform text, generate passwords and hashes, test APIs, build web assets, and run everyday calculations.',
  },
  {
    q: 'Do I need to install anything?',
    a: 'No. FreeWebTools works in modern desktop and mobile browsers, so you can open a tool and use it immediately.',
  },
];

export default function Home() {
  const activeTools = getAllActiveTools();
  const popularTools = popularToolIds
    .map((id) => activeTools.find((tool) => tool.id === id))
    .filter(Boolean);
  const websiteLd = websiteJsonLd();
  const orgLd = organizationJsonLd();
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: homeFaqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: { '@type': 'Answer', text: faq.a },
    })),
  };

  return (
    <div className="overflow-hidden bg-background">
      {[websiteLd, orgLd, faqLd].map((node, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}

      <section className="relative border-b border-border/70">
        <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[54rem] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-32 top-32 h-80 w-80 rounded-full bg-cyan-400/10 blur-[90px]" aria-hidden="true" />

        <div className="container relative grid items-center gap-14 py-16 lg:grid-cols-[1.08fr_.92fr] lg:py-24">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              {activeTools.length} tools. Zero sign-ups.
            </div>
            <h1 className="mt-7 font-serif text-5xl font-bold leading-[1.02] tracking-[-0.055em] text-foreground sm:text-6xl lg:text-7xl">
              Free online tools
              <br />
              for work that
              <span className="gradient-text"> can’t wait.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground text-pretty">
              Format JSON, merge PDFs, resize images, clean text, test APIs, and
              finish dozens of everyday tasks—fast, free, and mostly right in your browser.
            </p>

            <div className="mt-9 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <div className="min-w-0 flex-1">
                <SearchLauncher
                  label={`Search ${activeTools.length} tools by task or format`}
                  className="h-13 rounded-2xl border-primary/20 bg-card px-4 shadow-xl shadow-primary/10"
                  showShortcut
                  enableShortcut
                />
              </div>
              <Link href="/tools" className="btn btn-primary h-13 shrink-0 gap-2 rounded-2xl">
                Browse all tools
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {['No account', 'Browser-based', 'Mobile friendly', 'Open source'].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-br from-primary/20 via-violet-400/10 to-cyan-400/20 blur-3xl" aria-hidden="true" />
            <div className="glass relative overflow-hidden rounded-[1.75rem]">
              <div className="flex items-center gap-2 border-b border-border/70 px-5 py-4">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="ml-auto rounded-md bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">
                  freewebtools.app
                </span>
              </div>
              <div className="p-5 sm:p-6">
                <div className="flex items-center gap-3 rounded-xl border bg-background/80 px-4 py-3 shadow-sm">
                  <Search className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">What do you need to do?</span>
                  <kbd className="ml-auto rounded-md border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                    ⌘K
                  </kbd>
                </div>
                <p className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Popular right now
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {popularTools.map((tool) => tool && (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.categoryId}/${tool.slug}`}
                      prefetch={false}
                      className="group flex items-center gap-3 rounded-xl border border-transparent bg-background/65 p-3 transition-all hover:border-primary/20 hover:bg-card hover:shadow-sm"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <CategoryIcon categoryId={tool.categoryId} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">{tool.name}</span>
                        <span className="block text-xs text-muted-foreground">Open tool</span>
                      </span>
                      <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-border/70 bg-muted/35 px-5 py-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <LockKeyhole className="h-3.5 w-3.5 text-emerald-500" />
                  Local processing where possible
                </span>
                <span className="hidden sm:inline">{activeTools.length} ready tools</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-card/55">
        <div className="container grid grid-cols-2 divide-x divide-border/70 sm:grid-cols-4">
          {[
            [`${activeTools.length}`, 'working tools'],
            [`${categories.length}`, 'focused categories'],
            ['0', 'accounts required'],
            ['24/7', 'available online'],
          ].map(([value, label]) => (
            <div key={label} className="px-4 py-6 text-center">
              <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</div>
              <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="tool-directory" className="py-20 sm:py-24">
        <div className="container">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow">Everything in one place</p>
              <h2 className="mt-3 font-serif text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl">
                Find the right tool in seconds.
              </h2>
              <p className="mt-4 text-base leading-7 text-muted-foreground">
                Browse free PDF tools, image tools, text utilities, developer tools,
                calculators, security helpers, and API testing tools by category.
              </p>
            </div>
            <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
              View the complete directory
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => {
              const categoryTools = getToolsByCategory(category.id);
              return (
                <Link
                  key={category.id}
                  href={`/tools/${category.id}`}
                  className="soft-card group relative flex min-h-64 flex-col overflow-hidden p-5"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br opacity-80 ${categoryStyles[category.id] || 'from-primary/15 to-transparent text-primary'}`} aria-hidden="true" />
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-card/80 shadow-sm ${categoryStyles[category.id] || 'text-primary'}`}>
                        <CategoryIcon categoryId={category.id} className="h-5 w-5" />
                      </span>
                      <span className="rounded-full border border-border/80 bg-card/65 px-2.5 py-1 text-xs font-semibold text-muted-foreground backdrop-blur">
                        {categoryTools.length} tools
                      </span>
                    </div>
                    <h3 className="mt-8 text-xl font-bold tracking-tight text-foreground">{category.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{category.description}</p>
                  </div>
                  <span className="relative mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-foreground">
                    Explore category
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/50 py-20 sm:py-24">
        <div className="container grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">Privacy without friction</p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl">
              Your work stays yours.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              Most FreeWebTools utilities process your files and pasted content on your
              device. There is no account to create and no project history stored on our servers.
            </p>
            <Link href="/about" className="btn btn-secondary mt-7 gap-2">
              How FreeWebTools works
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: LockKeyhole,
                title: 'Local-first',
                copy: 'PDFs, images, text, tokens, and other inputs stay in your browser for local tools.',
              },
              {
                icon: Zap,
                title: 'Instant results',
                copy: 'Skip uploads, queues, and email links. Get the output as soon as your browser computes it.',
              },
              {
                icon: MousePointer2,
                title: 'One focused job',
                copy: 'Every page is built around a clear task with the controls, steps, limits, and answers together.',
              },
              {
                icon: Command,
                title: 'Fast discovery',
                copy: 'Press Command-K from anywhere to find a tool by name, format, task, or category.',
              },
            ].map(({ icon: Icon, title, copy }) => (
              <article key={title} className="rounded-2xl border bg-background p-5 shadow-sm">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <p className="eyebrow">Simple by design</p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl">
              Search. Use. Done.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              No onboarding, dashboard, or saved workspace between you and the result.
            </p>
          </div>
          <ol className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-3">
            {[
              ['01', 'Find your tool', 'Search by task or browse a category such as PDF, image, text, developer, or calculator.'],
              ['02', 'Add your input', 'Paste text, select a file, or enter values. Each page explains exactly what it accepts.'],
              ['03', 'Take the result', 'Copy or download the output, then move on—without creating an account or saving a project.'],
            ].map(([number, title, copy]) => (
              <li key={number} className="relative rounded-2xl border bg-card p-6 shadow-sm">
                <span className="font-mono text-xs font-semibold text-primary">{number}</span>
                <h3 className="mt-7 text-xl font-bold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-y border-border/70 bg-card/55 py-20 sm:py-24">
        <div className="container grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="eyebrow">Questions, answered</p>
            <h2 className="mt-3 font-serif text-3xl font-bold tracking-[-0.035em] text-foreground sm:text-4xl">
              Free online tools FAQ
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Straight answers about pricing, privacy, installation, and what the toolkit can do.
            </p>
          </div>
          <div className="divide-y divide-border/70 overflow-hidden rounded-2xl border bg-background shadow-sm">
            {homeFaqs.map((faq, index) => (
              <details key={faq.q} className="group p-5 sm:p-6" open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold text-foreground">
                  {faq.q}
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-normal text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-14 text-center text-white shadow-2xl shadow-primary/15 sm:px-12 sm:py-18 dark:bg-white dark:text-slate-950">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,.6),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,.35),transparent_35%)]" aria-hidden="true" />
            <div className="relative mx-auto max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-300 dark:text-indigo-600">
                Ready when you are
              </p>
              <h2 className="mt-4 font-serif text-3xl font-bold tracking-[-0.04em] sm:text-5xl">
                Your next task is one search away.
              </h2>
              <p className="mt-4 text-base leading-7 text-slate-300 dark:text-slate-600">
                Open any of {activeTools.length} free browser tools and get useful work done now.
              </p>
              <div className="mx-auto mt-8 flex max-w-lg flex-col justify-center gap-3 sm:flex-row">
                <Link href="/tools" className="btn bg-white text-slate-950 shadow-xl hover:-translate-y-0.5 hover:bg-slate-100 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800">
                  Explore all tools
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/blog" className="btn border border-white/20 bg-white/10 text-white hover:bg-white/15 dark:border-slate-900/20 dark:bg-slate-900/5 dark:text-slate-950">
                  Read practical guides
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

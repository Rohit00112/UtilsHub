import Link from 'next/link';
import { createMetadata } from '@/lib/seo';

export const metadata = createMetadata({
    title: 'Privacy Policy',
    description: 'How FreeWebTools handles tool input, cookies, and third-party services like Google AdSense.',
    path: '/privacy',
});

const LAST_UPDATED = '2026-07-23';

export default function PrivacyPage() {
    return (
        <div className="min-h-[calc(100dvh-3.5rem)] bg-muted/20">
            <div className="container max-w-3xl py-16">
                <h1 className="text-4xl font-semibold text-foreground text-balance">Privacy Policy</h1>
                <p className="mt-2 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

                <div className="mt-10 space-y-8 text-base leading-7 text-foreground/90">
                    <section>
                        <h2 className="text-2xl font-semibold text-foreground">Summary</h2>
                        <p className="mt-3 text-muted-foreground">
                            FreeWebTools runs its tools in your browser. Files and pasted text you give to a
                            tool are processed locally and are not uploaded to a FreeWebTools server. The site
                            does use Google AdSense for ads and basic third-party analytics, which set
                            cookies and may collect data described below.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground">What we don&apos;t collect</h2>
                        <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
                            <li>The files you upload to a tool. They stay in your browser.</li>
                            <li>The text you paste into a tool. It is processed locally.</li>
                            <li>Outputs you generate (passwords, hashes, formatted JSON, etc.). They are not transmitted to us.</li>
                            <li>Sign-up information — there are no accounts on FreeWebTools.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground">Cookies and ads (Google AdSense)</h2>
                        <p className="mt-3 text-muted-foreground">
                            FreeWebTools displays ads served by Google AdSense. When you visit the site:
                        </p>
                        <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
                            <li>Google may set cookies in your browser to deliver and personalize ads.</li>
                            <li>Google may use your IP address, approximate location, and browsing context to choose ads.</li>
                            <li>Google may use your activity across other sites in the AdSense network for ad personalization (you can manage this at{' '}
                                <Link href="https://adssettings.google.com" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
                                    adssettings.google.com
                                </Link>
                                ).
                            </li>
                        </ul>
                        <p className="mt-3 text-muted-foreground">
                            More detail in Google&apos;s{' '}
                            <Link href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
                                Advertising Policies
                            </Link>{' '}
                            and{' '}
                            <Link href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
                                Privacy Policy
                            </Link>.
                        </p>
                        <p className="mt-3 text-muted-foreground">
                            We ask for your consent before loading AdSense or third-party analytics. If
                            you decline, those scripts are not loaded through FreeWebTools. You can reset
                            your choice by clearing site data for this domain in your browser.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground">Analytics</h2>
                        <p className="mt-3 text-muted-foreground">
                            After consent, FreeWebTools uses Google Analytics and Microsoft Clarity to
                            understand aggregate page usage and identify usability problems. These
                            services may process device, browser, approximate-location, interaction, and
                            referral information under their own privacy policies. They are not loaded
                            when you decline consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground">Local storage</h2>
                        <p className="mt-3 text-muted-foreground">
                            FreeWebTools itself uses your browser&apos;s localStorage to remember small
                            preferences — for example, your theme (light/dark) and your cookie consent
                            choice. This data lives only in your browser and is not transmitted to us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground">Hosting</h2>
                        <p className="mt-3 text-muted-foreground">
                            The public site is delivered through{' '}
                            <Link href="https://www.cloudflare.com" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
                                Cloudflare
                            </Link>
                            . Cloudflare may process standard request information such as IP address,
                            request path, timestamp, and user agent for delivery, security, and
                            reliability. See Cloudflare&apos;s{' '}
                            <Link href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
                                privacy policy
                            </Link>{' '}
                            for details.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground">Your rights</h2>
                        <p className="mt-3 text-muted-foreground">
                            Depending on where you live, you may have the right to access, correct, or
                            delete personal data held about you, or to object to certain processing. Since
                            FreeWebTools itself does not collect personal data, requests should usually be
                            directed to the relevant third-party provider for advertising, analytics, or
                            delivery data.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground">Changes</h2>
                        <p className="mt-3 text-muted-foreground">
                            If this policy changes materially, the &quot;Last updated&quot; date above will
                            change. For substantive changes you may be asked to renew your cookie consent.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-foreground">Contact</h2>
                        <p className="mt-3 text-muted-foreground">
                            Questions about this policy? Open an issue on the project&apos;s{' '}
                            <Link href="https://github.com/Rohit00112/UtilsHub/issues" target="_blank" rel="noreferrer" className="font-medium underline underline-offset-2">
                                GitHub repository
                            </Link>
                            .
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

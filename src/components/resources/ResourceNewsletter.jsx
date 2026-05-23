import { useState } from 'react';

export function ResourceNewsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(/** @type {'idle' | 'done'} */ ('idle'));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('done');
  };

  return (
    <section className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-16 md:py-20" aria-labelledby="newsletter-heading">
      <div className="max-w-3xl mx-auto text-center resources-card rounded-3xl p-8 md:p-12">
        <h2 id="newsletter-heading" className="gazzetta-bold text-2xl md:text-3xl text-[#2A2F7F]">
          Free drops &amp; exclusive releases
        </h2>
        <p className="text-sm text-[#2A2F7F]/70 mt-3 max-w-md mx-auto">
          Occasional updates — new resources, early access, and studio notes. No spam.
        </p>
        {status === 'done' ? (
          <p className="mt-8 text-sm josefin uppercase tracking-widest text-[#F45D01]" role="status">
            Thank you — you&apos;re on the list.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mt-8 max-w-md mx-auto">
            <label htmlFor="resource-newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="resource-newsletter-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@studio.com"
              className="resources-input flex-1 py-3 px-4 rounded-full text-sm"
            />
            <button
              type="submit"
              className="resources-btn-primary py-3 px-8 text-xs uppercase tracking-[0.2em] josefin rounded-full shrink-0"
            >
              Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

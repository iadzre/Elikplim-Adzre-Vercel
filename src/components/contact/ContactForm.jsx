import { useState } from 'react';
import { useContactForm } from '../../hooks/useContactForm';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [botField, setBotField] = useState('');

  const { fieldErrors, formMessage, isSuccess, isSubmitting, submit } = useContactForm();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await submit({ name, email, topic, message, botField });
    if (result.ok) {
      setName('');
      setEmail('');
      setTopic('');
      setMessage('');
      setBotField('');
    }
  };

  return (
    <form
      name="suggestion"
      method="POST"
      onSubmit={handleSubmit}
      className="space-y-3 md:space-y-4"
      noValidate
    >
      <p className="hidden" aria-hidden="true">
        <label>
          Don&apos;t fill this out if you&apos;re human:{' '}
          <input
            name="bot-field"
            value={botField}
            onChange={(e) => setBotField(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </p>

      <div
        id="form-message"
        role="status"
        aria-live="polite"
        className={`text-center text-sm josefin tracking-2x uppercase${formMessage ? '' : ' hidden'}${formMessage ? (isSuccess ? ' text-[#F45D01]' : ' text-[#e83685]') : ''}`}
      >
        {formMessage}
      </div>

      <div>
        <label htmlFor="name" className="block text-black text-[10px] md:text-xs tracking-2x uppercase josefin mb-1.5">
          YOUR NAME
        </label>
        <input
          type="text"
          id="name"
          name="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-describedby="name-error"
          className={`w-full px-3 py-2 md:py-2 bg-transparent border border-gray-300 focus:outline-none focus:border-[#F45D01] transition-colors duration-300 text-black placeholder-gray-400 text-sm${fieldErrors.name ? ' error' : ''}`}
          placeholder="Enter your name"
        />
        <span
          id="name-error"
          className={`text-[9px] text-[#e83685] josefin mt-1 block${fieldErrors.name ? '' : ' hidden'}`}
        >
          {fieldErrors.name || ''}
        </span>
      </div>

      <div>
        <label htmlFor="email" className="block text-black text-[10px] md:text-xs tracking-2x uppercase josefin mb-1.5">
          YOUR EMAIL
        </label>
        <input
          type="email"
          id="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-describedby="email-error"
          className={`w-full px-3 py-2 md:py-2 bg-transparent border border-gray-300 focus:outline-none focus:border-[#F45D01] transition-colors duration-300 text-black placeholder-gray-400 text-sm${fieldErrors.email ? ' error' : ''}`}
          placeholder="Enter your email"
        />
        <span
          id="email-error"
          className={`text-[9px] text-[#e83685] josefin mt-1 block${fieldErrors.email ? '' : ' hidden'}`}
        >
          {fieldErrors.email || ''}
        </span>
      </div>

      <div>
        <label htmlFor="topic" className="block text-black text-[10px] md:text-xs tracking-2x uppercase josefin mb-1.5">
          TITLE / ROLE
        </label>
        <input
          type="text"
          id="topic"
          name="topic"
          required
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          aria-describedby="topic-error"
          className={`w-full px-3 py-2 md:py-2 bg-transparent border border-gray-300 focus:outline-none focus:border-[#F45D01] transition-colors duration-300 text-black placeholder-gray-400 text-sm${fieldErrors.topic ? ' error' : ''}`}
          placeholder="e.g. Wedding client, Brand manager"
        />
        <span
          id="topic-error"
          className={`text-[9px] text-[#e83685] josefin mt-1 block${fieldErrors.topic ? '' : ' hidden'}`}
        >
          {fieldErrors.topic || ''}
        </span>
      </div>

      <div>
        <label htmlFor="message" className="block text-black text-[10px] md:text-xs tracking-2x uppercase josefin mb-1.5">
          YOUR TESTIMONIAL
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-describedby="message-error"
          className={`w-full px-3 py-2 md:py-2 bg-transparent border border-gray-300 focus:outline-none focus:border-[#F45D01] transition-colors duration-300 text-black placeholder-gray-400 resize-none text-sm${fieldErrors.message ? ' error' : ''}`}
          placeholder="Share your experience — leave a blank line between paragraphs."
        />
        <span
          id="message-error"
          className={`text-[9px] text-[#e83685] josefin mt-1 block${fieldErrors.message ? '' : ' hidden'}`}
        >
          {fieldErrors.message || ''}
        </span>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
        className="w-full px-4 py-2.5 md:py-2 bg-[#F45D01] text-white hover:bg-opacity-90 transition-all duration-300 text-[10px] md:text-xs tracking-2x uppercase josefin font-medium disabled:opacity-70"
      >
        {isSubmitting ? 'SENDING...' : 'SUBMIT TESTIMONIAL'}
      </button>
    </form>
  );
}

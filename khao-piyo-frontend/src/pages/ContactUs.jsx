import React, { useState } from 'react';
import { Mail, MapPin, Phone, Check } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';

const info = [
  { icon: Phone, label: 'Call us', value: '+91 98765 43210' },
  { icon: Mail, label: 'Email', value: 'support@khaopiyo.com' },
  { icon: MapPin, label: 'Office', value: 'Bhiwandi, Maharashtra' },
];

const ContactUs = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: POST the form to your backend
    setSent(true);
    setForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="container-x py-12">
      <h1 className="font-display text-3xl font-extrabold sm:text-5xl">Questions about an order?</h1>
      <p className="mt-3 max-w-xl text-muted">Send us a message and we will reply within one working day.</p>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
        <Reveal from="left">
          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">Name
                <input required name="name" value={form.name} onChange={onChange} className="input mt-1.5" />
              </label>
              <label className="text-sm font-medium">Email
                <input required type="email" name="email" value={form.email} onChange={onChange} className="input mt-1.5" />
              </label>
            </div>
            <label className="block text-sm font-medium">Message
              <textarea required rows={5} name="message" value={form.message} onChange={onChange} className="input mt-1.5 resize-none" />
            </label>
            <button type="submit" className="btn btn-primary px-8! py-3!">Send message</button>
            {sent && (
              <p className="flex items-center gap-2 text-sm text-emerald-600" role="status">
                <Check className="h-4 w-4" /> Message sent. We will be in touch soon.
              </p>
            )}
          </form>
        </Reveal>

        <Reveal from="right" className="space-y-4">
          {info.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand/10 text-brand"><Icon className="h-5 w-5" /></span>
              <div>
                <p className="text-sm text-muted">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </div>
  );
};

export default ContactUs;

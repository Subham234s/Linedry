'use client';
import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Phone, Mail, MapPin, MessageCircle, Send } from 'lucide-react';

interface ContactFormData {
  fullName: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
}

const contactDetails = [
  {
    icon: Phone,
    label: 'Phone Number',
    value: '+91 98765 43210',
    href: 'tel:+919876543210',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Mail,
    label: 'Email Address',
    value: 'hello@linedry.in',
    href: 'mailto:hello@linedry.in',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: MapPin,
    label: 'Business Address',
    value: 'Linedry Central Hub, Sector V, Salt Lake, Kolkata, West Bengal – 700091',
    href: '#',
    color: 'bg-red-50 text-red-500',
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    phone: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <Header />

      {/* Page Header */}
      <section
        className="relative pt-28 pb-16 px-6 overflow-hidden"
        style={{
          backgroundImage: "url('/assets/images/ChatGPT_Image_May_6__2026__02_47_43_PM-1778058990288.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[#0F1F3D]/70" />
        <div className="relative max-w-screen-xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-300 text-lg max-w-xl mx-auto">
            We&apos;re here to help with your laundry needs. Reach out and we&apos;ll get back to you promptly.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-screen-xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">

          {/* Left Column: Contact Information */}
          <div className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-[#0F1F3D] mb-2">Contact Information</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                Choose the most convenient way to reach us. Our support team is available Monday–Saturday, 9 AM – 7 PM IST.
              </p>
            </div>

            {/* Contact Cards */}
            <div className="flex flex-col gap-4">
              {contactDetails.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={`${item.label}: ${item.value}`}
                  className="flex items-start gap-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 group"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-[#0F1F3D] group-hover:text-blue-600 transition-colors duration-200 leading-relaxed">
                      {item.value}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* WhatsApp Button */}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Linedry on WhatsApp"
              className="flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold py-3.5 px-6 rounded-xl transition-colors duration-200 shadow-sm active:scale-95"
            >
              <MessageCircle size={20} />
              <span>Chat on WhatsApp</span>
            </a>

            {/* Google Maps Embed */}
            <div className="rounded-xl overflow-hidden shadow-md border border-gray-100">
              <iframe
                title="Linedry Central Hub location on Google Maps"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.7!2d88.4316!3d22.5726!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0275b000000001%3A0x1!2sSector+V%2C+Salt+Lake%2C+Kolkata%2C+West+Bengal!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="260"
                style={{ border: 0, display: 'block' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                aria-label="Map showing Linedry Central Hub in Sector V, Kolkata"
              />
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-[#0F1F3D] mb-2">Send Us a Message</h2>
              <p className="text-gray-500 text-sm mb-7">Fill out the form below and we&apos;ll respond within 24 hours.</p>

              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                    <Send size={28} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F1F3D]">Message Sent!</h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Thank you for reaching out. Our team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ fullName: '', phone: '', email: '', subject: '', message: '' }); }}
                    className="mt-2 text-sm font-semibold text-blue-600 hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Aarav Sharma"
                      aria-label="Full name"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      aria-label="Phone number"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      aria-label="Email address"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Pickup scheduling query"
                      aria-label="Subject of your message"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us how we can help you..."
                      aria-label="Your message"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    aria-label="Send your message to Linedry"
                    className="w-full flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3.5 rounded-lg text-sm transition-colors duration-200 active:scale-95 mt-1"
                  >
                    <Send size={16} />
                    Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

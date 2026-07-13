import React, { useState } from "react";
import { Footer, Header } from "../Components";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/20/solid";

export const ContactUs = () => {
  document.title = "Contact Us - DocAppoint";
  const { t } = useTranslation();

  // Contact Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // FAQ interactive state
  const [openFaq, setOpenFaq] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert("Please fill out all required fields.");
      return;
    }
    setIsSubmitting(true);
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1500);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I book an appointment with a doctor?",
      answer: "You can easily book an appointment by using our search bar on the home page to find a practitioner by specialty or city, viewing their profile, choosing an available time slot, and filling out the patient form."
    },
    {
      question: "Can I reschedule or cancel my appointment?",
      answer: "Yes, you can manage your appointments directly from your Patient Dashboard under the 'Appointments' tab. Rescheduling allows you to pick new dates/slots, and cancellation is simple and instant."
    },
    {
      question: "Are doctor reviews moderated?",
      answer: "Absolutely. All patient-submitted reviews undergo moderation to filter out inappropriate content and ensure factual accuracy, keeping our platform transparent and highly reliable."
    },
    {
      question: "Is my medical data secure?",
      answer: "Your privacy is our top priority. All personal information and consultation details are protected, stored securely, and processed in compliance with healthcare data protection standards."
    }
  ];

  return (
    <>
      <Header />

      {/* Hero Banner */}
      <div className="relative min-h-[280px] bg-gradient-to-r from-blue-700 to-indigo-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-30" style={{ backgroundImage: "url('https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}></div>
        <div className="relative text-center text-white px-4 pt-8">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide uppercase">Get in Touch</h1>
          <p className="mt-3 text-blue-100 font-light max-w-lg mx-auto text-sm md:text-base">We are here to support your healthcare journey. Contact us for any questions, support, or feedback.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Main Grid: Info + Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Panel: Contact Info */}
          <div className="lg:col-span-5 space-y-8 text-left">
            <div className="space-y-4">
              <h2 className="text-3xl font-extrabold text-gray-900">{t("contact.contactUsTitle") || "Contact Information"}</h2>
              <p className="text-gray-500 leading-relaxed text-sm">Have a question or feedback? Reach out to us through any of these channels or submit the form. Our support team responds within 24 hours.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Phone card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <PhoneIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Phone Support</h4>
                  <p className="text-xs text-gray-500 mt-1">General Office: <strong className="text-gray-700">{t("contact.officePhoneNumber") || "+1 234-567-89"}</strong></p>
                  <p className="text-xs text-gray-500 mt-0.5">Emergency Helpline: <strong className="text-gray-700">{t("contact.phoneNumber") || "+1 234-567-89"}</strong></p>
                </div>
              </div>

              {/* Email card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <EnvelopeIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Email Address</h4>
                  <p className="text-xs text-gray-500 mt-1">Support & Vitals: <strong className="text-gray-700">{t("contact.emailAddress") || "support@docappoint.com"}</strong></p>
                  <p className="text-xs text-gray-500 mt-0.5">Partnership Inquiry: <strong className="text-gray-700">partners@docappoint.com</strong></p>
                </div>
              </div>

              {/* Address card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <MapPinIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Headquarters</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t("contact.address") || "123 Medical Center Way, Casablanca, Morocco"}</p>
                </div>
              </div>

              {/* Working Hours card */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                  <ClockIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm">Operating Hours</h4>
                  <p className="text-xs text-gray-500 mt-1">Monday - Friday: <strong className="text-gray-700">08:00 AM - 06:00 PM</strong></p>
                  <p className="text-xs text-gray-500 mt-0.5">Saturday: <strong className="text-gray-700">09:00 AM - 02:00 PM</strong></p>
                  <p className="text-xs text-red-500 font-semibold mt-1">Sunday: Closed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Contact Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6 text-left">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-blue-600" />
                Send us a Message
              </h3>
              
              {submitSuccess && (
                <div className="bg-green-50 text-green-700 text-xs p-4 rounded-xl border border-green-100 font-semibold flex items-center gap-1.5 transition">
                  <CheckCircleIcon className="w-5 h-5 shrink-0" />
                  Thank you! Your message has been sent successfully. We will get back to you shortly.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("contact.nameLabel") || "Name"}</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder={t("contact.namePlaceholder") || "Enter your full name"}
                      className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:border-blue-500 transition"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("contact.emailLabel") || "Email"}</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder={t("contact.emailPlaceholder") || "Enter your email"}
                      className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="Message subject (optional)"
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t("contact.messageLabel") || "Your Message"}</label>
                  <textarea
                    name="message"
                    required
                    rows="4"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder={t("contact.messagePlaceholder") || "Write your message details here..."}
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 outline-none focus:border-blue-500 transition"
                  />
                </div>

                <div className="pt-2 text-right">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition text-sm shadow-md disabled:bg-blue-400"
                  >
                    {isSubmitting ? "Sending..." : t("contact.sendButton") || "Send Message"}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* Google Maps Mockup */}
        <div className="mt-16 space-y-4 text-left">
          <h3 className="text-xl font-bold text-gray-900 px-1">Our Location</h3>
          <div className="relative rounded-3xl overflow-hidden h-[380px] bg-sky-50 border border-gray-100 flex items-center justify-center shadow-sm">
            {/* Visual background simulation */}
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.pexels.com/photos/1051075/pexels-photo-1051075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')", filter: "hue-rotate(200deg) saturate(70%) contrast(90%)" }}></div>
            
            {/* Dark overlay grid overlay */}
            <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay"></div>
            
            {/* Location Pin */}
            <div className="relative z-10 flex flex-col items-center animate-bounce">
              <div className="bg-red-500 text-white p-3 rounded-full shadow-lg border-2 border-white">
                <MapPinIcon className="w-8 h-8" />
              </div>
              <div className="w-2 h-2 bg-red-600 rounded-full blur-[1px] mt-0.5"></div>
            </div>

            {/* Location Card Overlay */}
            <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-xl max-w-sm border border-gray-100 flex flex-col text-left">
              <h4 className="font-extrabold text-gray-900 text-sm">DocAppoint HQ</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t("contact.address") || "123 Medical Center Way, Casablanca, Morocco"}</p>
              <a 
                href="https://maps.google.com" 
                target="_blank" 
                rel="noreferrer" 
                className="mt-3 text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Open in Google Maps &rarr;
              </a>
            </div>
          </div>
        </div>

        {/* Collapsible FAQ Section */}
        <div className="mt-20 space-y-6 text-left max-w-4xl mx-auto">
          <div className="text-center space-y-2 mb-8">
            <h3 className="text-2xl font-extrabold text-gray-900">Frequently Asked Questions</h3>
            <p className="text-sm text-gray-400">Quick answers to common questions about DocAppoint consultations.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-gray-800 hover:bg-gray-50/50 transition text-sm md:text-base outline-none"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs md:text-sm text-gray-600 leading-relaxed border-t border-gray-50/50 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="text-center pt-4">
            <p className="text-xs text-gray-400">
              Need more details? Review our full platform guidelines on the{" "}
              <Link to="/faq" className="text-blue-600 font-semibold hover:underline">FAQ Directory</Link> page.
            </p>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
};

export default ContactUs;

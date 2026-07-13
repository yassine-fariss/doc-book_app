import React, { useState } from "react";
import { Footer, Header } from "../Components";
import { Link } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BookOpenIcon,
  CreditCardIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
} from "@heroicons/react/20/solid";

const FAQ = () => {
  document.title = "FAQ - DocAppoint";

  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState(null);

  const categories = [
    { id: "all", label: "All Questions", icon: QuestionMarkCircleIcon },
    { id: "booking", label: "Booking Consultations", icon: BookOpenIcon },
    { id: "payments", label: "Payments & Fees", icon: CreditCardIcon },
    { id: "cancellation", label: "Cancellation Policy", icon: NoSymbolIcon },
    { id: "verification", label: "Doctor Verification", icon: ShieldCheckIcon },
    { id: "privacy", label: "Privacy & Security", icon: LockClosedIcon },
    { id: "support", label: "Customer Support", icon: EnvelopeIcon },
  ];

  const faqData = [
    // Booking Questions
    {
      id: 1,
      category: "booking",
      question: "How do I book a consultation with a doctor?",
      answer: "You can search for a doctor using the 'Find a Doctor' search bar on the home page. Once you find a suitable practitioner, click 'View Profile', select an available date and time slot from their working hours, fill in the patient information, and submit. You will receive an instant confirmation on your dashboard.",
    },
    {
      id: 2,
      category: "booking",
      question: "Can I book appointments for family members?",
      answer: "Yes, you can. During the booking process (Step 4: Patient Information), you have the option to enter the patient details (Name, CIN, Phone Number) of the family member who will be attending the consultation.",
    },
    // Payments
    {
      id: 3,
      category: "payments",
      question: "What payment methods are supported?",
      answer: "We support multiple payment methods for your convenience: Cash payments at the cabinet/clinic, online credit/debit card payments, and direct bank transfers. Consultation fees are clearly indicated on each doctor's card and profile page.",
    },
    {
      id: 4,
      category: "payments",
      question: "How can I obtain a receipt or invoice for my consultation?",
      answer: "All completed consultations generate a printable PDF medical booking slip/receipt. You can access this by navigating to your Patient Profile, clicking the 'Appointments' tab, scrolling to 'Past Bookings', and clicking the 'Imprimer' button.",
    },
    // Cancellation Policy
    {
      id: 5,
      category: "cancellation",
      question: "What is the appointment cancellation policy?",
      answer: "You can cancel or reschedule any appointment up to 2 hours before the scheduled time slot without any penalty. To do so, visit your Patient Dashboard, click on 'Appointments', and select 'Cancel' or 'Reschedule'.",
    },
    {
      id: 6,
      category: "cancellation",
      question: "What happens if a doctor rejects my booking request?",
      answer: "While rare, if a doctor needs to reject or cancel an appointment due to an emergency, you will receive an instant message on your dashboard. Your booking fee will be fully refunded to your original payment method, and you can immediately choose another slot or practitioner.",
    },
    // Doctor Verification
    {
      id: 7,
      category: "verification",
      question: "How are doctor credentials verified?",
      answer: "Every doctor registering on DocAppoint must submit their national medical registration details (Matricule), national identity card, and specialty credentials. Our administrative team manually verifies these documents with official medical councils before approving the doctor's profile.",
    },
    {
      id: 8,
      category: "verification",
      question: "What does the green verified check badge mean?",
      answer: "The green 'Verified' badge on a doctor's profile and card indicates that our administrative team has fully validated their professional credentials, office location, and medical council registry details.",
    },
    // Privacy
    {
      id: 9,
      category: "privacy",
      question: "Is my medical data and consultation history secure?",
      answer: "Yes, your privacy is our top priority. All personal information, clinical notes, and booking records are encrypted and stored in compliance with medical data privacy regulations. We never share your data with unauthorized third parties.",
    },
    {
      id: 10,
      category: "privacy",
      question: "Who can see my clinical files and medical records?",
      answer: "Only you (from your patient dashboard) and the specific doctor with whom you have booked a consultation have access to view your clinical profile notes, CIN, and appointment details.",
    },
    // Support
    {
      id: 11,
      category: "support",
      question: "How do I get in touch with customer support?",
      answer: "You can reach out to us by visiting our Contact page and submitting a contact form, or by emailing our support desk directly at support@docappoint.com. We respond to all queries within 24 hours.",
    },
    {
      id: 12,
      category: "support",
      question: "What are customer support operating hours?",
      answer: "Our general support desk is online from Monday to Friday: 08:00 AM - 06:00 PM, and Saturday: 09:00 AM - 02:00 PM. Technical support is closed on Sundays and national holidays.",
    },
  ];

  // Filtering FAQs based on search query and category
  const filteredFaqs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFaq = (id) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <>
      <Header />

      {/* Hero Section with Search bar */}
      <div className="relative min-h-[300px] bg-gradient-to-r from-blue-700 to-indigo-800 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25" style={{ backgroundImage: "url('https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')" }}></div>
        
        <div className="relative text-center text-white px-4 max-w-2xl mx-auto space-y-6 pt-10">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-wide">FAQ DIRECTORY</h1>
            <p className="text-blue-100 font-light text-sm md:text-base">Find quick, detailed answers about scheduling appointments, doctor verifications, payments, and support.</p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xl mx-auto">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search questions or keywords (e.g. refund, payment)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-gray-800 text-sm rounded-full pl-12 pr-6 py-3.5 outline-none shadow-xl focus:ring-2 focus:ring-blue-400 transition"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Category Sidebar Tabs */}
          <div className="lg:col-span-4 space-y-4 text-left">
            <h3 className="font-extrabold text-gray-900 text-lg px-2 border-b border-gray-50 pb-2">Help Categories</h3>
            <div className="flex flex-col gap-1">
              {categories.map((cat) => {
                const IconComp = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setOpenFaq(null);
                    }}
                    className={`flex items-center gap-3 w-full py-3 px-4 text-sm font-bold rounded-2xl transition ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-100/50"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    <IconComp className="w-5 h-5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Direct Support Card CTA */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-3xl text-white shadow-md space-y-4 mt-6">
              <h4 className="font-extrabold text-base">Still need help?</h4>
              <p className="text-xs text-blue-100 leading-relaxed">If you couldn't find the answers you're looking for, feel free to send a detailed inquiry to our patient support desk.</p>
              <Link to="/Contact" className="block text-center w-full bg-white text-blue-700 font-bold py-2.5 rounded-xl hover:bg-blue-50 transition text-xs shadow-sm">
                Contact Support
              </Link>
            </div>
          </div>

          {/* Right Accordion List */}
          <div className="lg:col-span-8 space-y-4 text-left">
            <h3 className="font-extrabold text-gray-900 text-lg border-b border-gray-50 pb-2 flex items-center justify-between">
              <span>Frequently Asked Questions</span>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">{filteredFaqs.length} Items</span>
            </h3>

            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition"
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
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

              {filteredFaqs.length === 0 && (
                <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center text-gray-500 space-y-2">
                  <p className="text-sm font-bold">No FAQ items matched your query.</p>
                  <p className="text-xs text-gray-400">Try using broader search terms or reset categories.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </>
  );
};

export default FAQ;

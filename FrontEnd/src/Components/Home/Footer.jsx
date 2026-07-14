import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
} from "lucide-react";

const Footer = ({ colorText }) => {
  const { t } = useTranslation();
  const textColor = colorText || "white";
  const currentYear = new Date().getFullYear();

  // Animation variants for columns
  const columnVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5 },
    }),
  };

  const iconHover = {
    scale: 1.12,
    transition: { type: "spring", stiffness: 300 },
  };

  return (
    <motion.footer
      className="bg-white border-t border-gray-300 shadow-lg rounded-t-lg py-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      data-testid="footer"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Section */}
          <motion.div
            variants={columnVariants}
            custom={0}
            initial="hidden"
            animate="visible"
          >
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <img src="/img/logo.png" alt="HealthConnect" className="h-10 w-auto" />
              <span className="text-xl font-semibold text-gray-800">HealthConnect</span>
            </Link>
            <p className="text-sm text-gray-600 max-w-xs">
              HealthConnect helps patients find trusted doctors, book appointments instantly, and manage their healthcare with ease.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            variants={columnVariants}
            custom={1}
            initial="hidden"
            animate="visible"
          >
            <h4 className="text-lg font-medium text-gray-800 mb-4">{t("footer.quickLinks")}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-600 hover:text-indigo-600 transition-colors underline underline-offset-2"
                >
                  {t("footer.home")}
                </Link>
              </li>
              <li>
                <Link
                  to="/searchdoctors"
                  className="text-gray-600 hover:text-indigo-600 transition-colors underline underline-offset-2"
                >
                  {t("footer.findDoctors")}
                </Link>
              </li>
              <li>
                <Link
                  to="/aboutus"
                  className="text-gray-600 hover:text-indigo-600 transition-colors underline underline-offset-2"
                >
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-600 hover:text-indigo-600 transition-colors underline underline-offset-2"
                >
                  {t("footer.contact")}
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-600 hover:text-indigo-600 transition-colors underline underline-offset-2"
                >
                  {t("footer.faq")}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Services */}
          <motion.div
            variants={columnVariants}
            custom={2}
            initial="hidden"
            animate="visible"
          >
            <h4 className="text-lg font-medium text-gray-800 mb-4">{t("footer.servicesTitle")}</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/searchdoctors"
                  className="text-gray-600 hover:text-indigo-600 transition-colors underline underline-offset-2"
                >
                  {t("footer.findDoctor")}
                </Link>
              </li>
              <li>
                <Link
                  to="/booking"
                  className="text-gray-600 hover:text-indigo-600 transition-colors underline underline-offset-2"
                >
                  {t("footer.bookAppointment")}
                </Link>
              </li>
              <li>
                <Link
                  to="/consultation"
                  className="text-gray-600 hover:text-indigo-600 transition-colors underline underline-offset-2"
                >
                  {t("footer.onlineConsultation")}
                </Link>
              </li>
              <li>
                <Link
                  to="/specialists"
                  className="text-gray-600 hover:text-indigo-600 transition-colors underline underline-offset-2"
                >
                  {t("footer.medicalSpecialists")}
                </Link>
              </li>
              <li>
                <span className="text-gray-400">{t("footer.healthArticles")}</span>
              </li>
            </ul>
          </motion.div>

          {/* Newsletter */}
          <motion.div
            variants={columnVariants}
            custom={3}
            initial="hidden"
            animate="visible"
          >
            <h4 className="text-lg font-medium text-gray-800 mb-4">{t("footer.stayUpdated")}</h4>
            <p className="text-sm text-gray-600 mb-4">{t("footer.newsletterText")}</p>
            <form className="flex flex-col sm:flex-row max-w-md">
              <input
                type="email"
                placeholder={t("footer.emailPlaceholder")}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="mt-2 sm:mt-0 sm:ml-2 px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                {t("footer.subscribe")}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Contact Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-600">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <p>Casablanca, Morocco</p>
          </div>
          <div className="flex items-start space-x-3">
            <Mail className="w-5 h-5 text-indigo-600" />
            <p>support@healthconnect.ma</p>
          </div>
          <div className="flex items-start space-x-3">
            <Phone className="w-5 h-5 text-indigo-600" />
            <p>+212 5XX XX XX XX</p>
          </div>
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 text-indigo-600" />
            <p>Mon – Sat: 8:00 AM – 6:00 PM</p>
          </div>
        </div>

        {/* Social Media */}
        <div className="mt-8 flex space-x-4">
          <motion.a
            href="#"
            aria-label="Facebook"
            className="p-2 bg-gray-100 rounded-full hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
            whileHover={iconHover}
          >
            <Facebook className="w-5 h-5" />
          </motion.a>
          <motion.a
            href="#"
            aria-label="Instagram"
            className="p-2 bg-gray-100 rounded-full hover:bg-pink-600 hover:text-white transition-colors shadow-sm"
            whileHover={iconHover}
          >
            <Instagram className="w-5 h-5" />
          </motion.a>
          <motion.a
            href="#"
            aria-label="LinkedIn"
            className="p-2 bg-gray-100 rounded-full hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
            whileHover={iconHover}
          >
            <Linkedin className="w-5 h-5" />
          </motion.a>
          <motion.a
            href="#"
            aria-label="Twitter"
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-800 hover:text-white transition-colors shadow-sm"
            whileHover={iconHover}
          >
            <Twitter className="w-5 h-5" />
          </motion.a>
          <motion.a
            href="#"
            aria-label="YouTube"
            className="p-2 bg-gray-100 rounded-full hover:bg-red-600 hover:text-white transition-colors shadow-sm"
            whileHover={iconHover}
          >
            <Youtube className="w-5 h-5" />
          </motion.a>
        </div>

        {/* Bottom Footer */}
        <div className="mt-12 border-t border-gray-200 pt-4 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {currentYear} HealthConnect. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center justify-center md:justify-end space-x-4 mt-2 md:mt-0">
            <Link to="/privacy" className="hover:underline">{t("footer.privacyPolicy")}</Link>
            <span className="border-l border-gray-300 h-4" />
            <Link to="/terms" className="hover:underline">{t("footer.termsOfService")}</Link>
            <span className="border-l border-gray-300 h-4" />
            <Link to="/cookies" className="hover:underline">{t("footer.cookiePolicy")}</Link>
            <span className="border-l border-gray-300 h-4" />
            <span>{t("footer.academicNote")}</span>
            <span className="border-l border-gray-300 h-4" />
            <span>Developed for Academic Purposes (PFE Project)</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;

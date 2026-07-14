import React from "react";
import { Link } from "react-router-dom";
import "../../Assets/Css/HomeCss/Footer.css";
import { useTranslation } from "react-i18next";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const Footer = ({ colorText }) => {
  const { t } = useTranslation();
  const textColor = colorText || "white";
  return (
    <footer className="footer" data-testid="footer">
      <div className="footer__container">
        {/* Logo & description */}
        <div className="footer__brand">
          <Link to="/" className="footer__logo">
            <img src="/img/logo.png" alt="HealthConnect" />
          </Link>
          <p className="footer__tagline">{t("footer.tagline")}</p>
        </div>
        {/* Useful links */}
        <div className="footer__links">
          <h4 className="footer__title">{t("footer.about")}</h4>
          <ul>
            <li><Link to="/aboutus">{t("footer.aboutUs")}</Link></li>
            <li><Link to="/faq">{t("footer.faq")}</Link></li>
            <li><Link to="/contact">{t("footer.contact")}</Link></li>
          </ul>
        </div>
        {/* Services links */}
        <div className="footer__services">
          <h4 className="footer__title">{t("footer.services")}</h4>
          <ul>
            <li><Link to="/searchdoctors">{t("footer.searchDoctors")}</Link></li>
            <li><Link to="/booking">{t("footer.bookAppointment")}</Link></li>
            <li><Link to="/profile">{t("footer.profile")}</Link></li>
          </ul>
        </div>
        {/* Contact info */}
        <div className="footer__contact">
          <h4 className="footer__title">{t("footer.contactUs")}</h4>
          <p>123 Health St., Berlin, Germany</p>
          <p>info@healthconnect.com</p>
          <p>+49 30 1234 5678</p>
        </div>
      </div>
      {/* Social media */}
      <div className="footer__bottom">
        <p className={`text-${textColor} text-[14px]`}>© {new Date().getFullYear()} {t('footer.copyright')}</p>
        <div className="footer__social">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"><FaTwitter /></a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"><FaLinkedinIn /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

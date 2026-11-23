import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Instagram,
  Twitter,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Our Story', href: '/story' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' }
    ],
    shopping: [
      { name: 'Shop All', href: '/products' },
      { name: 'New Arrivals', href: '/products?sort=newest' },
      { name: 'Best Sellers', href: '/best-sellers' },
      { name: 'Sale', href: '/sale' },
      { name: 'Gift Cards', href: '/gift-cards' }
    ],
    policy: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Shipping Policy', href: '/shipping' },
      { name: 'Return & Refund Policy', href: '/returns' },
      { name: 'FAQ', href: '/faq' }
    ]
  };

  return (
    <footer className="bg-tara-black text-tara-cream">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and About */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-tara-gold mb-4">
              TARA COLLECTIONS
            </h3>
            <p className="text-tara-gray mb-4 text-sm leading-relaxed">
              Premium fashion and jewellery with elegance for every occasion.
              Discover our curated collection of luxury-inspired pieces.
            </p>
            <div className="flex space-x-4">
              <a href="https://instagram.com" className="text-tara-gray hover:text-tara-gold transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://facebook.com" className="text-tara-gray hover:text-tara-gold transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-tara-gray hover:text-tara-gold transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-serif font-medium text-tara-cream mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-tara-gray hover:text-tara-gold transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shopping Links */}
          <div>
            <h4 className="text-lg font-serif font-medium text-tara-cream mb-4">Shopping</h4>
            <ul className="space-y-3">
              {footerLinks.shopping.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-tara-gray hover:text-tara-gold transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-serif font-medium text-tara-cream mb-4">Contact</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-tara-gold flex-shrink-0 mt-0.5" />
                <p className="text-sm text-tara-gray">
                  123 Fashion Street<br />
                  Mumbai, Maharashtra 400001<br />
                  India
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-tara-gold flex-shrink-0" />
                <p className="text-sm text-tara-gray">+91 98765 43210</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-tara-gold flex-shrink-0" />
                <p className="text-sm text-tara-gray">support@tara-collections.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-tara-dark-gray mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-tara-gray">
            © {currentYear} TARA COLLECTIONS. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            {footerLinks.policy.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm text-tara-gray hover:text-tara-gold transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
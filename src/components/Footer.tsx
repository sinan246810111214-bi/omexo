import React from 'react';
import { useHashRouter, AppRoute } from '../hooks/useHashRouter';
import { Mail, Phone, MapPin, Shield, Truck, RefreshCw, Instagram, Facebook } from 'lucide-react';
import { useToast } from './Toast';

export const Footer: React.FC = () => {
  const { navigate } = useHashRouter();
  const { toast } = useToast();

  const legalRoutes: { label: string; route: AppRoute }[] = [
    { label: 'Privacy Policy', route: 'privacy-policy' },
    { label: 'Terms & Conditions', route: 'terms' },
    { label: 'Shipping Policy', route: 'shipping-policy' },
    { label: 'Refund & Return Policy', route: 'refund-policy' },
    { label: 'Contact Us', route: 'contact-us' },
  ];

  const handleSubscribe = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = new FormData(e.currentTarget).get('email') as string;
    if (email) {
      toast('Welcome to the Omexo Elite club! Watch your inbox for VIP drops.', 'success');
      e.currentTarget.reset();
    }
  };

  return (
    <footer className="bg-black text-zinc-400 mt-auto border-t border-zinc-800" id="footer-container">
      {/* Upper Certifications Deck */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-b border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-6 text-center md:text-left">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-zinc-900 text-white rounded mx-auto md:mx-0 shrink-0 border border-zinc-800">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-1">Free Express Shipping</h4>
            <p className="text-[11px] text-zinc-500 font-medium">Fast, insured delivery to over 19,000 pincodes across India at no extra cost.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-zinc-900 text-white rounded mx-auto md:mx-0 shrink-0 border border-zinc-800">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white mb-1">Easy Replacement</h4>
            <p className="text-[11px] text-zinc-500 font-medium">Hassle-free 7-day replacement if your gadget arrives with any defect.</p>
          </div>
        </div>
      </div>

      {/* Main Content grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Desk */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded bg-white flex items-center justify-center font-bold text-black text-sm">
              O
            </div>
            <span className="text-sm font-bold uppercase text-white tracking-widest">OMEXO</span>
          </div>
          <p className="text-[11px] leading-relaxed text-zinc-500 font-medium">
            We engineer high-performance mobile accessories and premium smart gadgets designed to integrate flawlessly into your modern digital lifestyle.
          </p>
          
          {/* Social Links */}
          <div className="flex items-center gap-3 pt-1" id="footer-socials">
            <a
              href="https://www.instagram.com/omexo.india/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded border border-transparent hover:border-zinc-800 transition-all"
              aria-label="Instagram"
              id="footer-social-instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https://www.facebook.com/profile.php?id=61593964663280"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded border border-transparent hover:border-zinc-800 transition-all"
              aria-label="Facebook"
              id="footer-social-facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>

          <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
            © {new Date().getFullYear()} Omexo Inc. All rights reserved.
          </div>
        </div>

        {/* Legal links */}
        <div>
          <h5 className="text-[10px] font-bold tracking-widest text-white uppercase mb-4">Support & Legal</h5>
          <ul className="space-y-2 text-sm font-semibold">
            {legalRoutes.map((link) => (
              <li key={link.route}>
                <button
                  onClick={() => navigate(link.route)}
                  className="text-zinc-500 hover:text-white transition-colors text-left text-xs uppercase tracking-wider"
                  id={`footer-link-${link.route}`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h5 className="text-[10px] font-bold tracking-widest text-white uppercase mb-4">Omexo Support</h5>
          <ul className="space-y-3 text-xs text-zinc-500 font-medium">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-white shrink-0" />
              <span>+91 99465 97201 (10 AM - 6 PM)</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-white shrink-0" />
              <span>omexoofficial@gmail.com</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-white shrink-0 mt-0.5" />
              <span>Omexo Tech Hub, Phase 1, Infopark Kochi, Kerala, India - 682030</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h5 className="text-[10px] font-bold tracking-widest text-white uppercase mb-4">Stay Synchronized</h5>
          <p className="text-[11px] text-zinc-500 mb-3 leading-relaxed font-medium">
            Subscribe to receive priority notifications on premium flash sales and limited edition product drops.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded text-white placeholder-zinc-600 focus:outline-none focus:border-white transition-colors"
              id="footer-newsletter-email"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-white text-black font-bold text-[10px] uppercase tracking-wider rounded hover:bg-zinc-200 transition-colors shrink-0"
              id="footer-newsletter-submit"
            >
              Join
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
};

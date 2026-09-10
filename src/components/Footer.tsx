import React from 'react';
import { useHashRouter, AppRoute } from '../hooks/useHashRouter';
import { Mail, Phone, MapPin, Shield, Truck, RefreshCw } from 'lucide-react';
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
    <footer className="bg-slate-900 text-slate-400 mt-auto border-t border-slate-800" id="footer-container">
      {/* Upper Certifications Deck */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-b border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-6 text-center md:text-left">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-800 text-teal-400 rounded-xl mx-auto md:mx-0 shrink-0">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Free Express Shipping</h4>
            <p className="text-xs text-slate-500">Fast, insured delivery to over 19,000 pincodes across India at no extra cost.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-slate-800 text-teal-400 rounded-xl mx-auto md:mx-0 shrink-0">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Easy Replacement</h4>
            <p className="text-xs text-slate-500">Hassle-free 7-day replacement if your gadget arrives with any defect.</p>
          </div>
        </div>
      </div>

      {/* Main Content grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Desk */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-slate-900 text-base">
              O
            </div>
            <span className="text-lg font-black text-white tracking-wider">OMEXO</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            We engineer high-performance mobile accessories and premium smart gadgets designed to integrate flawlessly into your modern digital lifestyle.
          </p>
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} Omexo Inc. All rights reserved.
          </div>
        </div>

        {/* Legal links */}
        <div>
          <h5 className="text-xs font-black tracking-widest text-white uppercase mb-4">Support & Legal</h5>
          <ul className="space-y-2.5 text-sm">
            {legalRoutes.map((link) => (
              <li key={link.route}>
                <button
                  onClick={() => navigate(link.route)}
                  className="hover:text-teal-400 transition-colors text-left text-xs"
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
          <h5 className="text-xs font-black tracking-widest text-white uppercase mb-4">Omexo Support</h5>
          <ul className="space-y-3 text-xs text-slate-500">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-teal-500 shrink-0" />
              <span>+91 99465 97201 (10 AM - 6 PM)</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-teal-500 shrink-0" />
              <span>omexoofficial@gmail.com</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
              <span>Omexo Tech Hub, Phase 1, Infopark Kochi, Kerala, India - 682030</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h5 className="text-xs font-black tracking-widest text-white uppercase mb-4">Stay Synchronized</h5>
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            Subscribe to receive priority notifications on premium flash sales and limited edition product drops.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
              id="footer-newsletter-email"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-teal-500 text-slate-900 font-bold text-xs rounded-lg hover:bg-teal-400 transition-colors shrink-0"
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

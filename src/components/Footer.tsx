import React from 'react';
import { useHashRouter, AppRoute } from '../hooks/useHashRouter';
import { Mail, Phone, MapPin, Shield, Truck, RefreshCw, Settings, Info } from 'lucide-react';
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
    <footer className="bg-pine-green text-warm-white/80 mt-auto border-t border-white/10 relative z-10" id="footer-container">
      {/* Upper Certifications Deck with subtle translucent border */}
      <div className="max-w-7xl mx-auto px-4 py-8 border-b border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8 text-center md:text-left">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 text-warm-white rounded-2xl shrink-0 border border-white/10 backdrop-blur-md">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold font-display uppercase tracking-wider text-warm-white mb-1">ALL INDIA FREE DELIVERY</h4>
            <p className="text-xs text-warm-white/60">Fast, insured delivery to over 19,000 pincodes across India at no extra cost.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/10 text-warm-white rounded-2xl shrink-0 border border-white/10 backdrop-blur-md">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-sm font-bold font-display uppercase tracking-wider text-warm-white mb-1">COD AVAILABLE & QUALITY PRODUCTS</h4>
            <p className="text-xs text-warm-white/60">Hassle-free cash payment upon arrival with 7-day premium replacement check.</p>
          </div>
        </div>
      </div>

      {/* Main Content grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand Desk */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => navigate('home')}>
            <img 
              src="https://i.ibb.co/qY8X8qv1/Chat-GPT-Image-Sep-10-2026-11-28-10-AM.png" 
              alt="OMEXO Logo" 
              className="h-16 w-auto object-contain brightness-0 invert"
              referrerPolicy="no-referrer"
            />
          </div>
          <p className="text-xs leading-relaxed text-warm-white/60">
            We engineer high-performance mobile accessories and premium smart gadgets designed to integrate flawlessly into your modern digital lifestyle. Minimal, luxury, everyday tools.
          </p>
          <div className="text-xs text-warm-white/40 pt-2">
            © {new Date().getFullYear()} Omexo India. All rights reserved.
          </div>
        </div>

        {/* Legal links */}
        <div>
          <h5 className="text-xs font-bold tracking-widest text-warm-white uppercase mb-4 font-display">Support & Legal</h5>
          <ul className="space-y-2 text-xs">
            {legalRoutes.map((link) => (
              <li key={link.route}>
                <button
                  onClick={() => navigate(link.route)}
                  className="text-warm-white/60 hover:text-warm-white transition-colors text-left font-medium"
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
          <h5 className="text-xs font-bold tracking-widest text-warm-white uppercase mb-4 font-display">Omexo Support</h5>
          <ul className="space-y-3 text-xs text-warm-white/60">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-soft-beige shrink-0" />
              <span>+91 99465 97201</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-soft-beige shrink-0" />
              <span>omexoofficial@gmail.com</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-soft-beige shrink-0 mt-0.5" />
              <span>Omexo Tech, Infopark Kochi, Kerala, India - 682030</span>
            </li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h5 className="text-xs font-bold tracking-widest text-warm-white uppercase mb-4 font-display">Stay Synchronized</h5>
          <p className="text-xs text-warm-white/60 mb-3 leading-relaxed">
            Subscribe to receive priority notifications on premium flash sales and limited edition product drops.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-2">
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="flex-1 px-3 py-2 text-xs bg-white/10 border border-white/10 rounded-xl text-warm-white placeholder-warm-white/40 focus:outline-none focus:border-white/30 transition-colors"
              id="footer-newsletter-email"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-soft-beige hover:bg-soft-beige-dark text-pine-green font-bold text-xs rounded-xl transition-colors shrink-0"
              id="footer-newsletter-submit"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Admin control bar with copyright */}
      <div className="border-t border-white/10 bg-black/10 py-6">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs text-warm-white/40">
          <div className="flex items-center gap-3">
            <span>Designed for the Modern Workspace</span>
            <span>·</span>
            <span>All India Free Delivery & COD</span>
          </div>
          <button
            onClick={() => navigate('admin')}
            className="p-1.5 text-warm-white/30 hover:text-warm-white hover:bg-white/5 transition-all rounded-lg cursor-pointer"
            title="Admin Control"
            id="btn-footer-admin-gear"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

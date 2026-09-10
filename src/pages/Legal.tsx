import React from 'react';
import { Shield, BookOpen, Truck, RefreshCw, Mail, Phone, MapPin, Send } from 'lucide-react';
import { useToast } from '../components/Toast';

interface LegalProps {
  policyType: 'privacy-policy' | 'terms' | 'shipping-policy' | 'refund-policy' | 'contact-us';
}

export const Legal: React.FC<LegalProps> = ({ policyType }) => {
  const { toast } = useToast();

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get('name');
    if (name) {
      toast(`Thank you, ${name}! Your support ticket is registered. We will reply in 4 hours.`, 'success');
      e.currentTarget.reset();
    }
  };

  // 1. Privacy Policy
  if (policyType === 'privacy-policy') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in" id="privacy-policy-view">
        <div className="flex items-center gap-2 mb-4 border-b border-zinc-200 pb-4">
          <Shield className="w-6 h-6 text-zinc-900 shrink-0" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-zinc-900 leading-none">Privacy Policy</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Last updated: September 2026</p>
          </div>
        </div>

        <div className="space-y-5 text-xs text-zinc-600 leading-relaxed">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">1. Data Storage & Encryption</h3>
            <p className="font-medium text-zinc-600">
              At Omexo, we prioritize protecting your transaction data. All billing information, phone confirmations, and local shipping directions are fully encrypted using standard secure socket layers. We do not store credit card credentials; online transactions are securely brokered via official payment modules.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">2. Real-Time Telemetry</h3>
            <p className="font-medium text-zinc-600">
              Our store system dispatches order notifications instantly to warehouse operators using secure API hooks (such as Telegram notifications). These notification pipelines protect customer addresses and only transmit the references necessary to compile your shipping consignment label.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">3. Local Cookie Consent</h3>
            <p className="font-medium text-zinc-600">
              We utilize persistent local cache states (`localStorage`) to synchronize your shopping cart selection and checkout information. No marketing telemetry trackers are sold to secondary data aggregators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 2. Terms & Conditions
  if (policyType === 'terms') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in" id="terms-conditions-view">
        <div className="flex items-center gap-2 mb-4 border-b border-zinc-200 pb-4">
          <BookOpen className="w-6 h-6 text-zinc-900 shrink-0" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-zinc-900 leading-none">Terms of Service</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Last updated: September 2026</p>
          </div>
        </div>

        <div className="space-y-5 text-xs text-zinc-600 leading-relaxed">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">1. Quality & Assembly Verification</h3>
            <p className="font-medium text-zinc-600">
              All official Omexo hardware (such as Wave Pro Smartwatches and Airbuds Audio sets) is engineered under strict manufacturing quality standards. This includes multi-stage testing and manual quality assurance sweeps prior to warehouse parcel packing.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">2. Pincode & Dispatch Liability</h3>
            <p className="font-medium text-zinc-600">
              While our pincode checker validates delivery eligibility, shipping timelines may vary slightly during bad weather or local courier delays. Dispatch is guaranteed within 24 hours of phone confirmation.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">3. Fair Pricing & Billing</h3>
            <p className="font-medium text-zinc-600">
              The listed Sale Price represents the comprehensive amount. regularPrice represents standard retail tags. No unnotified handling fees are appended upon checkout processing.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Shipping Policy
  if (policyType === 'shipping-policy') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in" id="shipping-policy-view">
        <div className="flex items-center gap-2 mb-4 border-b border-zinc-200 pb-4">
          <Truck className="w-6 h-6 text-zinc-900 shrink-0" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-zinc-900 leading-none">Shipping & Delivery</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Last updated: September 2026</p>
          </div>
        </div>

        <div className="space-y-5 text-xs text-zinc-600 leading-relaxed">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">1. Free Nationwide Shipping</h3>
            <p className="font-medium text-zinc-600">
              We are proud to offer complimentary express shipping on all orders, with zero minimum purchase thresholds. We cover over 19,000 active pincodes across India in partnership with premium delivery operators like Delhivery, Bluedart, and India Post.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">2. Dispatch & Tracking Updates</h3>
            <p className="font-medium text-zinc-600">
              Your order is packed and dispatched from our Kolkata warehouse within 12-24 hours. Once handed over, a unique 13-digit India Post Consignment Number (e.g. EP910849204IN) is logged onto your Track Order page. This can be tracked directly on the official India Post portal.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">3. Estimated Timelines</h3>
            <p className="font-medium text-zinc-600">
              Metro deliveries generally arrive in 2-3 business days. Non-metro locations and remote regions may require 4-6 business days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. Refund Policy
  if (policyType === 'refund-policy') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in" id="refund-policy-view">
        <div className="flex items-center gap-2 mb-4 border-b border-zinc-200 pb-4">
          <RefreshCw className="w-6 h-6 text-zinc-900 shrink-0" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-zinc-900 leading-none">Refund & Returns</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider mt-1">Last updated: September 2026</p>
          </div>
        </div>

        <div className="space-y-5 text-xs text-zinc-600 leading-relaxed">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">1. 7-Day Replacement Policy</h3>
            <p className="font-medium text-zinc-600">
              We stand behind our craftsmanship. In the rare event that your tech gadget arrives with a hardware defect, dead pixel, or functional battery failure, we provide a free replacement within 7 days of package delivery.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">2. Request Process</h3>
            <p className="font-medium text-zinc-600">
              To initiate a replacement, email a small 30-second package unboxing clip to <strong>support@omexo.in</strong> or file a support ticket on our Contact page. Our logistics carrier will coordinate a doorstep pick-up within 48 hours.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900">3. Refund Processing</h3>
            <p className="font-medium text-zinc-600">
              In the event that a replacement item is out of stock, we will issue a complete refund directly to your original source account (for prepaid cards) or process a bank transfer (for COD orders) within 5 business days.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 5. Contact Us
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in" id="contact-us-view">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-bold uppercase tracking-widest text-zinc-900 leading-none">Contact Omexo Team</h1>
        <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
          Need support with smart wearables, audio setups, or tracking details? Drop our expert crew a line below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Support details cards (5 cols) */}
        <div className="md:col-span-5 space-y-4" id="contact-details-cards">
          
          <div className="bg-zinc-50 border border-zinc-200 rounded p-4 flex gap-3.5 items-start">
            <div className="p-2 bg-white text-zinc-900 rounded shrink-0 border border-zinc-200">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Call Helpline</h4>
              <p className="text-xs font-bold text-zinc-900">+91 99465 97201</p>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Monday - Saturday (10 AM - 6 PM IST)</p>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded p-4 flex gap-3.5 items-start">
            <div className="p-2 bg-white text-zinc-900 rounded shrink-0 border border-zinc-200">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Mail Support</h4>
              <p className="text-xs font-bold text-zinc-900">omexoofficial@gmail.com</p>
              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-0.5">Guaranteed replies in 4 working hours</p>
            </div>
          </div>

          <div className="bg-zinc-50 border border-zinc-200 rounded p-4 flex gap-3.5 items-start">
            <div className="p-2 bg-white text-zinc-900 rounded shrink-0 border border-zinc-200">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Corporate HQ</h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-bold uppercase tracking-wider">
                Omexo Tech Hub, Infopark Kochi, Kerala, India - 682030
              </p>
            </div>
          </div>

        </div>

        {/* Contact Form panel (7 cols) */}
        <div className="md:col-span-7 bg-white border border-zinc-200 p-5 rounded" id="contact-form-panel">
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Your Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rahul"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded focus:outline-none focus:border-black font-semibold"
                  id="contact-name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3 py-2 text-xs border border-zinc-200 rounded focus:outline-none focus:border-black font-semibold"
                  id="contact-email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Related Order ID (Optional)</label>
              <input
                type="text"
                name="orderRef"
                placeholder="e.g. OMX-749204"
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded focus:outline-none focus:border-black font-semibold"
                id="contact-order-ref"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider block">Your Inquiry Message</label>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Explain what happened or what help you need..."
                className="w-full px-3 py-2 text-xs border border-zinc-200 rounded focus:outline-none focus:border-black font-semibold"
                id="contact-message"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-black hover:bg-zinc-900 text-white font-bold rounded text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
              id="contact-submit"
            >
              <Send className="w-3.5 h-3.5" />
              Dispatch Ticket
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

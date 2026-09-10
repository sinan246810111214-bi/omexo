import React from 'react';
import { useHashRouter } from '../hooks/useHashRouter';
import { useToast } from '../components/Toast';
import { Shield, BookOpen, Truck, RefreshCw, Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';

interface LegalProps {
  policyType: 'privacy-policy' | 'terms' | 'shipping-policy' | 'refund-policy' | 'contact-us';
}

export const Legal: React.FC<LegalProps> = ({ policyType }) => {
  const { navigate } = useHashRouter();
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
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
          <Shield className="w-8 h-8 text-teal-600 shrink-0" />
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Privacy Policy</h1>
            <p className="text-xs text-slate-400 mt-1">Last updated: September 2026</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-800">1. Data Storage & Encryption</h3>
          <p>
            At Omexo, we prioritize protecting your transaction data. All billing information, phone confirmations, and local shipping directions are fully encrypted using standard secure socket layers. We do not store credit card credentials; online transactions are securely brokered via official Razorpay and Cashfree modules.
          </p>

          <h3 className="text-sm font-bold text-slate-800">2. Real-Time Telemetry</h3>
          <p>
            Our store system dispatches order notifications instantly to warehouse operators using secure API hooks (such as Telegram notifications). These notification pipelines protect customer addresses and only transmit the references necessary to compile your shipping consignment label.
          </p>

          <h3 className="text-sm font-bold text-slate-800">3. Local Cookie Consent</h3>
          <p>
            We utilize persistent local cache states (`localStorage`) to synchronize your shopping cart selection and checkout information. No marketing telemetry trackers are sold to secondary data aggregators.
          </p>
        </div>
      </div>
    );
  }

  // 2. Terms & Conditions
  if (policyType === 'terms') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in" id="terms-conditions-view">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
          <BookOpen className="w-8 h-8 text-teal-600 shrink-0" />
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Terms of Service</h1>
            <p className="text-xs text-slate-400 mt-1">Last updated: September 2026</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-800">1. Quality & Assembly Verification</h3>
          <p>
            All official Omexo hardware (such as Wave Pro Smartwatches and Airbuds Audio sets) is engineered under strict manufacturing quality standards. This includes multi-stage testing and manual quality assurance sweeps prior to warehouse parcel packing.
          </p>

          <h3 className="text-sm font-bold text-slate-800">2. Pincode & Dispatch Liability</h3>
          <p>
            While our pincode checker validates delivery eligibility, shipping timelines may vary slightly during bad weather or local courier delays. Dispatch is guaranteed within 24 hours of phone OTP verification.
          </p>

          <h3 className="text-sm font-bold text-slate-800">3. Fair Pricing & Billing</h3>
          <p>
            The listed Sale Price represents the comprehensive amount. regularPrice represents standard retail tags. No unnotified handling fees are appended upon checkout processing.
          </p>
        </div>
      </div>
    );
  }

  // 3. Shipping Policy
  if (policyType === 'shipping-policy') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in" id="shipping-policy-view">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
          <Truck className="w-8 h-8 text-teal-600 shrink-0" />
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Shipping & Delivery</h1>
            <p className="text-xs text-slate-400 mt-1">Last updated: September 2026</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-800">1. Free Nationwide Shipping</h3>
          <p>
            We are proud to offer complimentary express shipping on all orders, with zero minimum purchase thresholds. We cover over 19,000 active pincodes across India in partnership with premium delivery operators like Delhivery, Bluedart, and India Post.
          </p>

          <h3 className="text-sm font-bold text-slate-800">2. Dispatch & Tracking Updates</h3>
          <p>
            Your order is packed and dispatched from our Kolkata warehouse within 12-24 hours. Once handed over, a unique 13-digit India Post Consignment Number (e.g. EP910849204IN) is logged onto your Track Order page. This can be tracked directly on the official India Post portal.
          </p>

          <h3 className="text-sm font-bold text-slate-800">3. Estimated Timelines</h3>
          <p>
            Metro deliveries generally arrive in 2-3 business days. Non-metro locations and remote hill regions may require 4-6 business days.
          </p>
        </div>
      </div>
    );
  }

  // 4. Refund Policy
  if (policyType === 'refund-policy') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in" id="refund-policy-view">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-4">
          <RefreshCw className="w-8 h-8 text-teal-600 shrink-0" />
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">Refund & Returns</h1>
            <p className="text-xs text-slate-400 mt-1">Last updated: September 2026</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-600 leading-relaxed">
          <h3 className="text-sm font-bold text-slate-800">1. 7-Day Replacement Policy</h3>
          <p>
            We stand behind our craftsmanship. In the rare event that your tech gadget arrives with a hardware defect, dead pixel, or functional battery failure, we provide a free replacement within 7 days of package delivery.
          </p>

          <h3 className="text-sm font-bold text-slate-800">2. Request Process</h3>
          <p>
            To initiate a replacement, email a small 30-second package unboxing clip to <strong>support@omexo.in</strong> or file a support ticket on our Contact page. Our logistics carrier will coordinate a doorstep pick-up within 48 hours.
          </p>

          <h3 className="text-sm font-bold text-slate-800">3. Refund Processing</h3>
          <p>
            In the event that a replacement item is out of stock, we will issue a complete refund directly to your original source account (for prepaid cards) or process a bank transfer (for COD orders) within 5 business days.
          </p>
        </div>
      </div>
    );
  }

  // 5. Contact Us
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in" id="contact-us-view">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Contact Omexo Team</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Need support with smart wearables, audio setups, or tracking details? Drop our expert crew a line below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Support details cards (5 cols) */}
        <div className="md:col-span-5 space-y-4" id="contact-details-cards">
          
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3.5 items-start">
            <div className="p-2.5 bg-white text-teal-600 rounded-xl shrink-0 shadow-sm border border-slate-100">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">Call Helpline</h4>
              <p className="text-sm font-black text-slate-700">+91 99465 97201</p>
              <p className="text-[10px] text-slate-400">Monday - Saturday (10 AM - 6 PM IST)</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3.5 items-start">
            <div className="p-2.5 bg-white text-teal-600 rounded-xl shrink-0 shadow-sm border border-slate-100">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">Mail Support</h4>
              <p className="text-sm font-black text-slate-700">omexoofficial@gmail.com</p>
              <p className="text-[10px] text-slate-400">Guaranteed replies in 4 working hours</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3.5 items-start">
            <div className="p-2.5 bg-white text-teal-600 rounded-xl shrink-0 shadow-sm border border-slate-100">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">Corporate HQ</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Omexo Tech Hub, Phase 1, Infopark Kochi, Kerala, India - 682030
              </p>
            </div>
          </div>

        </div>

        {/* Contact Form panel (7 cols) */}
        <div className="md:col-span-7 bg-white border border-slate-100 p-5 rounded-3xl" id="contact-form-panel">
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Your Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rahul"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                  id="contact-name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                  id="contact-email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Related Order ID (Optional)</label>
              <input
                type="text"
                name="orderRef"
                placeholder="e.g. OMX-749204"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                id="contact-order-ref"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">Your Inquiry Message</label>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Explain what happened or what help you need..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
                id="contact-message"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/10"
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

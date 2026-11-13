import React from 'react';
import { Shield, BookOpen, Truck, RefreshCw, Mail, Phone, MapPin, Send, ExternalLink, MessageCircle } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useStore } from '../hooks/useStore';
import { useHashRouter } from '../hooks/useHashRouter';
import {
  ORDER_LABEL_SENDER,
  formatWhatsappDisplay,
  getSiteBrandConfig,
  getWhatsAppNumberForCategory,
} from '../config/categories';
import { sanitizeSafeUrl } from '../lib/security';

interface LegalProps {
  policyType: 'privacy-policy' | 'terms' | 'shipping-policy' | 'refund-policy' | 'contact-us';
}

export const Legal: React.FC<LegalProps> = ({ policyType }) => {
  const { toast } = useToast();
  const { storeSettings } = useStore();
  const { siteSlug } = useHashRouter();
  const activeBrand = getSiteBrandConfig(siteSlug);
  const storeName = storeSettings?.storeName || activeBrand.name;
  const activeWhatsapp = getWhatsAppNumberForCategory(siteSlug, storeSettings);
  const supportPhone = storeSettings?.supportNum || ORDER_LABEL_SENDER.phone;
  const senderAddress = storeSettings?.address || ORDER_LABEL_SENDER.fullAddress;

  const policySupportStrip = (
    <div className="bg-white border border-pine-green/10 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-pine-green/80">
      <div>
        <span className="font-extrabold uppercase tracking-wider text-pine-green block text-[10px]">
          Sender &amp; Dispatch Address
        </span>
        <span className="font-semibold">{senderAddress}</span>
      </div>
      <a
        href={`tel:${supportPhone.replace(/\s+/g, '')}`}
        className="font-extrabold text-pine-green hover:underline shrink-0"
      >
        Support team: {supportPhone}
      </a>
    </div>
  );

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get('name');
    if (name) {
      toast(`Thank you, ${name}! Your support ticket for ${storeName} is registered. We will reply in 4 hours.`, 'success');
      e.currentTarget.reset();
    }
  };

  // 1. Privacy Policy
  if (policyType === 'privacy-policy') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in text-left" id="privacy-policy-view">
        <div className="flex items-center gap-2 mb-4 border-b border-pine-green/10 pb-4">
          <Shield className="w-6 h-6 text-pine-green shrink-0" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-pine-green leading-none font-display">Privacy Policy</h1>
            <p className="text-[10px] text-pine-green/45 font-bold uppercase tracking-wider mt-1">{storeName} · Updated October 2026</p>
          </div>
        </div>

        <div className="space-y-5 text-xs text-pine-green/70 leading-relaxed font-semibold">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-green">1. Data Storage & Encryption</h3>
            <p className="font-semibold text-pine-green/60">
              At {storeName}, we prioritize protecting your transaction data. All billing information, phone confirmations, and local shipping directions are encrypted using standard secure socket layers. We do not store credit card credentials.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-green">2. Dispatch Notifications</h3>
            <p className="font-semibold text-pine-green/60">
              Our store system dispatches order notifications strictly to the {storeName} warehouse team so your shipping consignment label can be compiled accurately.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-green">3. Local Storage</h3>
            <p className="font-semibold text-pine-green/60">
              We utilize local cache state (`localStorage`) strictly to preserve your {storeName} shopping cart selection across sessions.
            </p>
          </div>
        </div>
        {policySupportStrip}
      </div>
    );
  }

  // 2. Terms & Conditions
  if (policyType === 'terms') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in text-left" id="terms-conditions-view">
        <div className="flex items-center gap-2 mb-4 border-b border-pine-green/10 pb-4">
          <BookOpen className="w-6 h-6 text-pine-green shrink-0" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-pine-green leading-none font-display">Terms of Service</h1>
            <p className="text-[10px] text-pine-green/45 font-bold uppercase tracking-wider mt-1">{storeName} · Updated October 2026</p>
          </div>
        </div>

        <div className="space-y-5 text-xs text-pine-green/70 leading-relaxed font-semibold">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-green">1. Quality & Assembly Verification</h3>
            <p className="font-semibold text-pine-green/60">
              Every {storeName} product undergoes multi-stage inspection and manual quality checks prior to warehouse parcel packing.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-green">2. Pincode & Dispatch</h3>
            <p className="font-semibold text-pine-green/60">
              Shipping timelines may vary slightly during weather events or local courier delays. Dispatch typically takes place within 24 hours of confirmation.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-green">3. Fair Pricing & Billing</h3>
            <p className="font-semibold text-pine-green/60">
              The listed Sale Price represents the complete payable total. Zero hidden handling charges are added at checkout.
            </p>
          </div>
        </div>
        {policySupportStrip}
      </div>
    );
  }

  // 3. Shipping Policy
  if (policyType === 'shipping-policy') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in text-left" id="shipping-policy-view">
        <div className="flex items-center gap-2 mb-4 border-b border-pine-green/10 pb-4">
          <Truck className="w-6 h-6 text-pine-green shrink-0" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-pine-green leading-none font-display">Shipping & Delivery</h1>
            <p className="text-[10px] text-pine-green/45 font-bold uppercase tracking-wider mt-1">{storeName} · Updated October 2026</p>
          </div>
        </div>

        <div className="space-y-5 text-xs text-pine-green/70 leading-relaxed font-semibold">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-green">1. Free Nationwide Shipping</h3>
            <p className="font-semibold text-pine-green/60">
              {storeName} offers complimentary express shipping across 19,000+ active Indian pincodes with trusted logistics partners including Delhivery, Bluedart, and India Post.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-green">2. Dispatch & Tracking Updates</h3>
            <p className="font-semibold text-pine-green/60">
              Your order is packed and dispatched within 12–24 hours. Consignment tracking codes are posted on your Track Order page as soon as dispatched.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-green">3. Estimated Timelines</h3>
            <p className="font-semibold text-pine-green/60">
              Metro deliveries generally arrive in 2–3 business days. Non-metro locations may require 4–6 business days.
            </p>
          </div>
        </div>
        {policySupportStrip}
      </div>
    );
  }

  // 4. Refund Policy
  if (policyType === 'refund-policy') {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in text-left" id="refund-policy-view">
        <div className="flex items-center gap-2 mb-4 border-b border-pine-green/10 pb-4">
          <RefreshCw className="w-6 h-6 text-pine-green shrink-0" />
          <div>
            <h1 className="text-xl font-bold uppercase tracking-widest text-pine-green leading-none font-display">Refund & Returns</h1>
            <p className="text-[10px] text-pine-green/45 font-bold uppercase tracking-wider mt-1">{storeName} · Updated October 2026</p>
          </div>
        </div>

        <div className="space-y-5 text-xs text-pine-green/70 leading-relaxed font-semibold">
          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-green">1. Transit Damage Replacement</h3>
            <p className="font-semibold text-pine-green/60">
              If an item from {storeName} arrives damaged during transit, reach out within 7 days of delivery with an unboxing video for a quick replacement.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-green">2. Request Process</h3>
            <p className="font-semibold text-pine-green/60">
              Share your Order ID and unboxing clip via <strong>{storeSettings?.supportMail || 'omexoofficial@gmail.com'}</strong> or via our WhatsApp desk.
            </p>
          </div>

          <div className="space-y-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pine-green">3. Refund Processing</h3>
            <p className="font-semibold text-pine-green/60">
              If a replacement unit is unavailable, a full refund is processed within 5 business days.
            </p>
          </div>
        </div>
        {policySupportStrip}
      </div>
    );
  }

  // 5. Contact Us
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-in fade-in text-left" id="contact-us-view">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold uppercase tracking-widest text-pine-green font-display">
          Contact {storeName}
        </h1>
        <p className="text-xs text-pine-green/60 max-w-md mx-auto leading-relaxed font-semibold">
          Need support with your {storeName} order, WhatsApp COD confirmation, or tracking details? Reach our dedicated team below.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-5 space-y-4 font-semibold" id="contact-details-cards">
          <div className="glass-card p-5 flex gap-3.5 items-start rounded-2xl">
            <div className="p-2.5 bg-pine-green/5 text-pine-green rounded-xl border border-pine-green/10 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-[10px] font-bold text-pine-green/45 uppercase tracking-wider mb-0.5">
                {storeName} WhatsApp Desk
              </h4>
              <a
                href={`https://wa.me/${activeWhatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-black text-pine-green hover:underline flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                {formatWhatsappDisplay(activeWhatsapp)} ({activeBrand.shortLabel})
              </a>
              <p className="text-[11px] font-extrabold text-pine-green">
                Support team: <a href={`tel:${supportPhone.replace(/\s+/g, '')}`} className="underline">{supportPhone}</a>
              </p>
              <p className="text-[9px] text-pine-green/40 font-bold uppercase tracking-wider mt-0.5">
                Monday - Saturday (10 AM - 6 PM IST)
              </p>
            </div>
          </div>

          <div className="glass-card p-5 flex gap-3.5 items-start rounded-2xl">
            <div className="p-2.5 bg-pine-green/5 text-pine-green rounded-xl border border-pine-green/10 shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-pine-green/45 uppercase tracking-wider mb-0.5">Mail Support</h4>
              <p className="text-xs font-black text-pine-green">{storeSettings?.supportMail || 'omexoofficial@gmail.com'}</p>
              <p className="text-[9px] text-pine-green/40 font-bold uppercase tracking-wider mt-0.5">Fast replies during business hours</p>
            </div>
          </div>

          <div className="glass-card p-5 flex gap-3.5 items-start rounded-2xl">
            <div className="p-2.5 bg-pine-green/5 text-pine-green rounded-xl border border-pine-green/10 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold text-pine-green/45 uppercase tracking-wider mb-0.5">From / Sender &amp; Store Address</h4>
              <p className="text-xs font-extrabold text-pine-green">{ORDER_LABEL_SENDER.name}</p>
              <p className="text-[11px] text-pine-green/75 leading-relaxed font-semibold">
                {ORDER_LABEL_SENDER.address}
              </p>
              <p className="text-[10px] font-bold text-pine-green">
                Contact No / Support team: {supportPhone}
              </p>
              {sanitizeSafeUrl(storeSettings?.mapLocationUrl) && (
                <a
                  href={sanitizeSafeUrl(storeSettings?.mapLocationUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-extrabold text-pine-green hover:underline uppercase tracking-wider"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Contact Form panel (7 cols) */}
        <div className="md:col-span-7 glass-card p-6 rounded-[28px]" id="contact-form-panel">
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider block">Your Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rahul"
                  className="w-full px-4 py-2 bg-white/40 border border-pine-green/10 rounded-xl text-xs font-bold text-pine-green focus:outline-none focus:border-pine-green"
                  id="contact-name"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider block">Email Address</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-4 py-2 bg-white/40 border border-pine-green/10 rounded-xl text-xs font-bold text-pine-green focus:outline-none focus:border-pine-green"
                  id="contact-email"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider block">Related Order ID (Optional)</label>
              <input
                type="text"
                name="orderRef"
                placeholder="e.g. OMX-749204"
                className="w-full px-4 py-2 bg-white/40 border border-pine-green/10 rounded-xl text-xs font-bold text-pine-green focus:outline-none focus:border-pine-green"
                id="contact-order-ref"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-pine-green/45 tracking-wider block">Your Inquiry Message</label>
              <textarea
                name="message"
                required
                rows={4}
                placeholder="Explain what happened or what help you need..."
                className="w-full px-4 py-2 bg-white/40 border border-pine-green/10 rounded-xl text-xs font-bold text-pine-green focus:outline-none focus:border-pine-green resize-none"
                id="contact-message"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
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

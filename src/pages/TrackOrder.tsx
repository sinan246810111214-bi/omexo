import React, { useState, useEffect } from 'react';
import { useStore } from '../hooks/useStore';
import { useToast } from '../components/Toast';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  Search,
  Truck,
  ArrowRight,
  ClipboardCheck,
  PackageOpen,
  CheckCircle,
  Clock,
  ShieldCheck,
  Phone,
  MapPin,
} from 'lucide-react';
import { OrderStatus } from '../types';
import { ORDER_LABEL_SENDER, getSiteBrandConfig } from '../config/categories';
import { useHashRouter } from '../hooks/useHashRouter';

interface TrackedOrderSummary {
  id: string;
  orderStatus: OrderStatus;
  paymentType: 'COD' | 'Online';
  paymentStatus: 'Pending' | 'Paid';
  totalAmount: number;
  itemCount?: number;
  consignmentNumber?: string;
  createdAt: string;
}

type TimedTrackingStage = 'Dispatched' | 'Shipping' | 'Delivered' | 'Cancelled';

const ONE_HOUR_MS = 60 * 60 * 1000;

function computeTimedTrackingStage(order: TrackedOrderSummary, nowMs: number): TimedTrackingStage {
  if (order.orderStatus === 'Cancelled') return 'Cancelled';
  if (order.orderStatus === 'Delivered') return 'Delivered';
  const createdMs = new Date(order.createdAt).getTime();
  const elapsedMs = Number.isFinite(createdMs) ? Math.max(0, nowMs - createdMs) : ONE_HOUR_MS;
  return elapsedMs < ONE_HOUR_MS ? 'Dispatched' : 'Shipping';
}

export const TrackOrder: React.FC = () => {
  const { storeSettings } = useStore();
  const { siteSlug } = useHashRouter();
  const activeBrand = getSiteBrandConfig(siteSlug);
  const storeName = storeSettings?.storeName || activeBrand.name;
  const { toast } = useToast();

  const [orderId, setOrderId] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<TrackedOrderSummary | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const lookupOrderById = async (rawId: string, silent = false) => {
    const cleanId = rawId.trim().toUpperCase();
    if (!/^OMX-[0-9]{6}$/.test(cleanId)) {
      if (!silent) {
        toast('Please enter a valid Order ID (format: OMX-123456).', 'error');
      }
      return;
    }

    setIsSearching(true);
    try {
      const trackingSnap = await getDoc(doc(db, 'orderTracking', cleanId));
      setNowMs(Date.now());
      if (trackingSnap.exists()) {
        setSearchedOrder(trackingSnap.data() as TrackedOrderSummary);
        if (!silent) toast('Order found! Displaying live status.', 'success');
      } else {
        setSearchedOrder(null);
        if (!silent) toast('Order ID not found. Please check and try again.', 'error');
      }
      setHasSearched(true);
    } catch (err) {
      console.error('Order lookup error:', err);
      if (!silent) toast('Unable to verify order right now. Please retry.', 'error');
    } finally {
      setIsSearching(false);
    }
  };

  // Pre-fill recent order ID if customer just came from Checkout
  useEffect(() => {
    try {
      const recentId = sessionStorage.getItem('omexo_last_order_id');
      if (recentId && /^OMX-[0-9]{6}$/.test(recentId)) {
        setOrderId(recentId);
        sessionStorage.removeItem('omexo_last_order_id');
        lookupOrderById(recentId, true);
      }
    } catch {
      // ignore sessionStorage access errors
    }
  }, []);

  // Keep live timer ticking every 30s so 1-hour Dispatched -> Shipping transition updates live
  useEffect(() => {
    if (!searchedOrder) return;
    const interval = setInterval(() => {
      setNowMs(Date.now());
    }, 30000);
    return () => clearInterval(interval);
  }, [searchedOrder]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    await lookupOrderById(orderId, false);
  };

  const liveStage: TimedTrackingStage | null = searchedOrder
    ? computeTimedTrackingStage(searchedOrder, nowMs)
    : null;

  const createdMs = searchedOrder ? new Date(searchedOrder.createdAt).getTime() : 0;
  const remainingMinutes =
    searchedOrder && liveStage === 'Dispatched' && Number.isFinite(createdMs)
      ? Math.max(1, Math.ceil((ONE_HOUR_MS - Math.max(0, nowMs - createdMs)) / 60000))
      : 0;

  const pipelineSteps: {
    key: 'Placed' | 'Dispatched' | 'Shipping' | 'Delivered';
    label: string;
    desc: string;
  }[] = [
    {
      key: 'Placed',
      label: 'Order Confirmed',
      desc: 'Order registered successfully',
    },
    {
      key: 'Dispatched',
      label: 'Dispatched',
      desc:
        liveStage === 'Dispatched'
          ? `Dispatched from our hub · moves to Shipping in ~${remainingMinutes} min`
          : 'Dispatched from Omexo hub',
    },
    {
      key: 'Shipping',
      label: 'Shipping',
      desc:
        liveStage === 'Shipping'
          ? 'In transit to your delivery Post Office'
          : 'Starts automatically 1 hour after order',
    },
    {
      key: 'Delivered',
      label: 'Delivered',
      desc: 'Delivered at customer doorstep',
    },
  ];

  const getStepRank = (stage: string) => {
    const order = ['Placed', 'Dispatched', 'Shipping', 'Delivered'];
    return order.indexOf(stage);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 text-left" id="tracking-container">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <h1 className="text-2xl font-extrabold uppercase tracking-wider text-pine-green font-display">
          {storeName} Order Tracking
        </h1>
        <p className="text-xs text-pine-green/65 max-w-md mx-auto font-medium">
          Enter your Order Reference ID to check live dispatch &amp; shipping status.
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white border border-pine-green/10 p-4 sm:p-5 rounded-3xl space-y-3 shadow-sm" id="tracking-search-box">
        <form onSubmit={handleTrack} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pine-green/45 w-4 h-4" />
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value.toUpperCase())}
              placeholder="Order ID (e.g. OMX-123456)"
              className="w-full pl-10 pr-4 py-2.5 bg-warm-white border border-pine-green/15 rounded-full text-xs focus:outline-none focus:border-pine-green font-bold text-pine-green placeholder-pine-green/45"
              id="tracking-id-input"
            />
          </div>
          <button
            type="submit"
            disabled={isSearching}
            className="px-6 py-2.5 bg-pine-green hover:bg-pine-green-hover disabled:opacity-60 text-warm-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-colors cursor-pointer shrink-0"
            id="tracking-submit-btn"
          >
            {isSearching ? 'Checking...' : 'Track'}
          </button>
        </form>

        <div className="flex items-center gap-2 text-[11px] text-pine-green/60 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-pine-green shrink-0" />
          <span>Customer phone numbers and home addresses remain private during tracking.</span>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-4" id="tracking-results-panel">
          {searchedOrder && liveStage ? (
            <div className="space-y-4">
              {/* Order Summary & Live Stage Badge */}
              <div className="bg-white border border-pine-green/10 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="space-y-1">
                  <div className="text-[10px] text-pine-green/50 font-bold uppercase tracking-wider">
                    Order Reference
                  </div>
                  <h3 className="text-lg font-black text-pine-green font-mono leading-none">
                    {searchedOrder.id}
                  </h3>
                  <div className="text-[11px] text-pine-green/65 font-semibold">
                    {new Date(searchedOrder.createdAt).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}{' '}
                    · ₹{searchedOrder.totalAmount.toLocaleString('en-IN')} ({searchedOrder.paymentType})
                  </div>
                </div>

                <div className="flex flex-col sm:items-end space-y-1">
                  <div className="text-[10px] text-pine-green/50 font-bold uppercase tracking-wider">
                    Current Status
                  </div>
                  <span
                    className={`px-4 py-1.5 text-xs font-extrabold rounded-full border uppercase tracking-wider text-center ${
                      liveStage === 'Cancelled'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : liveStage === 'Delivered'
                        ? 'bg-pine-green text-warm-white border-pine-green'
                        : liveStage === 'Shipping'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                    id="tracking-live-status-badge"
                  >
                    {liveStage}
                  </span>
                </div>
              </div>

              {/* Progression Pipeline */}
              {liveStage !== 'Cancelled' ? (
                <div className="bg-white border border-pine-green/10 p-5 rounded-3xl space-y-5 shadow-sm" id="pipeline-tracker-box">
                  <h4 className="text-xs font-bold text-pine-green uppercase tracking-widest flex items-center gap-1.5 font-display">
                    <ClipboardCheck className="w-4 h-4" />
                    Delivery Progress
                  </h4>

                  <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-pine-green/15">
                    {pipelineSteps.map((step) => {
                      const currentRank = getStepRank(liveStage);
                      const stepRank = getStepRank(step.key);
                      const isCompleted = currentRank >= stepRank;
                      const isCurrent = currentRank === stepRank;

                      return (
                        <div key={step.key} className="relative" id={`pipeline-step-${step.key.toLowerCase()}`}>
                          <div
                            className={`absolute -left-6 top-1 w-4 h-4 rounded-full border flex items-center justify-center -translate-x-1/2 z-10 ${
                              isCompleted
                                ? 'border-pine-green bg-pine-green text-warm-white'
                                : 'border-pine-green/20 bg-white text-pine-green/20'
                            }`}
                          >
                            {isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                          </div>

                          <div className="space-y-0.5">
                            <h5
                              className={`text-xs uppercase tracking-wider ${
                                isCurrent
                                  ? 'text-pine-green font-black'
                                  : isCompleted
                                  ? 'text-pine-green/85 font-bold'
                                  : 'text-pine-green/35 font-bold'
                              }`}
                            >
                              {step.label}
                            </h5>
                            <p className="text-[11px] text-pine-green/65 font-medium">
                              {step.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-white border border-pine-green/10 rounded-3xl flex items-start gap-3">
                  <Clock className="w-4 h-4 text-pine-green shrink-0 mt-0.5" />
                  <div className="text-xs text-pine-green/75 font-semibold">
                    This order has been cancelled. Contact Support team{' '}
                    <a href={`tel:${storeSettings?.supportNum || ORDER_LABEL_SENDER.phone}`} className="font-extrabold text-pine-green underline">
                      {storeSettings?.supportNum || ORDER_LABEL_SENDER.phone}
                    </a>{' '}
                    or {storeSettings?.supportMail || 'omexoofficial@gmail.com'} for help.
                  </div>
                </div>
              )}

              {/* Consignment Tracking (when assigned) */}
              {searchedOrder.consignmentNumber && (
                <div className="bg-white border border-pine-green/10 p-5 rounded-3xl space-y-3 shadow-sm" id="consignment-redirection-box">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-[10px] text-pine-green/50 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" />
                        India Post Consignment ID
                      </div>
                      <div className="text-sm font-bold font-mono text-pine-green mt-0.5">
                        {searchedOrder.consignmentNumber}
                      </div>
                    </div>
                    <a
                      href="https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-pine-green hover:bg-pine-green-hover text-warm-white font-bold text-xs uppercase tracking-wider rounded-full transition-colors inline-flex items-center justify-center gap-1.5 shrink-0"
                      id="india-post-portal-link"
                    >
                      India Post Track
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 bg-white border border-pine-green/10 rounded-3xl text-center space-y-2 shadow-sm" id="tracking-error-panel">
              <PackageOpen className="w-9 h-9 text-pine-green/35 mx-auto" />
              <h4 className="text-xs font-bold text-pine-green uppercase tracking-wider font-display">
                Order Not Found
              </h4>
              <p className="text-xs text-pine-green/60 max-w-xs mx-auto">
                No order matches this reference ID. Check your Order ID (e.g. OMX-123456).
              </p>
            </div>
          )}
        </div>
      )}

      {/* Sender / Dispatch & Support Team Strip */}
      <div className="bg-white border border-pine-green/10 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-pine-green/75 shadow-sm">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-pine-green shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-pine-green block">
              From / Dispatch Hub
            </span>
            <span className="font-semibold">
              {ORDER_LABEL_SENDER.name}, {ORDER_LABEL_SENDER.address}
            </span>
          </div>
        </div>
        <a
          href={`tel:${storeSettings?.supportNum || ORDER_LABEL_SENDER.phone}`}
          className="inline-flex items-center gap-1.5 font-extrabold text-pine-green hover:underline shrink-0"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Support team: {storeSettings?.supportNum || ORDER_LABEL_SENDER.phone}</span>
        </a>
      </div>
    </div>
  );
};

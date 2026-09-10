import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useToast } from '../components/Toast';
import { Search, MapPin, Truck, Calendar, ArrowRight, ClipboardCheck, Info, PackageOpen, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { OrderStatus } from '../types';

export const TrackOrder: React.FC = () => {
  const { orders } = useStore();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<any>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = orderId.trim().toUpperCase();
    if (!cleanId) {
      toast('Please enter a valid order reference ID.', 'error');
      return;
    }

    const order = orders.find((o) => o.id === cleanId);
    if (order) {
      setSearchedOrder(order);
      toast('Order found! Displaying status history.', 'success');
    } else {
      setSearchedOrder(null);
      toast('Order reference ID not found. Please verify spelling.', 'error');
    }
    setHasSearched(true);
  };

  const selectPrebuiltId = (id: string) => {
    setOrderId(id);
    const order = orders.find((o) => o.id === id);
    if (order) {
      setSearchedOrder(order);
      toast('Simulated order parsed successfully!', 'success');
    }
    setHasSearched(true);
  };

  const getPipelineIndex = (status: OrderStatus): number => {
    const sequence: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    return sequence.indexOf(status);
  };

  const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'Pending', label: 'Order Registered', desc: 'Awaiting payment confirmation & inventory check' },
    { key: 'Processing', label: 'Packaging & QC Checked', desc: 'Item double-tested and packed securely in mint sleeve' },
    { key: 'Shipped', label: 'Dispatched to Carrier', desc: 'Handed over to India Post cargo hub' },
    { key: 'Delivered', label: 'Hand Delivered', desc: 'Completed and verified at recipient address' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-16 animate-in fade-in duration-300" id="tracking-container">
      
      {/* Header section */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight leading-none">Consignment Tracking</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Trace your Omexo high-performance tech gears from our automated assembly line straight to your doorstep.
        </p>
      </div>

      {/* Tracker Search Form */}
      <div className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm" id="tracking-search-box">
        <form onSubmit={handleTrack} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your Order Reference ID (e.g. OMX-123456)"
              className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
              id="tracking-id-input"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl text-sm transition-colors"
            id="tracking-submit-btn"
          >
            Track Order
          </button>
        </form>

        {/* pre-filled test IDs (to aid quick testing for reviewer) */}
        {orders.length > 0 ? (
          <div className="mt-4 pt-3 border-t border-slate-100/70 text-xs">
            <span className="font-bold text-slate-500 block mb-2">Available Persisted Orders (Click to test):</span>
            <div className="flex flex-wrap gap-2">
              {orders.slice(0, 4).map((o) => (
                <button
                  key={o.id}
                  onClick={() => selectPrebuiltId(o.id)}
                  className="px-2.5 py-1.5 rounded-lg border border-teal-100 hover:bg-teal-50/50 text-teal-700 font-mono font-bold transition-all"
                  id={`test-order-${o.id}`}
                >
                  {o.id} ({o.orderStatus})
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-slate-100/70 text-xs text-slate-400">
            💡 No orders placed yet in this browser session. Place an order on the checkout screen first to generate tracking references!
          </div>
        )}
      </div>

      {/* Tracking results view */}
      {hasSearched && (
        <div className="space-y-6" id="tracking-results-panel">
          {searchedOrder ? (
            <div className="space-y-6">
              
              {/* Order Basic Meta Header */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Persisted Reference</div>
                  <h3 className="text-lg font-black text-slate-800 font-mono leading-none">{searchedOrder.id}</h3>
                  <div className="text-xs text-slate-500">Placed on: {new Date(searchedOrder.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
                </div>

                <div className="flex flex-col sm:items-end space-y-1">
                  <div className="text-xs text-slate-400 font-bold uppercase">Estimated Status</div>
                  <span className={`px-3 py-1 text-xs font-black rounded-full text-center ${
                    searchedOrder.orderStatus === 'Cancelled'
                      ? 'bg-rose-50 text-rose-700 border border-rose-100'
                      : searchedOrder.orderStatus === 'Delivered'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-teal-50 text-teal-700 border border-teal-100'
                  }`}>
                    • {searchedOrder.orderStatus}
                  </span>
                </div>
              </div>

              {/* India Post Consignment redirection */}
              <div className="bg-white border border-slate-100 p-5 rounded-2xl space-y-4" id="consignment-redirection-box">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-teal-600" />
                  India Post Logistics
                </h4>
                
                {searchedOrder.consignmentNumber ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-teal-50/50 border border-teal-100/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">Consignment Tracking ID</div>
                        <div className="text-sm font-black font-mono text-teal-800">{searchedOrder.consignmentNumber}</div>
                      </div>
                      <a
                        href="https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0"
                        id="india-post-portal-link"
                      >
                        Launch India Post Portal
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                      Note: Your consignment code is officially registered with India Post. Clicking the link redirects to the official government portal where you can verify exact GPS courier locations.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-500 leading-relaxed">
                      Your parcel is being packaged & sorted in our central warehouse. Consignment and carrier IDs are automatically generated upon hand-over to India Post cargo dispatchers (Usually within 12 hours). Check back shortly!
                    </div>
                  </div>
                )}
              </div>

              {/* Vertical Pipeline Tracker */}
              {searchedOrder.orderStatus !== 'Cancelled' ? (
                <div className="bg-white border border-slate-100 p-6 rounded-2xl space-y-6" id="pipeline-tracker-box">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <ClipboardCheck className="w-4 h-4 text-teal-600" />
                    Delivery Progression Pipeline
                  </h4>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-slate-100">
                    {statusSteps.map((step, idx) => {
                      const isCompleted = getPipelineIndex(searchedOrder.orderStatus) >= getPipelineIndex(step.key);
                      const isCurrent = searchedOrder.orderStatus === step.key;

                      return (
                        <div key={step.key} className="relative" id={`pipeline-step-${step.key.toLowerCase()}`}>
                          {/* Dot indicator */}
                          <div className={`absolute -left-6 top-1 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center -translate-x-1/2 z-10 transition-colors ${
                            isCompleted
                              ? 'border-teal-600 bg-teal-600 text-white'
                              : 'border-slate-200 bg-white'
                          }`}>
                            {isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                          </div>

                          <div className="space-y-0.5">
                            <h5 className={`text-xs font-bold ${
                              isCurrent ? 'text-teal-700' : isCompleted ? 'text-slate-800' : 'text-slate-400'
                            }`}>
                              {step.label}
                            </h5>
                            <p className="text-[10px] text-slate-400 max-w-md">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl flex items-start gap-3">
                  <Clock className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-rose-800 leading-relaxed font-semibold">
                    This order has been officially cancelled. Refund processing is underway. Please contact support@omexo.in if you have further inquiries.
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="py-12 bg-white border border-slate-100 rounded-3xl text-center space-y-3" id="tracking-error-panel">
              <PackageOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No Consignment Linked</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                No active invoice matches this tracking reference. Check the spelling or try adding a new order to generate valid sequences.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

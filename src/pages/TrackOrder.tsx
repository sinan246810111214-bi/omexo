import React, { useState } from 'react';
import { useStore } from '../hooks/useStore';
import { useToast } from '../components/Toast';
import { Search, Truck, ArrowRight, ClipboardCheck, Info, PackageOpen, CheckCircle, Clock } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto space-y-8 pb-16 animate-in fade-in duration-150 text-left" id="tracking-container">
      
      {/* Header section */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-extrabold uppercase tracking-widest text-pine-green font-display">Consignment Tracking</h1>
        <p className="text-xs text-pine-green/60 max-w-md mx-auto leading-relaxed font-semibold">
          Trace your Omexo high-performance tech gears from our automated assembly line straight to your doorstep.
        </p>
      </div>

      {/* Tracker Search Form */}
      <div className="glass-card p-6 rounded-[28px]" id="tracking-search-box">
        <form onSubmit={handleTrack} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-pine-green/40 w-4 h-4" />
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter your Order Reference ID (e.g. OMX-123456)"
              className="w-full pl-10 pr-4 py-2 bg-white/40 border border-pine-green/10 rounded-full text-xs focus:outline-none focus:border-pine-green focus:ring-0 font-bold text-pine-green placeholder-pine-green/40"
              id="tracking-id-input"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-pine-green hover:bg-pine-green-hover text-warm-white font-extrabold rounded-full text-xs uppercase tracking-widest transition-colors cursor-pointer"
            id="tracking-submit-btn"
          >
            Track
          </button>
        </form>

        {/* test IDs */}
        {orders.length > 0 ? (
          <div className="mt-4 pt-3 border-t border-pine-green/5 text-[10px]">
            <span className="font-bold text-pine-green/40 uppercase tracking-wider block mb-2">Available Orders (Click to test):</span>
            <div className="flex flex-wrap gap-2">
              {orders.slice(0, 4).map((o) => (
                <button
                  key={o.id}
                  onClick={() => selectPrebuiltId(o.id)}
                  className="px-3 py-1 bg-white/40 border border-pine-green/10 rounded-full hover:border-pine-green hover:bg-white text-pine-green font-mono font-bold transition-all text-[10px] uppercase tracking-wider cursor-pointer"
                  id={`test-order-${o.id}`}
                >
                  {o.id} ({o.orderStatus})
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-3 border-t border-pine-green/5 text-[10px] text-pine-green/45 font-bold uppercase tracking-wider">
            💡 No orders placed yet in this browser session. Place an order on checkout first!
          </div>
        )}
      </div>

      {/* Tracking results view */}
      {hasSearched && (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-200" id="tracking-results-panel">
          {searchedOrder ? (
            <div className="space-y-6">
              
              {/* Order Basic Meta Header */}
              <div className="glass-card p-6 rounded-[28px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-[10px] text-pine-green/45 font-bold uppercase tracking-wider">Reference Code</div>
                  <h3 className="text-lg font-black text-pine-green font-mono leading-none">{searchedOrder.id}</h3>
                  <div className="text-[10px] text-pine-green/40 font-bold uppercase tracking-wide">Placed: {new Date(searchedOrder.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}</div>
                </div>

                <div className="flex flex-col sm:items-end space-y-1">
                  <div className="text-[10px] text-pine-green/45 font-bold uppercase tracking-wider">Estimated Status</div>
                  <span className={`px-4 py-1 text-[10px] font-extrabold rounded-full border uppercase tracking-wider text-center ${
                    searchedOrder.orderStatus === 'Cancelled'
                      ? 'bg-pine-green/5 text-pine-green/50 border-pine-green/10'
                      : searchedOrder.orderStatus === 'Delivered'
                      ? 'bg-pine-green text-warm-white border-pine-green'
                      : 'bg-soft-beige text-pine-green border-pine-green/10'
                  }`}>
                    {searchedOrder.orderStatus}
                  </span>
                </div>
              </div>

              {/* India Post Consignment */}
              <div className="glass-card p-6 rounded-[28px] space-y-4" id="consignment-redirection-box">
                <h4 className="text-[10px] font-bold text-pine-green uppercase tracking-widest flex items-center gap-1.5 font-display">
                  <Truck className="w-4 h-4" />
                  India Post Logistics
                </h4>
                
                {searchedOrder.consignmentNumber ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-white/40 border border-pine-green/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="text-[10px] text-pine-green/45 font-bold uppercase tracking-wider">Consignment Number</div>
                        <div className="text-xs font-bold font-mono text-pine-green">{searchedOrder.consignmentNumber}</div>
                      </div>
                      <a
                        href="https://www.indiapost.gov.in/_layouts/15/dop.portal.tracking/trackconsignment.aspx"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-pine-green hover:bg-pine-green-hover text-warm-white font-bold text-[10px] uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-1.5 shrink-0"
                        id="india-post-portal-link"
                      >
                        Launch India Post
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-[9px] text-pine-green/40 leading-relaxed font-bold uppercase tracking-wider">
                      Note: Your consignment code is officially registered with India Post. Clicking the link redirects to the government portal.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-white/40 border border-pine-green/10 rounded-2xl flex items-start gap-3">
                    <Info className="w-4 h-4 text-pine-green/40 shrink-0 mt-0.5" />
                    <div className="text-[10px] text-pine-green/60 font-semibold leading-relaxed">
                      Your parcel is being packaged & sorted in our central warehouse. Consignment and carrier IDs are automatically generated upon hand-over to India Post cargo dispatchers (Usually within 12 hours). Check back shortly!
                    </div>
                  </div>
                )}
              </div>

              {/* Vertical Pipeline Tracker */}
              {searchedOrder.orderStatus !== 'Cancelled' ? (
                <div className="glass-card p-6 rounded-[28px] space-y-6" id="pipeline-tracker-box">
                  <h4 className="text-[10px] font-bold text-pine-green uppercase tracking-widest flex items-center gap-1.5 mb-2 font-display">
                    <ClipboardCheck className="w-4 h-4" />
                    Progression Pipeline
                  </h4>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-1.5 before:bottom-1.5 before:w-0.5 before:bg-pine-green/10">
                    {statusSteps.map((step) => {
                      const isCompleted = getPipelineIndex(searchedOrder.orderStatus) >= getPipelineIndex(step.key);
                      const isCurrent = searchedOrder.orderStatus === step.key;

                      return (
                        <div key={step.key} className="relative" id={`pipeline-step-${step.key.toLowerCase()}`}>
                          {/* Dot indicator */}
                          <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border flex items-center justify-center -translate-x-1/2 z-10 transition-colors ${
                            isCompleted
                              ? 'border-pine-green bg-pine-green text-warm-white'
                              : 'border-pine-green/10 bg-white text-pine-green/20'
                          }`}>
                            {isCompleted && <CheckCircle className="w-3.5 h-3.5" />}
                          </div>

                          <div className="space-y-1">
                            <h5 className={`text-xs font-bold uppercase tracking-wider ${
                              isCurrent ? 'text-pine-green font-black' : isCompleted ? 'text-pine-green/80' : 'text-pine-green/30'
                            }`}>
                              {step.label}
                            </h5>
                            <p className="text-[10px] text-pine-green/50 font-semibold leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-white/40 border border-pine-green/10 rounded-[24px] flex items-start gap-3">
                  <Clock className="w-4 h-4 text-pine-green shrink-0 mt-0.5" />
                  <div className="text-[10px] text-pine-green/60 leading-relaxed font-bold uppercase tracking-wider">
                    This order has been officially cancelled. Refund processing is underway. Please contact support@omexo.in if you have further inquiries.
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="py-12 glass-card rounded-[28px] text-center space-y-3" id="tracking-error-panel">
              <PackageOpen className="w-10 h-10 text-pine-green/30 mx-auto" />
              <h4 className="text-xs font-bold text-pine-green uppercase tracking-widest font-display">No Consignment Linked</h4>
              <p className="text-[10px] text-pine-green/50 uppercase tracking-wider max-w-xs mx-auto leading-relaxed">
                No active invoice matches this tracking reference. Check the spelling or try placing a new order.
              </p>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

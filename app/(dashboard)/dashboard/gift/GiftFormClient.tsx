'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Phone, Mail, User, ShieldCheck, Truck, Package, Clock, Calendar, Check,
  AlertCircle, ChevronRight, ExternalLink, HelpCircle
} from 'lucide-react'
import { INDIA_STATES } from '@/lib/indiaLocations'
import { submitGiftAction } from '@/actions/gift'
import { formatDate } from '@/utils/formatters'

interface GiftFormClientProps {
  gift: {
    fullName: string
    age: number
    mobile: string
    email: string
    houseNo: string
    area: string
    state: string
    district: string
    city: string
    pinCode: string
    trackingNumber: string
    courierName: string
    dispatchDate: string | null
    expectedDeliveryDate: string | null
    deliveryStatus: 'PENDING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
    updatedAt: string
  } | null
}

export function GiftFormClient({ gift: initialGift }: GiftFormClientProps) {
  const [gift, setGift] = useState(initialGift)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form Fields
  const [formData, setFormData] = useState({
    fullName: gift?.fullName || '',
    age: gift?.age || '',
    mobile: gift?.mobile || '',
    email: gift?.email || '',
    houseNo: gift?.houseNo || '',
    area: gift?.area || '',
    state: gift?.state || '',
    district: gift?.district || '',
    city: gift?.city || '',
    pinCode: gift?.pinCode || '',
  })

  // Dropdown lists
  const [districts, setDistricts] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])

  // On mount, if state is pre-populated, load districts and cities
  useState(() => {
    if (gift) {
      const stateObj = INDIA_STATES.find(s => s.name === gift.state)
      if (stateObj) {
        setDistricts(stateObj.districts)
        const distObj = stateObj.districts.find(d => d.name === gift.district)
        if (distObj) {
          setCities(distObj.cities)
        }
      }
    }
  })

  // --- HANDLERS ---
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateName = e.target.value
    setFormData(prev => ({
      ...prev,
      state: stateName,
      district: '',
      city: '',
      pinCode: ''
    }))
    setCities([])

    const stateObj = INDIA_STATES.find(s => s.name === stateName)
    if (stateObj) {
      setDistricts(stateObj.districts)
    } else {
      setDistricts([])
    }
  }

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtName = e.target.value
    setFormData(prev => ({
      ...prev,
      district: districtName,
      city: '',
      pinCode: ''
    }))

    const stateObj = INDIA_STATES.find(s => s.name === formData.state)
    const distObj = stateObj?.districts.find(d => d.name === districtName)
    if (distObj) {
      setCities(distObj.cities)
    } else {
      setCities([])
    }
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value
    
    const stateObj = INDIA_STATES.find(s => s.name === formData.state)
    const distObj = stateObj?.districts.find(d => d.name === formData.district)
    const cityObj = distObj?.cities.find(c => c.name === cityName)

    setFormData(prev => ({
      ...prev,
      city: cityName,
      pinCode: cityObj?.pinCode || ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    const payload = {
      ...formData,
      age: Number(formData.age)
    }

    const res = await submitGiftAction(payload)
    if (res.success) {
      setSuccess(res.message)
      // Query again or set local gift state to show tracking
      setGift({
        ...payload,
        trackingNumber: gift?.trackingNumber || '',
        courierName: gift?.courierName || '',
        dispatchDate: gift?.dispatchDate || null,
        expectedDeliveryDate: gift?.expectedDeliveryDate || null,
        deliveryStatus: gift?.deliveryStatus || 'PENDING',
        updatedAt: new Date().toISOString()
      })
    } else {
      setError(res.message)
    }
    setLoading(false)
  }

  // --- RENDER TRACKER UI (IF ALREADY SUBMITTED) ---
  if (gift) {
    const statusMap = {
      PENDING: { label: 'Pending Dispatch', step: 1, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
      SHIPPED: { label: 'Shipped', step: 2, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
      OUT_FOR_DELIVERY: { label: 'Out for Delivery', step: 3, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
      DELIVERED: { label: 'Delivered', step: 4, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
    }

    const currentStatus = statusMap[gift.deliveryStatus] || statusMap.PENDING

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Step Tracker Card */}
        <div className="lg:col-span-2 premium-card p-6 md:p-8 space-y-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div className="space-y-1">
              <h2 className="text-lg font-extrabold text-white">Gift Delivery Status</h2>
              <p className="text-xs text-muted-foreground">Order Ref: GIFT-{gift.updatedAt.slice(0, 10).replace(/-/g, '')}</p>
            </div>
            <span className={`text-xs uppercase font-extrabold px-3 py-1.5 rounded-full border ${currentStatus.color} self-start sm:self-center`}>
              {currentStatus.label}
            </span>
          </div>

          {/* Graphical Stepper */}
          <div className="relative flex justify-between items-start max-w-lg mx-auto py-4">
            {/* Background Line */}
            <div className="absolute left-6 right-6 top-[22px] h-[3px] bg-white/10 z-0 rounded-full" />
            {/* Progress Line */}
            <div 
              className="absolute left-6 top-[22px] h-[3px] bg-gradient-to-r from-emerald-500 to-emerald-400 z-0 rounded-full transition-all duration-500" 
              style={{ width: `${((currentStatus.step - 1) / 3) * 100}%` }}
            />

            {[
              { label: 'Verified', status: 'PENDING', desc: 'Address Received', icon: ShieldCheck },
              { label: 'Dispatched', status: 'SHIPPED', desc: 'In Courier Transit', icon: Truck },
              { label: 'Out for Delivery', status: 'OUT_FOR_DELIVERY', desc: 'Arrived at City Hub', icon: Package },
              { label: 'Delivered', status: 'DELIVERED', desc: 'Successfully Received', icon: CheckCircle2 }
            ].map((step, idx) => {
              const Icon = step.icon as any
              const isCompleted = currentStatus.step > idx
              const isActive = currentStatus.step === idx + 1

              return (
                <div key={idx} className="flex flex-col items-center text-center relative z-10 space-y-2.5 max-w-[80px]">
                  <div 
                    className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                        : isActive 
                        ? 'bg-indigo-950 border-emerald-400 text-emerald-400 animate-pulse'
                        : 'bg-slate-900 border-white/10 text-white/40'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <span className={`text-[10px] font-black uppercase tracking-wider block ${isActive ? 'text-emerald-400' : 'text-white/70'}`}>
                      {step.label}
                    </span>
                    <span className="text-[9px] text-muted-foreground block leading-tight">
                      {step.desc}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Dispatch details (Courier Info) */}
          {gift.deliveryStatus !== 'PENDING' ? (
            <div className="rounded-2xl bg-white/5 border border-white/5 p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3.5">
                <h3 className="text-xs font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
                  <Truck className="w-4 h-4" /> Courier & Shipping Details
                </h3>
                
                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Courier Partner</span>
                    <span className="text-white font-extrabold">{gift.courierName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Tracking Number</span>
                    <span className="text-white font-mono font-bold select-all tracking-wider">{gift.trackingNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Dispatch Date</span>
                    <span className="text-white">{gift.dispatchDate ? formatDate(gift.dispatchDate) : '—'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Estimated Arrival</span>
                    <span className="text-emerald-300 font-extrabold">{gift.expectedDeliveryDate ? formatDate(gift.expectedDeliveryDate) : '—'}</span>
                  </div>
                </div>
              </div>

              {/* Action Button Mock */}
              <div className="flex flex-col justify-center items-start border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-6 space-y-3">
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  You can track your package directly on the partner website by pasting the tracking code.
                </p>
                <a 
                  href="#" 
                  className="py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md group/link"
                  onClick={(e) => { e.preventDefault(); alert("Tracking is simulated. In a live system, this redirects to " + gift.courierName + " track page.") }}
                >
                  <span>Courier Tracking Panel</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
                </a>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/5 border border-white/5 p-6 flex flex-col md:flex-row items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-xs text-white uppercase tracking-widest">Preparing Package</h3>
                <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
                  Your address details have been successfully received and validated! Our logistics crew is currently packaging your Welcome Kit. Dispatch details and expected dates will appear here immediately once handed over to our courier partner.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Address summary column */}
        <div className="premium-card p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-white border-b border-white/5 pb-2 flex items-center gap-2">
              <MapPin className="w-4.5 h-4.5 text-indigo-400" /> Destination Address
            </h3>

            <div className="space-y-3 text-xs font-semibold text-white/70">
              <div className="flex gap-2">
                <User className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-muted-foreground leading-tight">Addressee</span>
                  <span className="text-white font-bold">{gift.fullName} ({gift.age} Years)</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-muted-foreground leading-tight">Mobile Contact</span>
                  <span className="text-white select-all">{gift.mobile}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-muted-foreground leading-tight">Email</span>
                  <span className="text-white select-all">{gift.email}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-white/5">
                <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <span className="block text-[9px] uppercase tracking-wider text-muted-foreground leading-tight">Shipping Location</span>
                  <span className="text-white leading-relaxed block font-bold">
                    {gift.houseNo}, {gift.area}<br />
                    {gift.city}, {gift.district}<br />
                    {gift.state} - <span className="font-mono text-indigo-300 font-black">{gift.pinCode}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center py-4 border-t border-white/5">
            <span className="text-[10px] text-muted-foreground font-semibold flex items-center justify-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" /> Need to modify? Contact VIP Support.
            </span>
          </div>
        </div>
      </div>
    )
  }

  // --- RENDER FORM UI (IF NOT SUBMITTED YET) ---
  return (
    <div className="max-w-3xl mx-auto premium-card p-6 md:p-8 space-y-6">
      <div className="border-b border-white/5 pb-4">
        <h2 className="text-lg font-black text-white">Shipping Address Registration</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Please provide accurate Indian postal shipping details to avoid courier dispatch rejection.</p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
          <Check className="w-5 h-5 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Contact details row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-white/70 font-semibold block mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.fullName}
              onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="Arjun Kumar" 
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-white/70 font-semibold block mb-1">Age</label>
            <input 
              type="number" 
              required
              min={18}
              max={120}
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
              placeholder="25" 
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/70 font-semibold block mb-1">Mobile Number</label>
            <input 
              type="tel" 
              required
              value={formData.mobile}
              onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
              placeholder="9876543210" 
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="text-xs text-white/70 font-semibold block mb-1">Email Address</label>
            <input 
              type="email" 
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="arjun@example.com" 
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Address line row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-white/5 pt-4">
          <div>
            <label className="text-xs text-white/70 font-semibold block mb-1">House/Flat Number</label>
            <input 
              type="text" 
              required
              value={formData.houseNo}
              onChange={(e) => setFormData(prev => ({ ...prev, houseNo: e.target.value }))}
              placeholder="Flat 304, Block C" 
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs text-white/70 font-semibold block mb-1">Area / Street / Locality</label>
            <input 
              type="text" 
              required
              value={formData.area}
              onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
              placeholder="Golden Galaxy Apartments, Hinjawadi" 
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Dynamic Location Cascading Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/70 font-semibold block mb-1">State / Union Territory</label>
            <select
              required
              value={formData.state}
              onChange={handleStateChange}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white/80 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            >
              <option value="">Select State</option>
              {INDIA_STATES.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-xs text-white/70 font-semibold block mb-1">District</label>
            <select
              required
              disabled={!formData.state}
              value={formData.district}
              onChange={handleDistrictChange}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white/80 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-white/70 font-semibold block mb-1">City / Region</label>
            <select
              required
              disabled={!formData.district}
              value={formData.city}
              onChange={handleCityChange}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white/80 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-white/70 font-semibold block mb-1">PIN Code (Auto Fill)</label>
            <input 
              type="text" 
              required
              readOnly
              value={formData.pinCode}
              placeholder="Auto-populated" 
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/15 text-indigo-300 placeholder:text-white/20 text-xs font-mono font-black select-all tracking-widest focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Submitting Details...' : 'Submit Shipping Details'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  )
}

// Simple fallback icon mapping for Stepper icons
function CheckCircle2({ className }: { className?: string }) {
  return (
    <div className={`w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white ${className}`}>
      <Check className="w-3.5 h-3.5" />
    </div>
  )
}

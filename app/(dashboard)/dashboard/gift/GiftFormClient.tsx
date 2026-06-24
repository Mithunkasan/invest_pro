'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Phone, Mail, User, ShieldCheck, Truck, Package, Clock, Calendar, Check,
  AlertCircle, ChevronRight, ExternalLink, HelpCircle
} from 'lucide-react'
import { getStatesAction, getDistrictsAction, getCitiesAction } from '@/actions/locations'
import { submitGiftAction } from '@/actions/gift'
import { submitGiftDepositAction } from '@/actions/giftDeposit'
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
    deliveryStatus: 'PENDING' | 'ACCEPTED' | 'POSTED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED'
    acceptedAt: string | null
    remarks: string
    createdAt: string
    updatedAt: string
  } | null
  giftCount: number
  depositWalletBalance: number
  subsequentGiftAmount: number
  requiredGiftDepositAmount: number
  giftDeposit: {
    id: string
    amount: number
    proofUrl: string | null
    utrNumber: string | null
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    remarks: string | null
    createdAt: string
  } | null
}

export function GiftFormClient({ gift: initialGift, giftCount, depositWalletBalance, subsequentGiftAmount, requiredGiftDepositAmount, giftDeposit: initialGiftDeposit }: GiftFormClientProps) {
  const [gift, setGift] = useState(initialGift)
  const [giftDeposit, setGiftDeposit] = useState(initialGiftDeposit)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Gift Deposit Step state
  const [depositLoading, setDepositLoading] = useState(false)
  const [depositError, setDepositError] = useState('')
  const [depositSuccess, setDepositSuccess] = useState('')
  const [depositAmount] = useState(requiredGiftDepositAmount.toString())
  const [depositUtr, setDepositUtr] = useState('')
  const [depositProofUrl, setDepositProofUrl] = useState('')

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

  // Synchronize local state with prop updates (to reflect admin status updates in real-time)
  useEffect(() => {
    setGift(initialGift)
    if (initialGift) {
      setFormData({
        fullName: initialGift.fullName || '',
        age: initialGift.age || '',
        mobile: initialGift.mobile || '',
        email: initialGift.email || '',
        houseNo: initialGift.houseNo || '',
        area: initialGift.area || '',
        state: initialGift.state || '',
        district: initialGift.district || '',
        city: initialGift.city || '',
        pinCode: initialGift.pinCode || '',
      })
    }
  }, [initialGift])

  // Dropdown lists and loading states
  const [states, setStates] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [cities, setCities] = useState<{ name: string; pinCode: string }[]>([])
  
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingDistricts, setLoadingDistricts] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)

  // Fetch all states on mount
  useEffect(() => {
    async function loadStates() {
      setLoadingStates(true)
      const res = await getStatesAction()
      if (res.success) {
        setStates(res.states)
      }
      setLoadingStates(false)
    }
    loadStates()
  }, [])

  // On mount, if state is pre-populated, load districts and cities
  useEffect(() => {
    async function loadPrePopulated() {
      if (gift?.state) {
        setLoadingDistricts(true)
        const resDist = await getDistrictsAction(gift.state)
        if (resDist.success) {
          setDistricts(resDist.districts)
        }
        setLoadingDistricts(false)

        if (gift?.district) {
          setLoadingCities(true)
          const resCity = await getCitiesAction(gift.state, gift.district)
          if (resCity.success) {
            setCities(resCity.cities)
          }
          setLoadingCities(false)
        }
      }
    }
    loadPrePopulated()
  }, [gift])

  // --- HANDLERS ---
  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateName = e.target.value
    setFormData(prev => ({
      ...prev,
      state: stateName,
      district: '',
      city: '',
      pinCode: ''
    }))
    setDistricts([])
    setCities([])

    if (stateName) {
      setLoadingDistricts(true)
      const res = await getDistrictsAction(stateName)
      if (res.success) {
        setDistricts(res.districts)
      }
      setLoadingDistricts(false)
    }
  }

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtName = e.target.value
    setFormData(prev => ({
      ...prev,
      district: districtName,
      city: '',
      pinCode: ''
    }))
    setCities([])

    if (districtName && formData.state) {
      setLoadingCities(true)
      const res = await getCitiesAction(formData.state, districtName)
      if (res.success) {
        setCities(res.cities)
      }
      setLoadingCities(false)
    }
  }

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value
    const cityObj = cities.find(c => c.name === cityName)

    setFormData(prev => ({
      ...prev,
      city: cityName,
      pinCode: cityObj?.pinCode || ''
    }))
  }

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setDepositLoading(true)
    setDepositError('')
    setDepositSuccess('')

    const res = await submitGiftDepositAction({
      amount: Number(depositAmount),
      utrNumber: depositUtr || undefined,
      proofUrl: depositProofUrl || undefined,
    })

    if (res.success) {
      setDepositSuccess(res.message)
      setGiftDeposit({
        id: '',
        amount: Number(depositAmount),
        proofUrl: depositProofUrl || null,
        utrNumber: depositUtr || null,
        status: 'PENDING',
        remarks: null,
        createdAt: new Date().toISOString()
      })
    } else {
      setDepositError(res.message)
    }
    setDepositLoading(false)
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
      setShowForm(false)
      // Query again or set local gift state to show tracking
      setGift({
        ...payload,
        trackingNumber: '',
        courierName: '',
        dispatchDate: null,
        expectedDeliveryDate: null,
        deliveryStatus: 'PENDING',
        acceptedAt: null,
        remarks: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
    } else {
      setError(res.message)
    }
    setLoading(false)
  }

  // --- RENDER TRACKER UI (IF ALREADY SUBMITTED & NOT REQUESTING NEXT) ---
  if (gift && (!showForm || gift.deliveryStatus !== 'DELIVERED')) {
    const statusMap = {
      PENDING: { label: 'Pending Verification', step: 1, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
      ACCEPTED: { label: 'Request Accepted', step: 2, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
      POSTED: { label: 'Posted', step: 3, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
      IN_TRANSIT: { label: 'In Transit', step: 4, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
      OUT_FOR_DELIVERY: { label: 'Out for Delivery', step: 5, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
      DELIVERED: { label: 'Delivered', step: 6, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
    }

    const currentStatus = statusMap[gift.deliveryStatus] || statusMap.PENDING

    const timelineSteps = [
      {
        label: 'Gift Request Submitted',
        isCompleted: true,
        isActive: gift.deliveryStatus === 'PENDING',
        date: gift.createdAt,
        desc: 'Your request has been received.'
      },
      {
        label: 'Request Accepted by Admin',
        isCompleted: ['ACCEPTED', 'POSTED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(gift.deliveryStatus),
        isActive: gift.deliveryStatus === 'ACCEPTED',
        date: gift.acceptedAt,
        desc: 'Verified by our administration.'
      },
      {
        label: 'Package Posted',
        isCompleted: ['POSTED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(gift.deliveryStatus),
        isActive: gift.deliveryStatus === 'POSTED',
        date: gift.dispatchDate,
        desc: 'Handed over to courier partner.'
      },
      {
        label: 'In Transit',
        isCompleted: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(gift.deliveryStatus),
        isActive: gift.deliveryStatus === 'IN_TRANSIT',
        date: null,
        desc: 'Package is moving between hubs.'
      },
      {
        label: 'Out for Delivery',
        isCompleted: ['OUT_FOR_DELIVERY', 'DELIVERED'].includes(gift.deliveryStatus),
        isActive: gift.deliveryStatus === 'OUT_FOR_DELIVERY',
        date: null,
        desc: 'Courier agent is delivering today.'
      },
      {
        label: 'Delivered',
        isCompleted: gift.deliveryStatus === 'DELIVERED',
        isActive: gift.deliveryStatus === 'DELIVERED',
        date: gift.deliveryStatus === 'DELIVERED' ? gift.expectedDeliveryDate : null,
        desc: 'Successfully received!'
      }
    ]

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

          {/* Tracking Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 rounded-2xl bg-white/5 border border-white/5 p-5 md:p-6 text-xs font-semibold">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Gift Request Date</span>
              <span className="text-white font-extrabold">{formatDate(gift.createdAt)}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Request Accepted Date</span>
              <span className="text-white font-extrabold">{gift.acceptedAt ? formatDate(gift.acceptedAt) : '—'}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Current Status</span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${currentStatus.color} inline-block mt-0.5`}>
                {gift.deliveryStatus.replace(/_/g, ' ')}
              </span>
            </div>
            {gift.courierName && (
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Courier Company</span>
                <span className="text-white font-extrabold">{gift.courierName}</span>
              </div>
            )}
            {gift.trackingNumber && (
              <div>
                <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-0.5">Tracking Number</span>
                <span className="text-white font-mono font-bold select-all tracking-wider">{gift.trackingNumber}</span>
              </div>
            )}
          </div>

          {/* Status History Timeline */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-widest border-b border-white/5 pb-2">
              Status History Timeline
            </h3>
            <div className="relative pl-8 space-y-6">
              {/* Vertical line connecting steps */}
              <div className="absolute left-[13px] top-2 bottom-2 w-[2px] bg-white/10 z-0" />

              {timelineSteps.map((step, idx) => {
                const isStepCompleted = step.isCompleted
                const isStepActive = step.isActive

                return (
                  <div key={idx} className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 z-10">
                    {/* Circle icon */}
                    <div 
                      className={`absolute -left-8 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                        isStepCompleted 
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                          : isStepActive 
                          ? 'bg-indigo-950 border-emerald-400 text-emerald-400 animate-pulse'
                          : 'bg-slate-900 border-white/10 text-white/20'
                      }`}
                    >
                      {isStepCompleted ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <div className={`w-1.5 h-1.5 rounded-full ${isStepActive ? 'bg-emerald-400' : 'bg-white/20'}`} />
                      )}
                    </div>
                    
                    {/* Step Content */}
                    <div className="space-y-0.5">
                      <span className={`text-xs font-black uppercase tracking-wider block ${isStepActive ? 'text-emerald-400' : isStepCompleted ? 'text-white' : 'text-white/40'}`}>
                        {step.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground block leading-tight">
                        {step.desc}
                      </span>
                    </div>

                    {/* Step Date */}
                    {step.date && (
                      <span className="text-[10px] text-muted-foreground font-mono bg-white/5 border border-white/5 px-2 py-1 rounded-md self-start sm:self-center font-bold">
                        {formatDate(step.date)}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Remarks display if any */}
          {gift.remarks && (
            <div className="rounded-2xl bg-white/5 border border-white/5 p-4 text-xs mt-6">
              <span className="text-muted-foreground block text-[10px] uppercase tracking-wider mb-1">Latest Update / Remarks</span>
              <p className="text-white font-medium">{gift.remarks}</p>
            </div>
          )}

          {gift.deliveryStatus === 'DELIVERED' && (
            <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/10 p-5 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="space-y-1 text-left">
                <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                  <span>Apply for Your Next Gift!</span> 🎁
                </h4>
                <p className="text-xs text-muted-foreground max-w-md">
                  Your welcome kit has been delivered successfully. Your next request costs ₹{subsequentGiftAmount.toLocaleString('en-IN')} from your Deposit Wallet.
                </p>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-md shrink-0 cursor-pointer"
              >
                <span>Request Next Gift</span>
                <ChevronRight className="w-4 h-4" />
              </button>
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

  // --- RENDER GIFT DEPOSIT STEP (Step 1, if required and not yet approved) ---
  if (requiredGiftDepositAmount > 0 && (!giftDeposit || giftDeposit.status === 'REJECTED')) {
    return (
      <div className="max-w-2xl mx-auto premium-card p-6 md:p-8 space-y-6">
        {/* Step indicator */}
        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">1</div>
          <div>
            <h2 className="text-lg font-black text-white">Gift Deposit</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Complete this deposit step first to unlock the shipping address form.</p>
          </div>
        </div>

        {/* Deposit amount info */}
        <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-5 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <span className="text-white font-extrabold text-sm">Required Deposit Amount</span>
          </div>
          <p className="text-3xl font-black text-indigo-300">₹{requiredGiftDepositAmount.toLocaleString('en-IN')}</p>
          <p className="text-xs text-white/60 leading-relaxed">
            Please deposit the above amount via UPI or Bank Transfer to our official account and submit the payment proof below.
            Once verified by our admin, you will be able to proceed to Step 2 (Shipping Address).
          </p>
        </div>

        {giftDeposit?.status === 'REJECTED' && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="block text-white font-extrabold">Previous Deposit Rejected</span>
              {giftDeposit.remarks && <span className="block text-white/70 mt-1">Reason: {giftDeposit.remarks}</span>}
              <span className="block text-white/60 mt-1">Please submit a new deposit request.</span>
            </div>
          </div>
        )}

        {depositError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{depositError}</span>
          </div>
        )}

        {depositSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2">
            <Check className="w-5 h-5 shrink-0" />
            <span>{depositSuccess}</span>
          </div>
        )}

        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs text-white/70 font-semibold block">Deposit Amount (₹)</label>
            <input
              type="number"
              readOnly
              value={depositAmount}
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-indigo-300 placeholder:text-white/20 text-xs font-mono font-black focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/70 font-semibold block">UTR / Transaction Reference Number <span className="text-white/40 font-normal">(optional)</span></label>
            <input
              type="text"
              value={depositUtr}
              onChange={(e) => setDepositUtr(e.target.value)}
              placeholder="e.g. 123456789012"
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-white/70 font-semibold block">Payment Screenshot URL <span className="text-white/40 font-normal">(optional)</span></label>
            <input
              type="url"
              value={depositProofUrl}
              onChange={(e) => setDepositProofUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={depositLoading}
              className="py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-500/20 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {depositLoading ? 'Submitting...' : `Submit Gift Deposit of ₹${requiredGiftDepositAmount.toLocaleString('en-IN')}`}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    )
  }

  // If deposit required but pending approval, show waiting state
  if (requiredGiftDepositAmount > 0 && giftDeposit?.status === 'PENDING') {
    return (
      <div className="max-w-2xl mx-auto premium-card p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4 border-b border-white/5 pb-4">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black text-sm shrink-0 animate-pulse">1</div>
          <div>
            <h2 className="text-lg font-black text-white">Gift Deposit — Pending Approval</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Your deposit is under review. Step 2 will unlock once approved.</p>
          </div>
        </div>

        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-white font-extrabold text-sm">Awaiting Admin Verification</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-white/40 block text-[10px] uppercase tracking-wider">Amount Submitted</span>
              <span className="text-amber-300 font-black text-base">₹{giftDeposit.amount.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-white/40 block text-[10px] uppercase tracking-wider">Submitted On</span>
              <span className="text-white font-bold">{formatDate(giftDeposit.createdAt)}</span>
            </div>
            {giftDeposit.utrNumber && (
              <div>
                <span className="text-white/40 block text-[10px] uppercase tracking-wider">UTR Reference</span>
                <span className="text-white font-mono font-bold">{giftDeposit.utrNumber}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-white/50 leading-relaxed pt-2 border-t border-white/5">
            Our admin team will verify your payment and approve it shortly. You will receive a notification once approved.
          </p>
        </div>

        {/* Step 2 locked indicator */}
        <div className="rounded-2xl bg-white/3 border border-white/5 p-5 flex items-center gap-4 opacity-50">
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white/40 font-black text-sm shrink-0">2</div>
          <div>
            <span className="text-white/50 font-extrabold text-sm block">Shipping Address</span>
            <span className="text-white/30 text-xs">Unlocks after your gift deposit is approved</span>
          </div>
        </div>
      </div>
    )
  }

  // --- RENDER FORM UI (IF NOT SUBMITTED YET OR PREVIOUS DELIVERED) ---
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Step 2 indicator when deposit was required and approved */}
      {requiredGiftDepositAmount > 0 && giftDeposit?.status === 'APPROVED' && (
        <div className="premium-card p-4 flex items-center gap-3 border-emerald-500/20 bg-emerald-500/5">
          <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check className="w-4 h-4 stroke-[3]" />
          </div>
          <div>
            <span className="text-white font-extrabold text-sm block">Step 1 Complete — Gift Deposit Approved ✅</span>
            <span className="text-white/50 text-xs">₹{giftDeposit.amount.toLocaleString('en-IN')} deposit approved. Now complete Step 2 below.</span>
          </div>
        </div>
      )}

    <div className="premium-card p-6 md:p-8 space-y-6">
      <div className="border-b border-white/5 pb-4">
        {requiredGiftDepositAmount > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-xs shrink-0">2</div>
            <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Step 2</span>
          </div>
        )}
        <h2 className="text-lg font-black text-white">Shipping Address Registration</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Please provide accurate Indian postal shipping details to avoid courier dispatch rejection.</p>
      </div>

      {gift && gift.deliveryStatus === 'DELIVERED' && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">🎉</span>
            <span className="font-extrabold text-white">Your previous gift has been delivered!</span>
          </div>
          <p className="text-white/70 leading-relaxed">
            You are eligible to apply for your next welcome gift. This request requires <strong className="text-emerald-300 font-extrabold">₹{subsequentGiftAmount.toLocaleString('en-IN')}</strong>, deducted from your Deposit Wallet upon submission.
          </p>
          <div className="text-[10px] text-white/50">
            Deposit Wallet Balance: <strong className={depositWalletBalance >= subsequentGiftAmount ? "text-emerald-400 font-extrabold" : "text-rose-400 font-extrabold"}>₹{depositWalletBalance.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      )}

      {giftCount >= 1 && depositWalletBalance < subsequentGiftAmount && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="block text-white font-extrabold">Insufficient Wallet Balance</span>
            <span className="block text-white/70 font-medium leading-relaxed">
              You need at least ₹{subsequentGiftAmount.toLocaleString('en-IN')} in your Deposit Wallet to submit this gift request. Your current Deposit Wallet balance is ₹{depositWalletBalance.toLocaleString('en-IN')}.
            </span>
          </div>
        </div>
      )}

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
            <label className="text-xs text-white/70 font-semibold block mb-1">
              State / Union Territory {loadingStates && '(Loading...)'}
            </label>
            <select
              required
              value={formData.state}
              onChange={handleStateChange}
              disabled={loadingStates}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white/80 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-xs text-white/70 font-semibold block mb-1">
              District {loadingDistricts && '(Loading...)'}
            </label>
            <select
              required
              disabled={!formData.state || loadingDistricts}
              value={formData.district}
              onChange={handleDistrictChange}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white/80 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="text-xs text-white/70 font-semibold block mb-1">
              City / Region {loadingCities && '(Loading...)'}
            </label>
            <select
              required
              disabled={!formData.district || loadingCities}
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
            disabled={loading || (giftCount >= 1 && depositWalletBalance < subsequentGiftAmount)}
            className="py-3 px-6 rounded-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 transition-all text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting Details...' : (giftCount === 0 ? 'Submit Shipping Details' : `Pay ₹${subsequentGiftAmount.toLocaleString('en-IN')} & Submit Gift Request`)}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
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

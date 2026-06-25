'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Eye, Truck, Package, CheckCircle, Clock, X,
  Phone, Mail, User, MapPin, ChevronRight, AlertCircle, DollarSign
} from 'lucide-react'
import { updateGiftTrackingAction, acceptGiftAction } from '@/actions/adminGift'
import { approveGiftDepositAction, rejectGiftDepositAction } from '@/actions/adminGiftDeposit'
import { formatDateTime } from '@/utils/formatters'
import { ModalPortal } from '@/components/common/ModalPortal'

// ── Types ──────────────────────────────────────────────────────────────────────

interface GiftAdminItem {
  id: string
  userId: string
  fullName: string
  age: number
  mobile: string
  email: string
  houseNo: string
  area: string
  city: string
  district: string
  state: string
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
  user: {
    name: string
    email: string
    phone: string | null
  }
}

interface GiftsAdminClientProps {
  gifts: GiftAdminItem[]
  giftDeposits: GiftDepositAdminItem[]
}

interface GiftDepositAdminItem {
  id: string
  userId: string
  amount: number
  proofUrl: string | null
  utrNumber: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  remarks: string | null
  createdAt: string
  updatedAt: string
  user: {
    name: string
    email: string
    phone: string | null
  }
}

// ── ShipmentDrawer ─────────────────────────────────────────────────────────────
//
// IMPORTANT: This is intentionally a *separate* component (not inlined inside
// GiftsAdminClient). React will never unmount/remount this component when the
// parent re-renders due to search or filter state changes, because the component
// identity is stable. This is the fix for the "form closes while typing" bug.
//
// Root causes that were fixed:
// 1. The drawer was inlined in the parent → every setSearchQuery / setStatusFilter
//    call re-rendered the parent, which caused AnimatePresence to re-evaluate its
//    children. With the old AnimatePresence + fragment approach, this caused
//    incorrect exit/enter cycles that closed the form.
// 2. AnimatePresence requires motion elements as *direct* children (not wrapped
//    in a fragment <>) to track them by key. The fragment wrapper broke this.
// 3. The backdrop onClick was not guarded, so events leaking from the drawer
//    panel could trigger it.

interface ShipmentDrawerProps {
  gift: GiftAdminItem | null
  onClose: () => void
  onUpdated: (id: string, patch: Partial<GiftAdminItem>) => void
}

function ShipmentDrawer({ gift, onClose, onUpdated }: ShipmentDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [trackingForm, setTrackingForm] = useState({
    trackingNumber: '',
    courierName: '',
    dispatchDate: '',
    expectedDeliveryDate: '',
    deliveryStatus: 'PENDING' as GiftAdminItem['deliveryStatus'],
    remarks: '',
  })

  // Reset form fields when a DIFFERENT gift is selected.
  // Dep array uses gift?.id so typing inside inputs does NOT reset the form.
  useEffect(() => {
    if (!gift) return
    setSuccessMsg('')
    setErrorMsg('')
    setTrackingForm({
      trackingNumber: gift.trackingNumber || '',
      courierName: gift.courierName || '',
      dispatchDate: gift.dispatchDate ? gift.dispatchDate.split('T')[0] : '',
      expectedDeliveryDate: gift.expectedDeliveryDate
        ? gift.expectedDeliveryDate.split('T')[0]
        : '',
      deliveryStatus: gift.deliveryStatus,
      remarks: gift.remarks || '',
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gift?.id])

  // Escape key closes the drawer
  useEffect(() => {
    if (!gift) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [gift, onClose])

  // Prevent body scroll while drawer is open
  useEffect(() => {
    if (gift) {
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [!!gift]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!gift) return
    setLoading(true)
    setSuccessMsg('')
    setErrorMsg('')

    const res = await updateGiftTrackingAction(gift.id, trackingForm)
    if (res.success) {
      const now = new Date().toISOString()
      setSuccessMsg(res.message)
      onUpdated(gift.id, {
        ...trackingForm,
        updatedAt: now,
        dispatchDate: trackingForm.dispatchDate
          ? new Date(trackingForm.dispatchDate).toISOString()
          : null,
        expectedDeliveryDate: trackingForm.expectedDeliveryDate
          ? new Date(trackingForm.expectedDeliveryDate).toISOString()
          : null,
      })
    } else {
      setErrorMsg(res.message)
    }
    setLoading(false)
  }

  return (
    <ModalPortal>
      {/*
        Two *separate* AnimatePresence blocks — each has its motion element as a
        direct child (not inside a fragment). This satisfies framer-motion's
        key-tracking requirement and gives both elements clean enter/exit
        animations independently.
      */}

      {/* Backdrop */}
      <AnimatePresence>
        {gift && (
          <motion.div
            key="shipment-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/75"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Centered Modal panel */}
      <AnimatePresence>
        {gift && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="shipment-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-slate-950 border border-white/10 rounded-3xl text-white/90 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden pointer-events-auto"
              /* Block ALL pointer events from reaching the backdrop */
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSubmit} className="flex flex-col h-full w-full overflow-hidden">

              {/* Header */}
              <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
                <div>
                  <h3 className="font-extrabold text-sm text-white">Gift Shipment Console</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    UID: {gift.userId.slice(0, 12)}...
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">

                {/* Address Summary */}
                <div className="space-y-4 rounded-2xl bg-white/5 border border-white/5 p-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 pb-2 border-b border-white/5">
                    <MapPin className="w-4 h-4" /> Shipping Address Summary
                  </h4>
                  <div className="space-y-3.5 text-xs font-semibold text-white/70">
                    <div className="flex gap-2">
                      <User className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground leading-tight">
                          Member Addressee
                        </span>
                        <span className="text-white font-bold">
                          {gift.fullName} ({gift.age} Years)
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground leading-tight">
                          Mobile Phone
                        </span>
                        <span className="text-white select-all font-mono">{gift.mobile}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground leading-tight">
                          Email
                        </span>
                        <span className="text-white select-all">{gift.email}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <span className="block text-[9px] uppercase tracking-wider text-muted-foreground leading-tight">
                          Courier Destination
                        </span>
                        <span className="text-white leading-relaxed block font-bold">
                          {gift.houseNo}, {gift.area}<br />
                          {gift.city}, {gift.district}<br />
                          {gift.state} -{' '}
                          <span className="font-mono text-indigo-300 font-black">{gift.pinCode}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tracking Form Fields */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 border-b border-white/5 pb-2">
                    <Truck className="w-4 h-4" /> Dispatch Tracking Console
                  </h4>

                  {errorMsg && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">
                      {errorMsg}
                    </div>
                  )}
                  {successMsg && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                      {successMsg}
                    </div>
                  )}

                  <div className="space-y-3.5">
                    <div>
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">
                        Transit Status
                      </label>
                      <select
                        value={trackingForm.deliveryStatus}
                        onChange={(e) =>
                          setTrackingForm((prev) => ({
                            ...prev,
                            deliveryStatus: e.target.value as GiftAdminItem['deliveryStatus'],
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white/80 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="ACCEPTED">Accepted / Preparing</option>
                        <option value="POSTED">Posted</option>
                        <option value="IN_TRANSIT">In Transit</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">
                        Courier Partner Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DTDC Express, Blue Dart, Delhivery"
                        value={trackingForm.courierName}
                        onChange={(e) =>
                          setTrackingForm((prev) => ({ ...prev, courierName: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">
                        Courier Tracking ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. DX98273615IN"
                        value={trackingForm.trackingNumber}
                        onChange={(e) =>
                          setTrackingForm((prev) => ({ ...prev, trackingNumber: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary font-mono tracking-wider"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">
                          Dispatch Date
                        </label>
                        <input
                          type="date"
                          value={trackingForm.dispatchDate}
                          onChange={(e) =>
                            setTrackingForm((prev) => ({ ...prev, dispatchDate: e.target.value }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">
                          Expected Delivery
                        </label>
                        <input
                          type="date"
                          value={trackingForm.expectedDeliveryDate}
                          onChange={(e) =>
                            setTrackingForm((prev) => ({
                              ...prev,
                              expectedDeliveryDate: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">
                        Remarks (Optional)
                      </label>
                      <textarea
                        placeholder="e.g. Package is ready for pickup, delay due to bad weather"
                        value={trackingForm.remarks}
                        onChange={(e) =>
                          setTrackingForm((prev) => ({ ...prev, remarks: e.target.value }))
                        }
                        rows={3}
                        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed Footer */}
              <div className="px-6 py-4 border-t border-white/5 bg-slate-950/80 backdrop-blur-md shrink-0 flex justify-end gap-3 w-full">
                <button
                  type="button"
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-xl font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="py-2.5 px-5 rounded-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Update Details'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </ModalPortal>
  )
}

// ── GiftsAdminClient ───────────────────────────────────────────────────────────

export function GiftsAdminClient({ gifts: initialGifts, giftDeposits: initialGiftDeposits }: GiftsAdminClientProps) {
  const [gifts, setGifts] = useState<GiftAdminItem[]>(initialGifts)
  const [giftDeposits, setGiftDeposits] = useState<GiftDepositAdminItem[]>(initialGiftDeposits)
  const [activeTab, setActiveTab] = useState<'gifts' | 'deposits'>('gifts')
  const pendingDepositsCount = giftDeposits.filter(d => d.status === 'PENDING').length
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [depositSearchQuery, setDepositSearchQuery] = useState('')
  const [depositStatusFilter, setDepositStatusFilter] = useState<string>('ALL')
  const [selectedGift, setSelectedGift] = useState<GiftAdminItem | null>(null)
  const [acceptingIds, setAcceptingIds] = useState<Record<string, boolean>>({})
  const [depositActionIds, setDepositActionIds] = useState<Record<string, boolean>>({})
  const getGiftActionTime = (gift: GiftAdminItem) =>
    gift.deliveryStatus === 'PENDING' ? 'Pending' : formatDateTime(gift.acceptedAt || gift.updatedAt)
  const getGiftDepositActionTime = (deposit: GiftDepositAdminItem) =>
    deposit.status === 'PENDING' ? 'Pending' : formatDateTime(deposit.updatedAt)

  // ── Stats ──
  const totalCount = gifts.length
  const pendingCount = gifts.filter((g) => g.deliveryStatus === 'PENDING' || g.deliveryStatus === 'ACCEPTED').length
  const shippedCount = gifts.filter(
    (g) => g.deliveryStatus === 'POSTED' || g.deliveryStatus === 'IN_TRANSIT' || g.deliveryStatus === 'OUT_FOR_DELIVERY'
  ).length
  const deliveredCount = gifts.filter((g) => g.deliveryStatus === 'DELIVERED').length

  // ── Filtering ──
  const filteredGifts = gifts.filter((gift) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      gift.fullName.toLowerCase().includes(q) ||
      gift.email.toLowerCase().includes(q) ||
      gift.mobile.includes(searchQuery) ||
      gift.city.toLowerCase().includes(q)

    const matchesStatus =
      statusFilter === 'ALL' ||
      gift.deliveryStatus === statusFilter ||
      (statusFilter === 'SHIPPED' &&
        (gift.deliveryStatus === 'POSTED' || gift.deliveryStatus === 'IN_TRANSIT' || gift.deliveryStatus === 'OUT_FOR_DELIVERY'))

    return matchesSearch && matchesStatus
  })

  const filteredGiftDeposits = giftDeposits.filter((deposit) => {
    const q = depositSearchQuery.toLowerCase()
    const matchesSearch =
      deposit.user.name.toLowerCase().includes(q) ||
      deposit.user.email.toLowerCase().includes(q) ||
      (deposit.user.phone || '').includes(depositSearchQuery) ||
      String(deposit.amount).includes(depositSearchQuery) ||
      (deposit.utrNumber || '').toLowerCase().includes(q)

    const matchesStatus = depositStatusFilter === 'ALL' || deposit.status === depositStatusFilter

    return matchesSearch && matchesStatus
  })

  const hasActiveDepositFilters = depositSearchQuery || depositStatusFilter !== 'ALL'

  // ── Accept callback ──
  const handleAcceptGift = async (id: string) => {
    setAcceptingIds((prev) => ({ ...prev, [id]: true }))
    try {
      const res = await acceptGiftAction(id)
      if (res.success) {
        const now = new Date().toISOString()
        setGifts((prev) =>
          prev.map((g) => (g.id === id ? { ...g, deliveryStatus: 'ACCEPTED', acceptedAt: now, updatedAt: now } : g))
        )
      } else {
        alert(res.message || 'Failed to accept gift request')
      }
    } catch (error) {
      console.error(error)
      alert('An error occurred while accepting the gift request')
    } finally {
      setAcceptingIds((prev) => ({ ...prev, [id]: false }))
    }
  }

  // ── Deposit callbacks ──
  const handleDepositAction = async (id: string, action: 'approve' | 'reject') => {
    setDepositActionIds((prev) => ({ ...prev, [id]: true }))
    try {
      const res = action === 'approve'
        ? await approveGiftDepositAction(id)
        : await rejectGiftDepositAction(id)
      if (res.success) {
        const now = new Date().toISOString()
        setGiftDeposits((prev) =>
          prev.map((d) => d.id === id ? { ...d, status: action === 'approve' ? 'APPROVED' : 'REJECTED', updatedAt: now } : d)
        )
      } else {
        alert(res.message || `Failed to ${action} deposit`)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setDepositActionIds((prev) => ({ ...prev, [id]: false }))
    }
  }

  // ── Drawer callbacks ──
  const handleGiftUpdated = (id: string, patch: Partial<GiftAdminItem>) => {
    setGifts((prev) => prev.map((g) => (g.id === id ? { ...g, ...patch } : g)))
    // Keep the drawer open with refreshed data so the admin sees the success message
    setSelectedGift((prev) => (prev && prev.id === id ? { ...prev, ...patch } : prev))
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':        return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'ACCEPTED':       return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20'
      case 'POSTED':         return 'text-blue-400 bg-blue-500/10 border-blue-500/20'
      case 'IN_TRANSIT':     return 'text-sky-400 bg-sky-500/10 border-sky-500/20'
      case 'OUT_FOR_DELIVERY': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
      case 'DELIVERED':      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      default:               return 'text-muted-foreground bg-white/5 border-white/10'
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Tab switcher ── */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('gifts')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${activeTab === 'gifts' ? 'bg-gradient-to-r from-primary to-blue-500 text-white shadow-md' : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'}`}
        >
          🎁 Gift Requests
        </button>
        <button
          onClick={() => setActiveTab('deposits')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer relative ${activeTab === 'deposits' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'}`}
        >
          💰 Gift Deposits
          {pendingDepositsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center">{pendingDepositsCount}</span>
          )}
        </button>
      </div>

      {activeTab === 'gifts' && (<>
      {/* ── Stats cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests',     count: totalCount,    icon: Package,      color: 'text-indigo-400 bg-indigo-500/10' },
          { label: 'Pending Dispatches', count: pendingCount,  icon: Clock,        color: 'text-amber-400 bg-amber-500/10' },
          { label: 'In Transit',         count: shippedCount,  icon: Truck,        color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Delivered Kits',     count: deliveredCount, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10' },
        ].map((stat, idx) => (
          <div key={idx} className="premium-card p-4 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{stat.label}</p>
              <p className="text-xl font-black text-white mt-0.5">{stat.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, city..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="flex bg-white/5 p-1 rounded-full border border-white/10 gap-1 self-start md:self-center">
          {[
            { key: 'ALL',       label: 'All Requests' },
            { key: 'PENDING',   label: 'Pending' },
            { key: 'ACCEPTED',  label: 'Accepted' },
            { key: 'SHIPPED',   label: 'Transit' },
            { key: 'DELIVERED', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider rounded-full transition-all cursor-pointer ${
                statusFilter === tab.key
                  ? 'bg-gradient-to-r from-primary to-blue-500 text-white shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="premium-card overflow-hidden">
        {filteredGifts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-xs font-semibold">
            No gift requests match the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-semibold">
              <thead>
                <tr className="border-b border-white/5 text-muted-foreground text-[10px] uppercase tracking-wider bg-white/5">
                  <th className="px-6 py-4">Premium Member</th>
                  <th className="px-6 py-4">State &amp; City</th>
                  <th className="px-6 py-4">Mobile</th>
                  <th className="px-6 py-4">Request Submitted Time</th>
                  <th className="px-6 py-4">Admin Action Time</th>
                  <th className="px-6 py-4">Courier Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredGifts.map((gift) => (
                  <tr
                    key={gift.id}
                    className={`transition-colors ${gift.deliveryStatus !== 'PENDING' ? 'hover:bg-white/5 cursor-pointer' : ''}`}
                    onClick={() => gift.deliveryStatus !== 'PENDING' && setSelectedGift(gift)}
                  >
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-white">{gift.fullName}</p>
                      <p className="text-[10px] text-muted-foreground tracking-tight select-all">{gift.email}</p>
                    </td>
                    <td className="px-6 py-4 text-white/80">
                      <p>{gift.state}</p>
                      <p className="text-[10px] text-muted-foreground">{gift.city} ({gift.pinCode})</p>
                    </td>
                    <td className="px-6 py-4 text-white font-mono select-all">{gift.mobile}</td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDateTime(gift.createdAt)}</td>
                    <td className="px-6 py-4 text-muted-foreground">{getGiftActionTime(gift)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full border text-[9px] uppercase font-black ${getStatusBadgeClass(gift.deliveryStatus)}`}>
                        {gift.deliveryStatus.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {gift.deliveryStatus === 'PENDING' ? (
                        <button
                          onClick={() => handleAcceptGift(gift.id)}
                          disabled={acceptingIds[gift.id]}
                          className="py-1.5 px-3 rounded-lg bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {acceptingIds[gift.id] ? 'Accepting...' : 'Accept'}
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedGift(gift)}
                          className="py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Update Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/*
        ShipmentDrawer is rendered as a sibling — NOT inside the table/list.
        Because it is a separate named component, React preserves its DOM node
        and internal state across parent re-renders, eliminating the auto-close bug.
      */}
      <ShipmentDrawer
        gift={selectedGift}
        onClose={() => setSelectedGift(null)}
        onUpdated={handleGiftUpdated}
      />
      </>)}

      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={depositSearchQuery}
                onChange={(e) => setDepositSearchQuery(e.target.value)}
                placeholder="Search by member, phone, UTR, amount..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <select
                value={depositStatusFilter}
                onChange={(e) => setDepositStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-xl bg-slate-900 border border-white/10 text-white/80 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
              {hasActiveDepositFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setDepositSearchQuery('')
                    setDepositStatusFilter('ALL')
                  }}
                  className="h-9 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 text-xs font-bold cursor-pointer transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="premium-card overflow-hidden">
          {filteredGiftDeposits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs font-semibold">
              No gift deposit requests match the criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-semibold">
                <thead>
                  <tr className="border-b border-white/5 text-muted-foreground text-[10px] uppercase tracking-wider bg-white/5">
                    <th className="px-6 py-4">Member</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">UTR / Proof</th>
                    <th className="px-6 py-4">Request Submitted Time</th>
                    <th className="px-6 py-4">Admin Action Time</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredGiftDeposits.map((dep) => {
                    const statusColor = dep.status === 'APPROVED'
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : dep.status === 'REJECTED'
                      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                      : 'text-amber-400 bg-amber-500/10 border-amber-500/20'
                    return (
                      <tr key={dep.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-white">{dep.user.name}</p>
                          <p className="text-[10px] text-muted-foreground tracking-tight select-all">{dep.user.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-indigo-300 font-black text-sm">₹{dep.amount.toLocaleString('en-IN')}</span>
                        </td>
                        <td className="px-6 py-4">
                          {dep.utrNumber && <p className="font-mono text-white">{dep.utrNumber}</p>}
                          {dep.proofUrl && (
                            <a href={dep.proofUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline text-[10px]">View Proof</a>
                          )}
                          {!dep.utrNumber && !dep.proofUrl && <span className="text-white/30">—</span>}
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{formatDateTime(dep.createdAt)}</td>
                        <td className="px-6 py-4 text-muted-foreground">{getGiftDepositActionTime(dep)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full border text-[9px] uppercase font-black ${statusColor}`}>
                            {dep.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {dep.status === 'PENDING' ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleDepositAction(dep.id, 'approve')}
                                disabled={depositActionIds[dep.id]}
                                className="py-1.5 px-3 rounded-lg bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {depositActionIds[dep.id] ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleDepositAction(dep.id, 'reject')}
                                disabled={depositActionIds[dep.id]}
                                className="py-1.5 px-3 rounded-lg bg-rose-600/20 border border-rose-500/30 hover:bg-rose-600/30 text-rose-400 font-bold text-[10px] inline-flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-50"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-white/30 text-[10px]">Processed</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  )
}

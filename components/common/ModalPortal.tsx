'use client'

/**
 * ModalPortal — renders children into document.body via a React Portal.
 *
 * WHY THIS EXISTS:
 * Any ancestor element with `position: relative/sticky/fixed/absolute` plus
 * a non-auto `z-index` creates a CSS stacking context.  When a modal with
 * `position: fixed; z-index: 50` is rendered *inside* such an ancestor (e.g.
 * `<main class="relative z-10">`), the browser evaluates its z-index only
 * within that stacking context — effectively capping it at the ancestor's
 * z-level.  The sidebar (`position: sticky`) gets promoted to its own GPU
 * compositor layer, and when its hover transitions fire, the browser
 * re-sorts compositor layers, causing visible flickering against the modal.
 *
 * By portaling to `document.body`, the modal DOM node lives at the very root,
 * completely outside every ancestor stacking context.  Its `z-index: 50` is
 * then evaluated at the true document root level — definitively above the
 * sidebar, header, and everything else.
 */

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface ModalPortalProps {
  children: React.ReactNode
}

export function ModalPortal({ children }: ModalPortalProps) {
  const [mounted, setMounted] = useState(false)
  const portalRoot = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // Use a dedicated portal container attached to body so the modal is
    // completely outside every ancestor stacking context.
    let el = document.getElementById('modal-portal-root')
    if (!el) {
      el = document.createElement('div')
      el.id = 'modal-portal-root'
      document.body.appendChild(el)
    }
    portalRoot.current = el
    setMounted(true)
    return () => {
      // Do NOT remove the element — other modals might be using it.
    }
  }, [])

  if (!mounted || !portalRoot.current) return null
  return createPortal(children, portalRoot.current)
}

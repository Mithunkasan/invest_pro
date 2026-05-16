import * as React from "react"

const TOAST_LIMIT = 3
const TOAST_REMOVE_DELAY = 4000

type ToastVariant = "default" | "destructive" | "success"

type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: ToastVariant
  action?: React.ReactElement
}

type State = { toasts: Toast[] }

const listeners: Array<(state: State) => void> = []
let memoryState: State = { toasts: [] }

function dispatch(state: State) {
  memoryState = state
  listeners.forEach((listener) => listener(state))
}

let count = 0
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

export function toast(props: Omit<Toast, "id">) {
  const id = genId()
  const newToast: Toast = { ...props, id }

  dispatch({
    toasts: [newToast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
  })

  setTimeout(() => {
    dispatch({ toasts: memoryState.toasts.filter((t) => t.id !== id) })
  }, TOAST_REMOVE_DELAY)

  return id
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  }, [])

  return { toasts: state.toasts, toast }
}

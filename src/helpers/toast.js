import toast from 'react-hot-toast'

const baseStyle = {
  direction: 'rtl',
  fontFamily: "'Cairo', 'Segoe UI', Tahoma, sans-serif",
  borderRadius: '12px',
  padding: '12px 16px',
  fontSize: '14px',
  fontWeight: '600',
  maxWidth: '420px',
  boxShadow: '0 12px 40px -16px rgba(30, 42, 56, 0.45)',
}

const toastOptions = {
  duration: 3500,
  position: 'bottom-left',
}

/** Suits Shop branded toast helpers */
export const appToast = {
  success(message) {
    return toast.success(message, {
      ...toastOptions,
      style: {
        ...baseStyle,
        background: '#1e2a38',
        color: '#ffffff',
        border: '1px solid rgba(158, 126, 58, 0.45)',
      },
      iconTheme: {
        primary: '#c4a35a',
        secondary: '#1e2a38',
      },
    })
  },

  error(message) {
    return toast.error(message, {
      ...toastOptions,
      duration: 4500,
      style: {
        ...baseStyle,
        background: '#ffffff',
        color: '#1e2a38',
        border: '1px solid rgba(220, 38, 38, 0.35)',
      },
      iconTheme: {
        primary: '#dc2626',
        secondary: '#ffffff',
      },
    })
  },

  info(message) {
    return toast(message, {
      ...toastOptions,
      style: {
        ...baseStyle,
        background: '#f7f5f2',
        color: '#1e2a38',
        border: '1px solid rgba(30, 42, 56, 0.12)',
      },
      icon: 'ℹ',
    })
  },

  loading(message) {
    return toast.loading(message, {
      position: 'bottom-left',
      style: {
        ...baseStyle,
        background: '#ffffff',
        color: '#1e2a38',
        border: '1px solid rgba(158, 126, 58, 0.35)',
      },
    })
  },

  dismiss(id) {
    toast.dismiss(id)
  },
}

/** Shared props for the global <Toaster /> */
export const suitsToasterProps = {
  position: 'bottom-left',
  reverseOrder: false,
  gutter: 10,
  containerStyle: {
    top: 16,
    zIndex: 9999,
  },
  toastOptions: {
    className: 'suits-toast',
    duration: 3500,
    style: baseStyle,
  },
}

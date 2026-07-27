import toast from 'react-hot-toast'

const baseStyle = {
  background: '#0F1B30',
  color: '#FAF5EA',
  fontSize: '13.5px',
  borderRadius: '12px',
  padding: '10px 14px',
  border: '1px solid rgba(210, 175, 107, 0.25)',
}

export const notify = {
  success: (message) =>
    toast.success(message, { style: baseStyle, iconTheme: { primary: '#8CA089', secondary: '#0F1B30' } }),
  error: (message) =>
    toast.error(message, { style: baseStyle, iconTheme: { primary: '#C79E9E', secondary: '#0F1B30' } }),
  info: (message) => toast(message, { style: baseStyle, icon: '✦' }),
}
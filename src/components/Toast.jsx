import { useState, useEffect } from 'react'

const Toast = ({ message, type, duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(), 200) // Wait for fade out animation
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!message) return null

  return (
    <div className={`toast toast--${type} ${isVisible ? 'toast--visible' : 'toast--hidden'}`}>
      <div className="toast__content">
        <span>{message}</span>
        <button className="toast__close" onClick={() => {
          setIsVisible(false)
          setTimeout(() => onClose(), 200)
        }}>
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast
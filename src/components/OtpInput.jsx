import React, { useRef } from 'react'
import './OtpInput.css'

export default function OtpInput({ value, onChange, length = 6 }) {
  const inputs = useRef([])

  const handleChange = (i, e) => {
    const ch = e.target.value.replace(/\D/g, '').slice(-1)
    const arr = value.padEnd(length, ' ').split('')
    arr[i] = ch || ' '
    const next = arr.join('').trimEnd()
    onChange(next.replace(/ /g, ''))
    if (ch && i < length - 1) inputs.current[i + 1]?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace') {
      if (value[i]) {
        const arr = value.split('')
        arr[i] = ''
        onChange(arr.join(''))
      } else if (i > 0) {
        inputs.current[i - 1]?.focus()
        const arr = value.split('')
        arr[i - 1] = ''
        onChange(arr.join(''))
      }
    }
    if (e.key === 'ArrowLeft' && i > 0) inputs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < length - 1) inputs.current[i + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted)
    const next = Math.min(pasted.length, length - 1)
    inputs.current[next]?.focus()
  }

  return (
    <div className="otp-wrap">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className={`otp-cell ${value[i] ? 'filled' : ''}`}
          value={value[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoComplete="off"
        />
      ))}
    </div>
  )
}

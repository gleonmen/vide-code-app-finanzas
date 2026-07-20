import { useRef, type ChangeEvent } from 'react'

interface Props {
  digits: string
  onChange: (digits: string) => void
}

function format(digits: string) {
  if (!digits) return ''
  return Number(digits).toLocaleString('es-CO')
}

export function AmountInput({ digits, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target
    const cursorPos = input.selectionStart ?? input.value.length
    const digitsBeforeCursor = input.value.slice(0, cursorPos).replace(/\D/g, '').length
    const newDigits = input.value.replace(/\D/g, '')
    onChange(newDigits)

    requestAnimationFrame(() => {
      if (!inputRef.current) return
      const newFormatted = format(newDigits)
      let seen = 0
      let pos = newFormatted.length
      for (let i = 0; i < newFormatted.length; i++) {
        if (/\d/.test(newFormatted[i])) seen++
        if (seen === digitsBeforeCursor) {
          pos = i + 1
          break
        }
      }
      inputRef.current.setSelectionRange(pos, pos)
    })
  }

  return (
    <input
      ref={inputRef}
      inputMode="numeric"
      value={format(digits)}
      onChange={handleChange}
      placeholder="0"
      required
    />
  )
}

'use client'

import * as React from 'react'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from './select'

const HOURS   = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']

interface TimePickerProps {
  value:    string
  onChange: (value: string) => void
  disabled?: boolean
  /** Minimum selectable time in HH:mm. Earlier slots are disabled. */
  min?: string
}

function parse(value: string): { hour: string; minute: string } {
  const [h = '08', m = '00'] = value.split(':')
  return {
    hour:   HOURS.includes(h) ? h : '08',
    minute: MINUTES.includes(m) ? m : '00',
  }
}

function splitMin(min?: string): { minH: string | null; minM: string | null } {
  if (!min) return { minH: null, minM: null }
  const [h, m] = min.split(':')
  return { minH: h ?? null, minM: m ?? null }
}

export function TimePicker({ value, onChange, disabled, min }: TimePickerProps) {
  const { hour, minute } = parse(value)
  const { minH, minM }   = splitMin(min)

  const isHourDisabled = (h: string): boolean =>
    minH != null && h < minH

  const isMinuteDisabled = (m: string): boolean =>
    minH != null && minM != null && hour === minH && m < minM

  const handleHourChange = (h: string | null): void => {
    if (h == null) return
    let nextMinute = minute
    if (minH != null && minM != null && h === minH && nextMinute < minM) {
      nextMinute = minM
    }
    onChange(`${h}:${nextMinute}`)
  }

  const handleMinuteChange = (m: string | null): void => {
    if (m == null) return
    onChange(`${hour}:${m}`)
  }

  return (
    <div className="flex items-center gap-2">
      <Select disabled={disabled} value={hour} onValueChange={handleHourChange}>
        <SelectTrigger className="w-[88px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h} disabled={isHourDisabled(h)}>{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span aria-hidden className="text-muted-foreground">:</span>
      <Select disabled={disabled} value={minute} onValueChange={handleMinuteChange}>
        <SelectTrigger className="w-[88px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m} disabled={isMinuteDisabled(m)}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

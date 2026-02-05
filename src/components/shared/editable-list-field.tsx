"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { LEARNING_OUTCOME_MAX_LENGTH } from "@/lib/constants"

interface EditableListFieldProps {
  values: string[]
  onChange: (values: string[]) => void
  label: string
  description?: string
  placeholder: string
  minRows?: number
  maxCharacters?: number
  disabled?: boolean
}

export function EditableListField({
  values,
  onChange,
  label,
  description,
  placeholder,
  minRows = 1,
  maxCharacters = LEARNING_OUTCOME_MAX_LENGTH,
  disabled = false,
}: EditableListFieldProps) {
  const [rowCount, setRowCount] = useState(
    Math.max(minRows, values.length)
  )

  // Build display rows: actual values padded with empty strings up to rowCount
  const rows: string[] = []
  for (let i = 0; i < Math.max(rowCount, values.length); i++) {
    rows.push(values[i] || "")
  }

  function handleChange(index: number, newValue: string) {
    if (newValue.length > maxCharacters) return

    const updated = [...rows]
    updated[index] = newValue

    // Pass only non-empty values to parent
    onChange(updated.filter((v) => v.trim() !== ""))
  }

  function handleRemove(index: number) {
    const updated = rows.filter((_, i) => i !== index)
    const newRowCount = Math.max(minRows, updated.length)
    setRowCount(newRowCount)
    onChange(updated.filter((v) => v.trim() !== ""))
  }

  function handleAddMore() {
    setRowCount((c) => c + 1)
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-bold">{label}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>

      <div className="space-y-2">
        {rows.map((value, index) => (
          <div key={index} className="group relative">
            <div className="relative">
              <Input
                value={value}
                onChange={(e) => handleChange(index, e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span
                  className={cn(
                    "text-xs tabular-nums",
                    value.length > maxCharacters - 10
                      ? "text-orange-500"
                      : "text-muted-foreground"
                  )}
                >
                  {maxCharacters - value.length}
                </span>
                {value.length > 0 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(index)}
                    disabled={disabled}
                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity p-0.5 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddMore}
        disabled={disabled}
        className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5" />
        Add more to your response
      </button>
    </div>
  )
}

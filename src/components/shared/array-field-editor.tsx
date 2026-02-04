"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormLabel } from "@/components/ui/form"

export function ArrayFieldEditor({
  form,
  name,
  label,
  placeholder,
  disabled,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: any
  name: "learningOutcomes" | "requirements" | "targetAudience"
  label: string
  placeholder: string
  disabled: boolean
}) {
  const values: string[] = form.watch(name) || []
  const [inputValue, setInputValue] = useState("")

  function addItem() {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    form.setValue(name, [...values, trimmed])
    setInputValue("")
  }

  function removeItem(index: number) {
    form.setValue(
      name,
      values.filter((_: string, i: number) => i !== index)
    )
  }

  return (
    <div className="space-y-3">
      <FormLabel>{label}</FormLabel>
      <div className="flex gap-2">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addItem()
            }
          }}
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addItem}
          disabled={disabled || !inputValue.trim()}
        >
          Add
        </Button>
      </div>
      {values.length > 0 && (
        <ul className="space-y-2">
          {values.map((item: string, index: number) => (
            <li
              key={index}
              className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
            >
              <span>{item}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-muted-foreground hover:text-destructive"
                onClick={() => removeItem(index)}
                disabled={disabled}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

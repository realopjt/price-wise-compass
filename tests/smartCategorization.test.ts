import { describe, it, expect } from 'vitest'
import { categorizeExpense } from '../src/utils/smartCategorization'

describe('categorizeExpense', () => {
  it('categorizes internet-related expense', () => {
    const result = categorizeExpense('Monthly bill', 'Comcast', 'internet service')
    expect(result.category).toBe('Internet/Telecom')
  })

  it('returns Other for unknown expense', () => {
    const result = categorizeExpense('Random purchase')
    expect(result.category).toBe('Other')
  })
})

export interface PredefinedCategory {
  name: string
  type: 'income' | 'expense'
  isSystem: boolean
  sortOrder: number
}

export const PREDEFINED_CATEGORIES: PredefinedCategory[] = [
  // Income
  { name: 'Paycheck', type: 'income', isSystem: false, sortOrder: 1 },
  { name: 'Other Income', type: 'income', isSystem: false, sortOrder: 2 },

  // Giving — system category, cannot be deleted
  { name: 'Giving', type: 'expense', isSystem: true, sortOrder: 10 },

  // Saving
  { name: 'Emergency Fund', type: 'expense', isSystem: false, sortOrder: 20 },
  { name: 'Retirement', type: 'expense', isSystem: false, sortOrder: 21 },
  { name: 'Other Savings', type: 'expense', isSystem: false, sortOrder: 22 },

  // Housing
  { name: 'Rent / Mortgage', type: 'expense', isSystem: false, sortOrder: 30 },
  { name: 'HOA', type: 'expense', isSystem: false, sortOrder: 31 },
  { name: 'Home Insurance', type: 'expense', isSystem: false, sortOrder: 32 },
  { name: 'Property Tax', type: 'expense', isSystem: false, sortOrder: 33 },
  { name: 'Repairs & Maintenance', type: 'expense', isSystem: false, sortOrder: 34 },

  // Transport
  { name: 'Car Payment', type: 'expense', isSystem: false, sortOrder: 40 },
  { name: 'Car Insurance', type: 'expense', isSystem: false, sortOrder: 41 },
  { name: 'Gas', type: 'expense', isSystem: false, sortOrder: 42 },
  { name: 'Parking', type: 'expense', isSystem: false, sortOrder: 43 },
  { name: 'Car Maintenance', type: 'expense', isSystem: false, sortOrder: 44 },

  // Food
  { name: 'Groceries', type: 'expense', isSystem: false, sortOrder: 50 },
  { name: 'Dining Out', type: 'expense', isSystem: false, sortOrder: 51 },
  { name: 'Coffee Shops', type: 'expense', isSystem: false, sortOrder: 52 },

  // Personal
  { name: 'Clothing', type: 'expense', isSystem: false, sortOrder: 60 },
  { name: 'Medical / Dental', type: 'expense', isSystem: false, sortOrder: 61 },
  { name: 'Gym', type: 'expense', isSystem: false, sortOrder: 62 },
  { name: 'Haircuts', type: 'expense', isSystem: false, sortOrder: 63 },
  { name: 'Personal Care', type: 'expense', isSystem: false, sortOrder: 64 },

  // Lifestyle
  { name: 'Subscriptions', type: 'expense', isSystem: false, sortOrder: 70 },
  { name: 'Entertainment', type: 'expense', isSystem: false, sortOrder: 71 },
  { name: 'Hobbies', type: 'expense', isSystem: false, sortOrder: 72 },
  { name: 'Vacation', type: 'expense', isSystem: false, sortOrder: 73 },

  // Debt
  { name: 'Credit Card', type: 'expense', isSystem: false, sortOrder: 80 },
  { name: 'Student Loan', type: 'expense', isSystem: false, sortOrder: 81 },
  { name: 'Other Debt', type: 'expense', isSystem: false, sortOrder: 82 },

  // Other
  { name: 'Miscellaneous', type: 'expense', isSystem: false, sortOrder: 90 },
]

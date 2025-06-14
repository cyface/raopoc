// Route definitions for the onboarding flow
export const ROUTES = {
  // Redirect root to first step
  ROOT: '/',
  
  // Step-based routes with numbers and descriptive slugs
  STEP_1: '/step/1/product-selection',
  STEP_2: '/step/2/customer-info', 
  STEP_3: '/step/3/identification',
  STEP_4: '/step/4/documents',
  STEP_5: '/step/5/confirmation',
} as const

// Alternative named routes (redirect to numbered routes)
export const NAMED_ROUTES = {
  PRODUCT_SELECTION: '/product-selection',
  CUSTOMER_INFO: '/customer-info',
  IDENTIFICATION: '/identification', 
  DOCUMENTS: '/documents',
  CONFIRMATION: '/confirmation',
} as const

// Step mapping for easy lookup
export const STEP_TO_ROUTE = {
  1: ROUTES.STEP_1,
  2: ROUTES.STEP_2,
  3: ROUTES.STEP_3,
  4: ROUTES.STEP_4,
  5: ROUTES.STEP_5,
} as const

export const ROUTE_TO_STEP = {
  [ROUTES.STEP_1]: 1,
  [ROUTES.STEP_2]: 2,
  [ROUTES.STEP_3]: 3,
  [ROUTES.STEP_4]: 4,
  [ROUTES.STEP_5]: 5,
} as const

// Named route redirects
export const NAMED_ROUTE_TO_STEP = {
  [NAMED_ROUTES.PRODUCT_SELECTION]: 1,
  [NAMED_ROUTES.CUSTOMER_INFO]: 2,
  [NAMED_ROUTES.IDENTIFICATION]: 3,
  [NAMED_ROUTES.DOCUMENTS]: 4,
  [NAMED_ROUTES.CONFIRMATION]: 5,
} as const

export type StepNumber = 1 | 2 | 3 | 4 | 5
export type StepRoute = typeof ROUTES[keyof typeof ROUTES]
export type NamedRoute = typeof NAMED_ROUTES[keyof typeof NAMED_ROUTES]
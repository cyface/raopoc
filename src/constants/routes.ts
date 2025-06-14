// Route definitions for the onboarding flow
export const ROUTES = {
  // Redirect root to first step
  ROOT: '/',
  
  // Step-based routes with numbers and descriptive slugs
  STEP_1: '/step/1/email-capture',
  STEP_2: '/step/2/product-selection',
  STEP_3: '/step/3/customer-info', 
  STEP_4: '/step/4/identification',
  STEP_5: '/step/5/documents',
  STEP_6: '/step/6/confirmation',
} as const

// Alternative named routes (redirect to numbered routes)
export const NAMED_ROUTES = {
  EMAIL_CAPTURE: '/email-capture',
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
  6: ROUTES.STEP_6,
} as const

export const ROUTE_TO_STEP = {
  [ROUTES.STEP_1]: 1,
  [ROUTES.STEP_2]: 2,
  [ROUTES.STEP_3]: 3,
  [ROUTES.STEP_4]: 4,
  [ROUTES.STEP_5]: 5,
  [ROUTES.STEP_6]: 6,
} as const

// Named route redirects
export const NAMED_ROUTE_TO_STEP = {
  [NAMED_ROUTES.EMAIL_CAPTURE]: 1,
  [NAMED_ROUTES.PRODUCT_SELECTION]: 2,
  [NAMED_ROUTES.CUSTOMER_INFO]: 3,
  [NAMED_ROUTES.IDENTIFICATION]: 4,
  [NAMED_ROUTES.DOCUMENTS]: 5,
  [NAMED_ROUTES.CONFIRMATION]: 6,
} as const

export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6
export type StepRoute = typeof ROUTES[keyof typeof ROUTES]
export type NamedRoute = typeof NAMED_ROUTES[keyof typeof NAMED_ROUTES]
import 'express-session'

declare module 'express' {
  interface Request {
    session: import('express-session').Session & Partial<import('express-session').SessionData> & {
      store?: any
    }
  }
}

declare module 'express-session' {
  interface SessionData {
    userId?: string
    username?: string
    visitCount?: number
    lastVisit?: Date
  }
}
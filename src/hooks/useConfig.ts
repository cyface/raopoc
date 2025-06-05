import { useState, useEffect } from 'react'
import { useUrlParams } from './useUrlParams'
import { configService, type Product, type BankInfo, type State, type Country, type IdentificationType, type DocumentConfig } from '../services/configService'

/**
 * Hook to reactively get products based on current URL parameters
 * Automatically updates when fi or lng parameters change
 */
export function useProducts(): { products: Product[], loading: boolean, error: string | null } {
  const { fi, lng } = useUrlParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    setLoading(true)
    setError(null)

    configService.getProductsFor(fi, lng)
      .then(data => {
        if (!isCancelled) {
          setProducts(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!isCancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [fi, lng])

  return { products, loading, error }
}

/**
 * Hook to reactively get bank info based on current URL parameters
 * Automatically updates when fi or lng parameters change
 */
export function useBankInfo(): { bankInfo: BankInfo | null, loading: boolean, error: string | null } {
  const { fi, lng } = useUrlParams()
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    setLoading(true)
    setError(null)

    configService.getBankInfoFor(fi, lng)
      .then(data => {
        if (!isCancelled) {
          setBankInfo(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!isCancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [fi, lng])

  return { bankInfo, loading, error }
}

/**
 * Hook to reactively get states based on current URL parameters
 */
export function useStates(): { states: State[], loading: boolean, error: string | null } {
  const { fi, lng } = useUrlParams()
  const [states, setStates] = useState<State[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    setLoading(true)
    setError(null)

    configService.getStatesFor(fi, lng)
      .then(data => {
        if (!isCancelled) {
          setStates(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!isCancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [fi, lng])

  return { states, loading, error }
}

/**
 * Hook to reactively get countries based on current URL parameters
 */
export function useCountries(): { countries: Country[], loading: boolean, error: string | null } {
  const { fi, lng } = useUrlParams()
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    setLoading(true)
    setError(null)

    configService.getCountriesFor(fi, lng)
      .then(data => {
        if (!isCancelled) {
          setCountries(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!isCancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [fi, lng])

  return { countries, loading, error }
}

/**
 * Hook to reactively get identification types based on current URL parameters
 */
export function useIdentificationTypes(): { identificationTypes: IdentificationType[], loading: boolean, error: string | null } {
  const { fi, lng } = useUrlParams()
  const [identificationTypes, setIdentificationTypes] = useState<IdentificationType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    setLoading(true)
    setError(null)

    configService.getIdentificationTypesFor(fi, lng)
      .then(data => {
        if (!isCancelled) {
          setIdentificationTypes(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!isCancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [fi, lng])

  return { identificationTypes, loading, error }
}

/**
 * Hook to reactively get documents based on current URL parameters
 */
export function useDocuments(): { documents: DocumentConfig | null, loading: boolean, error: string | null } {
  const { fi, lng } = useUrlParams()
  const [documents, setDocuments] = useState<DocumentConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    setLoading(true)
    setError(null)

    configService.getDocumentsFor(fi, lng)
      .then(data => {
        if (!isCancelled) {
          setDocuments(data)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!isCancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [fi, lng])

  return { documents, loading, error }
}

/**
 * Combined hook that gets both products and bank info efficiently
 * Useful for components that need both (like ProductSelection)
 */
export function useProductsAndBankInfo(): {
  products: Product[]
  bankInfo: BankInfo | null
  loading: boolean
  error: string | null
} {
  const { fi, lng } = useUrlParams()
  const [products, setProducts] = useState<Product[]>([])
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isCancelled = false
    setLoading(true)
    setError(null)

    Promise.all([
      configService.getProductsFor(fi, lng),
      configService.getBankInfoFor(fi, lng)
    ])
      .then(([productsData, bankInfoData]) => {
        if (!isCancelled) {
          setProducts(productsData)
          setBankInfo(bankInfoData)
          setLoading(false)
        }
      })
      .catch(err => {
        if (!isCancelled) {
          setError(err.message)
          setLoading(false)
        }
      })

    return () => {
      isCancelled = true
    }
  }, [fi, lng])

  return { products, bankInfo, loading, error }
}

/**
 * Hook for preloading configurations
 * Useful for preloading both languages when a bank is selected
 */
export function useConfigPreloader() {
  const preloadLanguages = async (fi: string | null) => {
    return configService.preloadLanguages(fi)
  }

  const preloadConfiguration = async (fi: string | null, lng: string) => {
    return configService.preloadConfiguration(fi, lng)
  }

  return { preloadLanguages, preloadConfiguration }
}
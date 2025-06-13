import { type LoaderFunction } from 'react-router'
import { configService } from '../../services/configService'
import { getSearchParams } from '../../utils/urlParams'
import type { BankInfo } from '../../services/configService'
import type { Product } from '../../services/configService'
import type { State } from '../../services/configService'
import type { Country } from '../../services/configService'
import type { IdentificationType } from '../../services/configService'

export interface RootLoaderData {
  params: {
    fi: string | null
    lng: string
    dark: string | null
  }
  bankInfo: BankInfo | null
  products: Product[]
  states: State[]
  countries: Country[]
  identificationTypes: IdentificationType[]
}

export const rootLoader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const params = getSearchParams(url.searchParams)
  
  // Preload all configurations for the bank/language combination
  const [bankInfo, products, states, countries, identificationTypes] = await Promise.all([
    configService.getBankInfoFor(params.fi, params.lng),
    configService.getProductsFor(params.fi, params.lng),
    configService.getStatesFor(params.fi, params.lng),
    configService.getCountriesFor(params.fi, params.lng),
    configService.getIdentificationTypesFor(params.fi, params.lng),
  ])
  
  return {
    params,
    bankInfo,
    products,
    states,
    countries,
    identificationTypes,
  }
}
/* eslint-env node */

import 'dotenv/config'
import {execSync} from 'child_process'
import fs from 'fs/promises'

const VIN = process.env['VIN']

if (VIN == null) {
  throw new Error('VIN must be supplied')
}

const dealerCategoryTable = {
  A: 'Allocated',
  F: 'Freight',
  G: 'Ground',
  G1: 'Dealership',
} as const

type DealerCategoryTable = typeof dealerCategoryTable

interface API {
  dealerCategory: keyof DealerCategoryTable
  eta?: {
    currFromDate: string
    currToDate: string
  }
}

export type Data = {
  status: DealerCategoryTable[keyof DealerCategoryTable]
  lastUpdate: string
  eta?: {
    from: string
    to: string
  }
}

async function main() {
  const response =
    execSync(`curl 'https://api.rti.toyota.com/marketplace-inventory/vehicles/${VIN}?isVspec=true' \
            -H 'accept: application/json' \
            -H 'dnt: 1' \
            -H 'sec-gpc: 1' \
            -H 'sec-fetch-site: same-site' \
            -H 'sec-fetch-mode: cors' \
            -H 'sec-fetch-dest: empty' \
            -H 'referer: https://guest.dealer.toyota.com/' \
            -H 'accept-language: en-CA,en-GB;q=0.9,en-US;q=0.8,en;q=0.7' \
            --compressed \
            --silent`).toString()
  const api = JSON.parse(response) as API
  const clientData: Data = {
    status: dealerCategoryTable[api.dealerCategory],
    lastUpdate: new Date().toString(),
  }

  if (api.eta != null) {
    clientData.eta = {
      from: new Date(api.eta.currFromDate).toDateString(),
      to: new Date(api.eta.currToDate).toDateString(),
    }
  }

  await fs.writeFile(
    './dist/data.mjs',
    `export const data = ${JSON.stringify(clientData)}`,
  )
}

main()

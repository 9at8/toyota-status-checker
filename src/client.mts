/* eslint-env browser */

// @ts-expect-error this is okay, will be present during runtime
import {data as _data} from './data.mjs'
import type {Data} from './script.mjs'

const data: Data = _data

const [status, etaFrom, etaTo, lastUpdated] = [
  'status',
  'eta-from',
  'eta-to',
  'last-updated',
].map(id => document.getElementById(id))

status!.innerText = `Status: ${data.status}`

if (data.eta) {
  etaFrom!.innerText = `ETA from Japan: ${data.eta.from}`
  etaTo!.innerText = `ETA to US: ${data.eta.to}`
}

lastUpdated!.innerText = `Last updated: ${data.lastUpdate}`

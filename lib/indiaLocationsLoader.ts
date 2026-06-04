import fs from 'fs'
import path from 'path'
import readline from 'readline'

export interface LocationsTree {
  [state: string]: {
    [district: string]: {
      [city: string]: string // city name -> pincode
    }
  }
}

// Global cache to avoid parsing on every request
declare global {
  var _indiaLocationsTree: LocationsTree | undefined
}

function toTitleCase(str: string): string {
  if (!str) return ''
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function getLocationsTree(): Promise<LocationsTree> {
  if (global._indiaLocationsTree) {
    return global._indiaLocationsTree
  }

  const tree: LocationsTree = {}
  const csvPath = path.join(process.cwd(), 'public', 'india.csv')

  const fileStream = fs.createReadStream(csvPath)
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  })

  let isHeader = true
  for await (const line of rl) {
    if (isHeader) {
      isHeader = false
      continue
    }

    const parts = line.split(',')
    if (parts.length < 9) continue

    let stateRaw = parts[8]
    if (stateRaw.charCodeAt(0) === 34) {
      stateRaw = stateRaw.slice(1, -1)
    }
    const state = toTitleCase(stateRaw)

    let districtRaw = parts[7]
    if (districtRaw.charCodeAt(0) === 34) {
      districtRaw = districtRaw.slice(1, -1)
    }
    const district = toTitleCase(districtRaw)

    let city = parts[3]
    if (city.charCodeAt(0) === 34) {
      city = city.slice(1, -1)
    }
    city = city.trim()

    let pincode = parts[4]
    if (pincode.charCodeAt(0) === 34) {
      pincode = pincode.slice(1, -1)
    }
    pincode = pincode.trim()

    if (!state || stateRaw.toUpperCase() === 'NA' || !district || !city || !pincode) continue

    if (!tree[state]) {
      tree[state] = {}
    }
    if (!tree[state][district]) {
      tree[state][district] = {}
    }
    tree[state][district][city] = pincode
  }

  global._indiaLocationsTree = tree
  return tree
}

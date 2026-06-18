'use server'

import { getLocationsTree } from '@/lib/indiaLocationsLoader'

export async function getStatesAction(): Promise<{ success: boolean; states: string[] }> {
  try {
    const tree = await getLocationsTree()
    return { success: true, states: Object.keys(tree).sort() }
  } catch (err) {
    console.error('Failed to get states:', err)
    return { success: false, states: [] }
  }
}

export async function getDistrictsAction(state: string): Promise<{ success: boolean; districts: string[] }> {
  try {
    if (!state) return { success: true, districts: [] }
    const tree = await getLocationsTree()
    const districts = tree[state] ? Object.keys(tree[state]).sort() : []
    return { success: true, districts }
  } catch (err) {
    console.error('Failed to get districts:', err)
    return { success: false, districts: [] }
  }
}

export async function getCitiesAction(
  state: string,
  district: string
): Promise<{ success: boolean; cities: { name: string; pinCode: string }[] }> {
  try {
    if (!state || !district) return { success: true, cities: [] }
    const tree = await getLocationsTree()
    const citiesObj = tree[state]?.[district] || {}
    const cities = Object.entries(citiesObj)
      .map(([name, pinCode]) => ({ name, pinCode }))
      .sort((a, b) => a.name.localeCompare(b.name))
    return { success: true, cities }
  } catch (err) {
    console.error('Failed to get cities:', err)
    return { success: false, cities: [] }
  }
}

export async function getDistrictForCityAction(
  state: string,
  city: string
): Promise<{ success: boolean; district: string }> {
  try {
    if (!state || !city) return { success: true, district: '' }
    const tree = await getLocationsTree()
    let district = ''
    if (tree[state]) {
      for (const [dist, cities] of Object.entries(tree[state])) {
        if (cities[city]) {
          district = dist
          break
        }
      }
    }
    return { success: true, district }
  } catch (err) {
    console.error('Failed to get district for city:', err)
    return { success: false, district: '' }
  }
}


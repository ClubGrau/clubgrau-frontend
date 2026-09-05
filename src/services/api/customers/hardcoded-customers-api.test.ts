import { describe, expect, it } from 'vitest'
import { HardcodedCustomersApi } from './hardcoded-customers-api'
import { seedCustomers } from './seed-customers'

function api() {
  return new HardcodedCustomersApi(seedCustomers())
}

describe('HardcodedCustomersApi', () => {
  it('returns list items with initials', async () => {
    const result = await api().getCustomers({ page: 1, limit: 10 })

    expect(result.total).toBe(5)
    expect(result.data[0]).toMatchObject({
      id: 'cust-1',
      name: 'Marina Albuquerque',
      nif: '251847963',
      initials: 'MA',
    })
  })

  it('filters by name, nif or email', async () => {
    const byNif = await api().getCustomers({ page: 1, limit: 10, search: '209876541' })
    const byEmail = await api().getCustomers({ page: 1, limit: 10, search: 'vertexlog' })

    expect(byNif.data.map((item) => item.name)).toEqual(['Helena Cardoso'])
    expect(byEmail.data.map((item) => item.name)).toEqual(['Rafael Nunes'])
  })

  it('filters by rank', async () => {
    const result = await api().getCustomers({ page: 1, limit: 10, rank: 'OURO' })

    expect(result.data.map((item) => item.name)).toEqual([
      'Marina Albuquerque',
      'Helena Cardoso',
    ])
  })

  it('paginates', async () => {
    const result = await api().getCustomers({ page: 2, limit: 2 })

    expect(result.page).toBe(2)
    expect(result.totalPages).toBe(3)
    expect(result.data).toHaveLength(2)
    expect(result.data[0]?.id).toBe('cust-3')
  })

  it('creates a customer at the top of the list', async () => {
    const customers = api()
    const created = await customers.create({
      name: 'Ana Costa',
      email: 'ana@costa.com',
      phone: '+351912345678',
      nif: '123456789',
      referral: 'Marina Albuquerque',
      rank: 'BRONZE',
    })
    const result = await customers.getCustomers({ page: 1, limit: 10 })

    expect(result.total).toBe(6)
    expect(result.data[0]).toMatchObject({
      id: created.id,
      name: 'Ana Costa',
      nif: '123456789',
      referral: 'Marina Albuquerque',
      rank: 'BRONZE',
      initials: 'AC',
    })
  })

  it('removes a customer from the list', async () => {
    const customers = api()
    await customers.remove({ id: 'cust-1' })
    const result = await customers.getCustomers({ page: 1, limit: 10 })

    expect(result.total).toBe(4)
    expect(result.data.find((item) => item.id === 'cust-1')).toBeUndefined()
  })
})

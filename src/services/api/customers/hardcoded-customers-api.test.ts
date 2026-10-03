import { describe, expect, it } from 'vitest'
import { summarizeCustomers } from '../../../domain/customer-wallet'
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

  it('filters by name, nif, email or phone', async () => {
    const byNif = await api().getCustomers({ page: 1, limit: 10, search: '209876541' })
    const byEmail = await api().getCustomers({ page: 1, limit: 10, search: 'vertexlog' })
    const byPhone = await api().getCustomers({ page: 1, limit: 10, search: '98220' })

    expect(byNif.data.map((item) => item.name)).toEqual(['Helena Cardoso'])
    expect(byEmail.data.map((item) => item.name)).toEqual(['Rafael Nunes'])
    expect(byPhone.data.map((item) => item.name)).toEqual(['Camila Prado'])
  })

  it('summarizes the searched wallet before the rank filter', async () => {
    const customers = api()
    const all = await customers.getCustomers({ page: 1, limit: 10 })
    const ouro = await customers.getCustomers({ page: 1, limit: 10, rank: 'OURO' })

    expect(all.summary).toEqual(summarizeCustomers(seedCustomers(), new Date()))
    expect(ouro.summary).toEqual(all.summary)
    expect(ouro.summary.byRank).toEqual({ OURO: 2, PRATA: 2, BRONZE: 1 })
    expect(ouro.total).toBe(2)
  })

  it('keeps platform totals when the wallet is searched', async () => {
    const platform = summarizeCustomers(seedCustomers(), new Date())
    const searched = await api().getCustomers({ page: 1, limit: 10, search: 'Helena' })

    expect(searched.summary.total).toBe(platform.total)
    expect(searched.summary.joinedThisMonth).toBe(platform.joinedThisMonth)
    expect(searched.summary.byRank).toEqual({ OURO: 1, PRATA: 0, BRONZE: 0 })
    expect(searched.total).toBe(1)
  })

  it('sorts by registration date, name and rank', async () => {
    const customers = api()
    const newest = await customers.getCustomers({
      page: 1,
      limit: 10,
      sort: 'createdAt',
      direction: 'desc',
    })
    const byRank = await customers.getCustomers({
      page: 1,
      limit: 10,
      sort: 'rank',
      direction: 'asc',
    })

    expect(newest.data.map((item) => item.name)).toEqual([
      'Helena Cardoso',
      'Camila Prado',
      'Rafael Nunes',
      'Marina Albuquerque',
      'Diego Fontes',
    ])
    expect(byRank.data.map((item) => item.rank)).toEqual([
      'OURO',
      'OURO',
      'PRATA',
      'PRATA',
      'BRONZE',
    ])
  })

  it('resolves who indicated whom across the wallet', async () => {
    const result = await api().getCustomers({ page: 1, limit: 10 })
    const marina = result.data.find((item) => item.id === 'cust-1')
    const rafael = result.data.find((item) => item.id === 'cust-2')

    expect(marina).toMatchObject({ referralCustomerId: 'cust-2', referredCount: 1 })
    expect(rafael).toMatchObject({ referralCustomerId: null, referredCount: 1 })
  })

  it('loads one customer with the same referral links', async () => {
    const customers = api()

    await expect(customers.getCustomer('cust-5')).resolves.toMatchObject({
      name: 'Helena Cardoso',
      initials: 'HC',
      referredCount: 1,
    })
    await expect(customers.getCustomer('missing')).resolves.toBeNull()
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

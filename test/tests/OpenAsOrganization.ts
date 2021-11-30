import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import { IInvokeScriptCall } from '@waves/waves-transactions/dist/transactions'

const Open = 'open'
const Close = 'close'
const Active = 'active'
const TESTID = 'testid'

const OpenAsOrganization = (th: TestHelper) => {
  describe('OpenAsOrganization', () => {
    before('write user to organization data', async () => {
      await th.txSuccess(
        Transactions.data(
          {
            data: [
              { key: `user_${th.OrganizationUser.address}`, value: TESTID }
            ],
            chainId: th.chainId,
            fee: 500000
          },
          th.Organization.seed
        )
      )

      th.openAsOrgCall = {
        function: 'deviceActionAs',
        args: [
          { type: 'string', value: th.organizationKey },
          { type: 'string', value: Open },
          { type: 'string', value: th.Organization.address },
          { type: 'string', value: TESTID }
        ]
      }

      //th.deviceActionsCount = parseInt(await th.dappValueFor(`device_counter_${th.Device.address}`))
      th.balance.setActual(th.OrganizationUser)
    })

    describe('not allowed organization', () => {
      const invoker = th.OrganizationUser
      const device = th.Device.address
      it('invoke', async () => {
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call: th.openAsOrgCall,
              payment: [],
              fee: 900000
            },
            invoker.seed
          ),
          'Organization not permitted'
        )
      })

      it('no asset change', async () => {
        await th.balance.expectChange(invoker, 0)
      })

      it('device not opened', async () => {
        expect(await th.dappValueFor(`device_${device}`)).to.eq(Close)
        expect(await th.dappValueFor(`device_counter_${device}`)).to.eq(
          th.deviceActionsCount
        )
      })
    })

    describe('allowed organization', () => {
      before('write organization to dapp data', async () => {
        await th.txSuccess(
          Transactions.data(
            {
              data: [{ key: `org_${th.Organization.address}`, value: Active }],
              chainId: th.chainId,
              fee: 500000
            },
            th.Dapp.seed
          )
        )
      })

      describe('not organization user', () => {
        const invoker = th.Dummy
        const device = th.Device.address
        it('invoke', async () => {
          await th.txFail(
            Transactions.invokeScript(
              {
                dApp: th.Dapp.address,
                chainId: th.chainId,
                call: th.openAsOrgCall,
                payment: [],
                fee: 900000
              },
              invoker.seed
            ),
            'Not permitted by organization'
          )
        })

        it('no asset change', async () => {
          await th.balance.expectChange(invoker, 0)
        })

        it('device not opened', async () => {
          expect(await th.dappValueFor(`device_${device}`)).to.eq(Close)
          expect(await th.dappValueFor(`device_counter_${device}`)).to.eq(
            th.deviceActionsCount
          )
        })
      })

      describe('organization user', () => {
        const invoker = th.OrganizationUser
        const device = th.Device.address
        it('invoke', async () => {
          await th.txSuccess(
            Transactions.invokeScript(
              {
                dApp: th.Dapp.address,
                chainId: th.chainId,
                call: th.openAsOrgCall,
                payment: [],
                fee: 900000
              },
              invoker.seed
            )
          )
        })

        it('asset change', async () => {
          await th.balance.expectRise(invoker)
        })

        it('device opened', async () => {
          expect(await th.dappValueFor(`device_${device}`)).to.eq(Open)
          expect(await th.dappValueFor(`device_counter_${device}`)).to.eq(
            ++th.deviceActionsCount
          )
        })
      })

      describe('organization user - wrong mobileid', () => {
        const invoker = th.OrganizationUser
        const device = th.Device.address
        it('invoke', async () => {
          await th.txFail(
            Transactions.invokeScript(
              {
                dApp: th.Dapp.address,
                chainId: th.chainId,
                call: {
                  function: 'deviceActionAs',
                  args: [
                    { type: 'string', value: th.organizationKey },
                    { type: 'string', value: Open },
                    { type: 'string', value: th.Organization.address },
                    { type: 'string', value: 'wrongid' }
                  ]
                },
                payment: [],
                fee: 900000
              },
              invoker.seed
            ),
            'Id mismatch'
          )
        })

        it('device not opened', async () => {
          expect(await th.dappValueFor(`device_counter_${device}`)).to.eq(
            th.deviceActionsCount // no change
          )
        })
      })
      describe('organization user - no data for key', () => {
        const invoker = th.OrganizationUser
        const device = th.Device.address
        before('set user mobileid to not set', async () => {
          await th.txSuccess(
            Transactions.data(
              {
                data: [{ key: `user_${th.OrganizationUser.address}` }],
                chainId: th.chainId,
                fee: 500000
              },
              th.Organization.seed
            )
          )
        })

        it('invoke', async () => {
          await th.txFail(
            Transactions.invokeScript(
              {
                dApp: th.Dapp.address,
                chainId: th.chainId,
                call: {
                  function: 'deviceActionAs',
                  args: [
                    { type: 'string', value: th.organizationKey },
                    { type: 'string', value: Open },
                    { type: 'string', value: th.Organization.address },
                    { type: 'string', value: TESTID }
                  ]
                },
                payment: [],
                fee: 900000
              },
              invoker.seed
            ),
            'Not permitted by organization'
          )
        })

        it('device not opened', async () => {
          expect(await th.dappValueFor(`device_counter_${device}`)).to.eq(
            th.deviceActionsCount // no change
          )
        })
      })
      describe('organization user - key not set yet', () => {
        const invoker = th.OrganizationUser
        const device = th.Device.address
        before('set user mobileid to not set', async () => {
          await th.txSuccess(
            Transactions.data(
              {
                data: [
                  { key: `user_${th.OrganizationUser.address}`, value: '?' }
                ],
                chainId: th.chainId,
                fee: 500000
              },
              th.Organization.seed
            )
          )
        })

        it('invoke', async () => {
          await th.txFail(
            Transactions.invokeScript(
              {
                dApp: th.Dapp.address,
                chainId: th.chainId,
                call: {
                  function: 'deviceActionAs',
                  args: [
                    { type: 'string', value: th.organizationKey },
                    { type: 'string', value: Open },
                    { type: 'string', value: th.Organization.address },
                    { type: 'string', value: '?' }
                  ]
                },
                payment: [],
                fee: 900000
              },
              invoker.seed
            ),
            'Mobile id not set'
          )
        })

        it('device not opened', async () => {
          expect(await th.dappValueFor(`device_counter_${device}`)).to.eq(
            th.deviceActionsCount // no change
          )
        })
      })
      describe('organization user - admin', () => {
        const invoker = th.OrganizationUser
        const device = th.Device.address
        before('set user mobileid wildcard', async () => {
          await th.txSuccess(
            Transactions.data(
              {
                data: [
                  { key: `user_${th.OrganizationUser.address}`, value: '*' }
                ],
                chainId: th.chainId,
                fee: 500000
              },
              th.Organization.seed
            )
          )
        })

        it('invoke', async () => {
          await th.txSuccess(
            Transactions.invokeScript(
              {
                dApp: th.Dapp.address,
                chainId: th.chainId,
                call: {
                  function: 'deviceActionAs',
                  args: [
                    { type: 'string', value: th.organizationKey },
                    { type: 'string', value: Open },
                    { type: 'string', value: th.Organization.address },
                    { type: 'string', value: TESTID }
                  ]
                },
                payment: [],
                fee: 900000
              },
              invoker.seed
            )
          )
        })

        it('device opened', async () => {
          expect(await th.dappValueFor(`device_counter_${device}`)).to.eq(
            ++th.deviceActionsCount // no change
          )
        })
      })
    })
  })
}
export default OpenAsOrganization

import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import { IInvokeScriptCall } from '@waves/waves-transactions/dist/transactions'

const Open = 'open'
const Close = 'close'
const Active = 'active'

const OpenAsOrganization = (th: TestHelper) => {
  describe('OpenAsOrganization', () => {
    before('write user to organization data', async () => {
      await th.txSuccess(
        Transactions.data(
          {
            data: [
              { key: `user_${th.OrganizationUser.address}`, value: Active }
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
          { type: 'string', value: th.Organization.address }
        ]
      }

      //th.deviceActionsCount = parseInt(await th.dappValueFor(`device_counter_${th.Device.address}`))
      th.balance.setActual(th.OrganizationUser)
    })

    describe('not allowed organization', () => {
      const invoker = th.OrganizationUser
      const device = th.Device.address
      it('invoke', async () => {
        await th.txDappFail(
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
          await th.txDappFail(
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
    })
  })
}
export default OpenAsOrganization

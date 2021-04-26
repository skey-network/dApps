import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'

const USE_SECOND_NODE = true

const RemoveKeyFromOrg = (th: TestHelper) => {
  before('save token counts', async () => {
    await th.balance.setActual(th.Organization, th.organizationKey)
    await th.balance.setActual(th.Organization, th.secondOrgKey)
  })
  describe('remove key from organization', () => {
    describe('user tries to remove (not owned dev, not an issuer)', function () {
      const invoker = th.KeyOwner
      it('invoke', async () => {
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Organization.address,
              chainId: th.chainId,
              call: {
                function: 'removeKey',
                args: [{ type: 'string', value: th.organizationKey }]
              },
              payment: [],
              fee: invoker.invokeFee
            },
            invoker.seed
          ),
          'Not permitted'
        )
      })

      it('key not removed', async () => {
        expect(await th.hasNft(th.Organization, th.organizationKey)).to.be.eq(
          true
        )
      })
    })

    describe('supplier removes key', function () {
      const invoker = th.Dapp
      it('invoke', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Organization.address,
              chainId: th.chainId,
              call: {
                function: 'removeKey',
                args: [{ type: 'string', value: th.organizationKey }]
              },
              payment: [],
              fee: invoker.invokeFee
            },
            invoker.seed
          )
        )
      })

      it('key removed', async () => {
        expect(await th.hasNft(th.Organization, th.organizationKey)).to.be.eq(
          false
        )
      })
    })

    describe('dev owner removes key', function () {
      const invoker = th.DevOwner
      it('invoke', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Organization.address,
              chainId: th.chainId,
              call: {
                function: 'removeKey',
                args: [{ type: 'string', value: th.secondOrgKey }]
              },
              payment: [],
              fee: invoker.invokeFee
            },
            invoker.seed
          )
        )
      })

      it('key removed', async () => {
        expect(await th.hasNft(th.Organization, th.secondOrgKey)).to.be.eq(
          false
        )
      })
    })
  })
}
export default RemoveKeyFromOrg

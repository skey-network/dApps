import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import {
  IInvokeScriptCallStringArgument,
  TInvokeScriptCallArgument
} from '@waves/waves-transactions/dist/transactions'

const ACTIVE = 'active'

const DappAddsManyKeysToDevice = (th: TestHelper) => {
  describe('DappAddsManyKeysToDevice', () => {
    before('Generate list', async () => {
      th.keysForTest = new Array(80) as [string]
      for (let i = 0; i < 80; i++) {
        th.keysForTest[i] = th.makeid(44)
      }

      const args: TInvokeScriptCallArgument[] = [
        {
          type: 'list',
          value: th.keysForTest.map((x) => {
            return {
              type: 'string',
              value: x
            } as IInvokeScriptCallStringArgument
          })
        }
      ]

      th.addKeysCall = {
        function: 'addManyKeys',
        args: args
      }
    })

    after('Clean up list', () => {
      th.keysForTest = null
      th.addKeysCall = null
    })

    describe('random user tries to add keys', function () {
      it('invoke', async () => {
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Device.address,
              chainId: th.chainId,
              call: th.addKeysCall,
              payment: [],
              fee: 900000
            },
            th.Dummy.seed
          ),
          'Not permitted'
        )
      })

      it('no asset change', async () => {
        await th.balance.expectChange(th.Dummy, 0)
      })

      it('keys not added', async () => {
        for (let i = 0; i < 80; i++) {
          expect(
            await th.walletValueFor(th.Device, `key_${th.keysForTest[i]}`)
          ).to.eq(undefined)
        }
      })
    })

    describe('add keys', function () {
      it('invoke', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Device.address,
              chainId: th.chainId,
              call: th.addKeysCall,
              payment: [],
              fee: 900000
            },
            th.Dapp.seed
          )
        )
      })

      it('keys added', async () => {
        for (let i = 0; i < 80; i++) {
          expect(
            await th.walletValueFor(th.Device, `key_${th.keysForTest[i]}`)
          ).to.eq(ACTIVE)
        }
      })
    })
  })
}
export default DappAddsManyKeysToDevice

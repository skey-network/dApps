import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import DappsErrors from '../dapps_errors'

const CLOSE = 'close'
const ACTIVE = 'active'
const INACTIVE = 'inactive'

const DappRemovesKey = (th: TestHelper) => {
  describe('DappRemovesKey', () => {
    describe('not an owner/dapp', function () {
      it('invoke', async () => {
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Device.address,
              chainId: th.chainId,
              call: {
                function: 'removeKey',
                args: [{ type: 'string', value: th.deviceKey }]
              },
              payment: [],
              fee: 900000
            },
            th.Dummy.seed
          ),
          DappsErrors.device.ENotPermitted
        )
      })

      it('key not removed', async () => {
        expect(
          await th.walletValueFor(th.Device, `key_${th.deviceKey}`)
        ).to.not.eq(undefined)
      })
    })

    describe('removes key', function () {
      it('invoke', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Device.address,
              chainId: th.chainId,
              call: {
                function: 'removeKey',
                args: [{ type: 'string', value: th.deviceKey }]
              },
              payment: [],
              fee: 900000
            },
            th.Dapp.seed
          )
        )
      })

      it('key banned', async () => {
        expect(await th.walletValueFor(th.Device, `key_${th.deviceKey}`)).to.eq(
          INACTIVE
        )
      })
    })

    describe('removed key cant open device', function () {
      const invoker = th.Dummy
      it('invoke', async () => {
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call: {
                function: 'deviceAction',
                args: [
                  { type: 'string', value: th.deviceKey },
                  { type: 'string', value: 'open' }
                  // { type: "string", value: invoker.address},
                ]
              },
              payment: [],
              fee: 500000
            },
            invoker.seed
          ),
          DappsErrors.supplier.EKeyNotWhitelisted
        )
      })

      it('asset recharged', async () => {
        await th.balance.expectChange(th.Dummy, 0)
      })

      it('device opened', async () => {
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(
          CLOSE
        )
        expect(
          await th.dappValueFor(`device_counter_${th.Device.address}`)
        ).to.eq(th.deviceActionsCount)
      })
    })
  })
}
export default DappRemovesKey

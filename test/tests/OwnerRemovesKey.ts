import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import DappsErrors from '../dapps_errors'

const INACTIVE = 'inactive'

const OwnerRemovesKey = (th: TestHelper) => {
  describe('OwnerRemovesKey', () => {
    describe('not an owner/dapp', function () {
      it('invoke', async () => {
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Device.address,
              chainId: th.chainId,
              call: {
                function: 'removeKey',
                args: [{ type: 'string', value: th.expiredDeviceKey }]
              },
              payment: [],
              fee: 500000
            },
            th.Dummy.seed
          ),
          DappsErrors.device.ENotPermitted
        )
      })

      it('key not removed', async () => {
        expect(
          await th.walletValueFor(th.Device, `key_${th.expiredDeviceKey}`)
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
                args: [{ type: 'string', value: th.expiredDeviceKey }]
              },
              payment: [],
              fee: 500000
            },
            th.DevOwner.seed
          )
        )
      })

      it('key removed', async () => {
        expect(
          await th.walletValueFor(th.Device, `key_${th.expiredDeviceKey}`)
        ).to.eq(undefined)
      })
    })

    describe('cant remove banned', () => {
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
              fee: 500000
            },
            th.DevOwner.seed
          ),
          DappsErrors.device.ENotPermitted
        )
      })

      it('key not removed', async () => {
        expect(await th.walletValueFor(th.Device, `key_${th.deviceKey}`)).to.eq(
          INACTIVE
        )
      })
    })
  })
}
export default OwnerRemovesKey

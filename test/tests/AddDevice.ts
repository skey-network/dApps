import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import { IInvokeScriptCall } from '@waves/waves-transactions/dist/transactions'

const CLOSE = 'close'

const AddDevice = (th: TestHelper) => {
  describe('AddDevice', () => {
    before('write device data', async () => {
      await th.txSuccess(
        Transactions.data(
          {
            data: [
              { key: 'owner', value: th.DevOwner.address },
              { key: 'supplier', value: th.Dapp.address },
              { key: 'key_price', value: th.keyPrice },
              { key: 'type', value: 'testDev' },
              { key: 'active', value: true },
              { key: 'connected', value: true }
            ],
            chainId: th.chainId,
            fee: 500000
          },
          th.Device.seed
        )
      )

      await th.deployDevice(th.Device.seed)

      th.addDeviceCall = {
        function: 'addDevice',
        args: [{ type: 'string', value: th.Device.address }]
      }
    })

    describe('adds device', () => {
      it('invoke', async () => {
        await th.txSuccess(
          Transactions.data(
            {
              data: [
                { key: `device_${th.Device.address}`, value: CLOSE },
                { key: `device_counter_${th.Device.address}`, value: 0 }
              ],
              chainId: th.chainId,
              fee: 500000
            },
            th.Dapp.seed
          )
        )
      })

      it('device added', async () => {
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(
          CLOSE
        )
        expect(
          await th.dappValueFor(`device_counter_${th.Device.address}`)
        ).to.eq(0)
      })
    })
  })
}
export default AddDevice

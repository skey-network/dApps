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
              { key: 'dapp', value: th.Dapp.address },
              { key: 'key_price', value: th.keyPrice },
              { key: 'type', value: 'testDev' }
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

    describe('not a dapp', () => {
      it('invoke', async () => {
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call: th.addDeviceCall,
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

      it('device not added', async () => {
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(
          undefined
        )
        expect(
          await th.dappValueFor(`device_counter_${th.Device.address}`)
        ).to.eq(undefined)
      })
    })

    describe('adds device', () => {
      it('invoke', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call: th.addDeviceCall,
              payment: [],
              fee: 900000
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

    describe('same device second time', () => {
      it('invoke', async () => {
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call: th.addDeviceCall,
              payment: [],
              fee: 900000
            },
            th.Dapp.seed
          ),
          'Device already added'
        )
      })
    })
  })
}
export default AddDevice

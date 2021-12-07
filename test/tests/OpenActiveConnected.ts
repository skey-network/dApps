import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import DappsErrors from '../dapps_errors'

const CLOSE = 'close'
const OPEN = 'open'
const USE_SECOND_NODE = true
const ACTIVE = 'active'
const CONNECTED = 'connected'

const OpenActiveConnected = (th: TestHelper) => {
  describe('OpenActiveConnected', function () {
    after(async () => {
      await th.txSuccess(
        Transactions.data(
          {
            data: [
              { key: ACTIVE, value: true },
              { key: CONNECTED, value: true }
            ],
            chainId: th.chainId,
            fee: 500000
          },
          th.Device.seed
        )
      )
      console.log('#############################')
    })
    describe('cant open inactive', function () {
      before(async () => {
        await th.txSuccess(
          Transactions.data(
            {
              data: [
                { key: ACTIVE, value: false },
                { key: CONNECTED, value: true }
              ],
              chainId: th.chainId,
              fee: 500000
            },
            th.Device.seed
          )
        )
      })

      const invoker = th.KeyOwner
      it('invoke', async () => {
        await th.txFail(
          th.buildInvokeTx(th.Dapp, invoker, 'deviceAction', [
            { type: 'string', value: th.deviceKey },
            { type: 'string', value: 'open' }
          ]),
          DappsErrors.supplier.EDeviceNotActive
        )
      })

      it('asset not recharged - not changed', async () => {
        await th.balance.expectChange(invoker, 0)
      })

      it('device not opened', async () => {
        // expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq( //device status was open, check only counter
        //   CLOSE
        // )
        expect(
          await th.dappValueFor(`device_counter_${th.Device.address}`)
        ).to.eq(th.deviceActionsCount)
      })
    })
    describe('cant open not connected', function () {
      before(async () => {
        await th.txSuccess(
          Transactions.data(
            {
              data: [
                { key: ACTIVE, value: true },
                { key: CONNECTED, value: false }
              ],
              chainId: th.chainId,
              fee: 500000
            },
            th.Device.seed
          )
        )
      })

      const invoker = th.KeyOwner
      it('invoke', async () => {
        await th.txFail(
          th.buildInvokeTx(th.Dapp, invoker, 'deviceAction', [
            { type: 'string', value: th.deviceKey },
            { type: 'string', value: 'open' }
          ]),
          DappsErrors.supplier.EDeviceNotConnected
        )
      })

      it('asset not recharged - not changed', async () => {
        await th.balance.expectChange(invoker, 0)
      })

      it('device not opened', async () => {
        // expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(
        //   CLOSE
        // )
        expect(
          await th.dappValueFor(`device_counter_${th.Device.address}`)
        ).to.eq(th.deviceActionsCount)
      })
    })
  })
}

export default OpenActiveConnected

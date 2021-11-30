import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'

const CLOSE = 'close'
const OPEN = 'open'
const USE_SECOND_NODE = true

const Close = (th: TestHelper) => {
  describe('Close', () => {
    describe('not owned key', function () {
      const invoker = th.DevOwner
      it('invoke', async () => {
        await th.txFail(
          th.buildInvokeTx(th.Dapp, invoker, 'deviceAction', [
            { type: 'string', value: th.deviceKey },
            { type: 'string', value: 'close' }
          ]),
          'Key not owned'
        )
      })

      it('device not closed', async () => {
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(OPEN)
        expect(
          await th.dappValueFor(`device_counter_${th.Device.address}`)
        ).to.eq(th.deviceActionsCount)
      })
    })

    describe('not a key', function () {
      const invoker = th.DevOwner
      it('invoke', async () => {
        await th.txFail(
          th.buildInvokeTx(th.Dapp, invoker, 'deviceAction', [
            { type: 'string', value: th.userNft },
            { type: 'string', value: 'close' }
          ]),
          'Wrong key issuer'
        )
      })

      it('device not closed', async () => {
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(OPEN)
        expect(
          await th.dappValueFor(`device_counter_${th.Device.address}`)
        ).to.eq(th.deviceActionsCount)
      })
    })

    describe('key closes device (second node)', function () {
      const invoker = th.KeyOwner
      it('invoke', async () => {
        await th.txSuccess(
          th.buildInvokeTx(th.Dapp, invoker, 'deviceAction', [
            { type: 'string', value: th.deviceKey },
            { type: 'string', value: 'close' }
          ]),
          USE_SECOND_NODE
        )
        await th.delay(4000)
      })

      it('device closed', async () => {
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(
          CLOSE
        )
        expect(
          await th.dappValueFor(`device_counter_${th.Device.address}`)
        ).to.eq(++th.deviceActionsCount)
      })

      it('device closed (second node)', async () => {
        expect(
          await th.dappValueFor(`device_${th.Device.address}`, USE_SECOND_NODE)
        ).to.eq(CLOSE)
        expect(
          await th.dappValueFor(
            `device_counter_${th.Device.address}`,
            USE_SECOND_NODE
          )
        ).to.eq(th.deviceActionsCount)
      })
    })
  })
}
export default Close

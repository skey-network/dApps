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
        await th.txDappFail(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call: {
                function: 'deviceAction',
                args: [
                  { type: 'string', value: th.deviceKey },
                  { type: 'string', value: 'close' }
                  // { type: "string", value: invoker.address},
                ]
              },
              payment: [],
              fee: 500000
            },
            invoker.seed
          ),
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
        await th.txDappFail(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call: {
                function: 'deviceAction',
                args: [
                  { type: 'string', value: th.userNft },
                  { type: 'string', value: 'close' }
                  // { type: "string", value: invoker.address},
                ]
              },
              payment: [],
              fee: 500000
            },
            invoker.seed
          ),
          'Not a device key'
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
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call: {
                function: 'deviceAction',
                args: [
                  { type: 'string', value: th.deviceKey },
                  { type: 'string', value: 'close' }
                  // { type: "string", value: invoker.address},
                ]
              },
              payment: [],
              fee: 500000
            },
            invoker.seed
          ),
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

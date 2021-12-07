import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import DappsErrors from '../dapps_errors'

const CLOSE = 'close'
const OPEN = 'open'
const USE_SECOND_NODE = true

const Open = (th: TestHelper) => {
  before('save token counts', async () => {
    await th.balance.setActual(th.Dummy)
    await th.balance.setActual(th.KeyOwner)
    await th.balance.setActual(th.DevOwner)
  })
  describe('open', () => {
    describe('not owned key', function () {
      const invoker = th.DevOwner
      it('invoke', async () => {
        await th.txFail(
          th.buildInvokeTx(th.Dapp, invoker, 'deviceAction', [
            { type: 'string', value: th.deviceKey },
            { type: 'string', value: 'open' }
          ]),
          DappsErrors.supplier.EKeyNotOwned
        )
      })

      it('asset not recharged?', async () => {
        await th.balance.expectFall(invoker)
      })

      it('device not opened', async () => {
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(
          CLOSE
        )
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
            { type: 'string', value: 'open' }
          ]),
          DappsErrors.supplier.EWrongKeyIssuer
        )
      })

      it('asset not recharged - not changed', async () => {
        await th.balance.expectChange(invoker, 0)
      })

      it('device not opened', async () => {
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(
          CLOSE
        )
        expect(
          await th.dappValueFor(`device_counter_${th.Device.address}`)
        ).to.eq(th.deviceActionsCount)
      })
    })

    describe('expired key cant open device', function () {
      const invoker = th.KeyOwner
      it('invoke', async () => {
        await th.txFail(
          th.buildInvokeTx(th.Dapp, invoker, 'deviceAction', [
            { type: 'string', value: th.expiredDeviceKey },
            { type: 'string', value: 'open' }
          ]),
          DappsErrors.supplier.EKeyExpired
        )
      })

      it('asset not recharged - not changed', async () => {
        await th.balance.expectChange(invoker, 0)
      })

      it('device not opened', async () => {
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(
          CLOSE
        )
        expect(
          await th.dappValueFor(`device_counter_${th.Device.address}`)
        ).to.eq(th.deviceActionsCount)
      })
    })

    describe('key opens device (second node)', function () {
      const invoker = th.KeyOwner
      it('invoke', async () => {
        await th.txSuccess(
          th.buildInvokeTx(th.Dapp, invoker, 'deviceAction', [
            { type: 'string', value: th.deviceKey },
            { type: 'string', value: 'open' }
          ]),
          USE_SECOND_NODE
        )
      })

      it('asset recharged', async () => {
        await th.balance.expectRise(invoker)
      })

      it('device opened', async () => {
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(OPEN)
        expect(
          await th.dappValueFor(`device_counter_${th.Device.address}`)
        ).to.eq(++th.deviceActionsCount)
      })

      it('device opened (second node)', async () => {
        expect(
          await th.dappValueFor(`device_${th.Device.address}`, USE_SECOND_NODE)
        ).to.eq(OPEN)
        expect(
          await th.dappValueFor(
            `device_counter_${th.Device.address}`,
            USE_SECOND_NODE
          )
        ).to.eq(th.deviceActionsCount)
      })
    })

    describe('(for listener)', function () {
      const invoker = th.Dapp
      it('invoke', async () => {
        await th.txSuccess(
          th.buildInvokeTx(th.Dapp, invoker, 'deviceAction', [
            { type: 'string', value: th.silentKey },
            { type: 'string', value: 'open' }
          ])
        )
      })
      it('device opened', async () => {
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(OPEN)
        expect(
          await th.dappValueFor(`device_counter_${th.Device.address}`)
        ).to.eq(++th.deviceActionsCount)
      })
    })
  })
}
export default Open

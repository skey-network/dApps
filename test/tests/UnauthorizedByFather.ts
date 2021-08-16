import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'

const ACTIVE = 'active'
const HOUR_IN_TS = 3600000
const OPEN = 'open'
const CLOSE = 'close'

const UnauthorizedByFather = (th: TestHelper) => {
  const selected = th.unauthorizedByFather

  describe('UnauthorizedByFather', () => {
    before('setup key by dapp', async () => {
      // create key by dapp
      selected.deviceKey = await th.createKey(
        'Device key',
        selected.Device,
        selected.Dapp
      )

      // add right key call
      th.addDeviceKeyCall = {
        function: 'addKey',
        args: [{ type: 'string', value: selected.deviceKey }]
      }
      th.balance.setActual(selected.KeyOwner)
    })

    describe('AddDevice', () => {
      it('write device data', async () => {
        await th.txSuccess(
          Transactions.data(
            {
              data: [
                { key: 'owner', value: selected.KeyOwner.address },
                { key: 'supplier', value: selected.Dapp.address },
                { key: 'key_price', value: th.keyPrice },
                { key: 'type', value: 'testDev' },
                { key: 'active', value: true },
                { key: 'connected', value: true }
              ],
              chainId: th.chainId,
              fee: 500000
            },
            selected.Device.seed
          )
        )
      })
      it('deploy script', async () => {
        await th.deployDevice(selected.Device.seed)
      })

      describe('adds device', () => {
        it('invoke', async () => {
          await th.txSuccess(
            Transactions.data(
              {
                data: [
                  { key: `device_${selected.Device.address}`, value: CLOSE },
                  { key: `device_counter_${selected.Device.address}`, value: 0 }
                ],
                chainId: th.chainId,
                fee: 500000
              },
              selected.Dapp.seed
            )
          )
        })

        it('device added', async () => {
          expect(
            await th.walletValueFor(
              selected.Dapp,
              `device_${selected.Device.address}`
            )
          ).to.eq(CLOSE)
          expect(
            await th.walletValueFor(
              selected.Dapp,
              `device_counter_${selected.Device.address}`
            )
          ).to.eq(0)
        })
      })
    })

    describe('add key', function () {
      it('invoke', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: selected.Device.address,
              chainId: th.chainId,
              call: {
                function: 'addKey',
                args: [{ type: 'string', value: selected.deviceKey }]
              },
              payment: [],
              fee: 900000
            },
            selected.Dapp.seed
          )
        )
      })

      it('key added', async () => {
        expect(
          await th.walletValueFor(selected.Device, `key_${selected.deviceKey}`)
        ).to.eq(ACTIVE)
      })
    })

    // for next test
    it('transfer created key', async () => {
      th.sendKey(selected.deviceKey, selected.Dapp, selected.KeyOwner)
    })

    describe('key opens device, no recharge', function () {
      const invoker = selected.KeyOwner
      it('invoke', async () => {
        await th.txSuccess(
          th.buildInvokeTx(selected.Dapp, invoker, 'deviceAction', [
            { type: 'string', value: selected.deviceKey },
            { type: 'string', value: 'open' }
          ])
        )
      })

      it('asset not recharged', async () => {
        await th.balance.expectFall(invoker)
      })

      it('device opened', async () => {
        expect(
          await th.walletValueFor(
            selected.Dapp,
            `device_${selected.Device.address}`
          )
        ).to.eq(OPEN)
      })
    })
  })
}
export default UnauthorizedByFather

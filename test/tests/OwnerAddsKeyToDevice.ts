import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import { IInvokeScriptCall } from '@waves/waves-transactions/dist/transactions'
import { keyPair } from '@waves/ts-lib-crypto'
import DappsErrors from '../dapps_errors'

const ACTIVE = 'active'
const INACTIVE = 'inactive'
const CLOSE = 'close'
const OPEN = 'open'
const USE_SECOND_NODE = true

const OwnerAddsKeyToDevice = (th: TestHelper) => {
  describe('OwnerAddsKeyToDevice', () => {
    before('setup', async () => {
      // add right key call
      th.addDeviceKeyCall = {
        function: 'addKey',
        args: [{ type: 'string', value: th.requestedDeviceKey }]
      }
      await th.delay(4000)
    })

    describe('wrong token issuer', function () {
      it('invoke', async () => {
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Device.address,
              chainId: th.chainId,
              call: {
                function: 'addKey',
                args: [{ type: 'string', value: th.userNft }]
              },
              payment: [],
              fee: 500000
            },
            th.DevOwner.seed
          ),
          DappsErrors.device.EWrongKeyIssuer
        )
      })

      it('key not added', async () => {
        expect(await th.walletValueFor(th.Device, `key_${th.userNft}`)).to.eq(
          undefined
        )
      })
    })

    describe('not owned device', function () {
      it('invoke', async () => {
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Device.address,
              chainId: th.chainId,
              call: th.addDeviceKeyCall,
              payment: [],
              fee: 500000
            },
            th.Dummy.seed
          ),
          DappsErrors.device.ENotPermitted
        )
      })

      it('key not added', async () => {
        expect(
          await th.walletValueFor(th.Device, `key_${th.requestedDeviceKey}`)
        ).to.eq(undefined)
      })
    })

    describe('banned key', function () {
      it('invoke', async () => {
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Device.address,
              chainId: th.chainId,
              call: {
                function: 'addKey',
                args: [{ type: 'string', value: th.deviceKey }]
              },
              payment: [],
              fee: 500000
            },
            th.DevOwner.seed
          ),
          DappsErrors.device.EBannedKey
        )
      })

      it('key not added', async () => {
        expect(await th.walletValueFor(th.Device, `key_${th.deviceKey}`)).to.eq(
          INACTIVE
        )
      })
    })

    describe('add key', function () {
      it('invoke', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Device.address,
              chainId: th.chainId,
              call: th.addDeviceKeyCall,
              payment: [],
              fee: 500000
            },
            th.DevOwner.seed
          )
        )
      })

      it('key added', async () => {
        expect(
          await th.walletValueFor(th.Device, `key_${th.requestedDeviceKey}`)
        ).to.eq(ACTIVE)
      })
    })

    describe('key opens device (second node)', function () {
      let openCount
      before(async () => {
        openCount = await th.dappValueFor(`device_counter_${th.Device.address}`)
        await th.txSuccess(
          Transactions.data(
            {
              data: [
                { key: `device_${th.Device.address}`, value: CLOSE } // make sure device was closed
              ],
              chainId: th.chainId,
              fee: 500000
            },
            th.Dapp.seed
          ),
          USE_SECOND_NODE
        )
      })

      const invoker = th.DevOwner
      it('invoke', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call: {
                function: 'deviceAction',
                args: [
                  { type: 'string', value: th.requestedDeviceKey },
                  { type: 'string', value: 'open' }
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
      })

      // it('asset recharged', async()=>{
      //   await th.balance.expectRise(invoker)
      // })

      it('device opened', async () => {
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(OPEN)
        expect(
          await th.dappValueFor(`device_counter_${th.Device.address}`)
        ).to.eq(openCount + 1)
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
        ).to.eq(openCount + 1)
      })
    })
  })
}
export default OwnerAddsKeyToDevice

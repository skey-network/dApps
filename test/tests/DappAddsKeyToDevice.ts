import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import DappsErrors from '../dapps_errors'

const ACTIVE = 'active'
const HOUR_IN_TS = 3600000

const DappAddsKeyToDevice = (th: TestHelper) => {
  describe('DappAddsKeyToDevice', () => {
    before('setup key by dapp', async () => {
      // create key by dapp
      th.deviceKey = await th.createKey('Device key', th.Device, th.Dapp)
      th.expiredDeviceKey = await th.createKey(
        'Exp Dev key',
        th.Device,
        th.Dapp,
        Date.now() - th.keyDuration * HOUR_IN_TS
      )
      th.organizationKey = await th.createKey('OrgKey', th.Device, th.Dapp)
      th.secondOrgKey = await th.createKey('2NdOrgKey', th.Device, th.Dapp)
      th.silentKey = await th.createKey('TestSilent', th.Device, th.Dapp)
      th.userNft = await th.createKey('TestFakeKey', th.Device, th.DevOwner)

      // add right key call
      th.addDeviceKeyCall = {
        function: 'addKey',
        args: [{ type: 'string', value: th.deviceKey }]
      }
    })

    describe('random user tries to add key', function () {
      it('invoke', async () => {
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Device.address,
              chainId: th.chainId,
              call: th.addDeviceKeyCall,
              payment: [],
              fee: 900000
            },
            th.Dummy.seed
          ),
          DappsErrors.device.ENotPermitted
        )
      })

      it('no asset change', async () => {
        await th.balance.expectChange(th.Dummy, 0)
      })

      it('key not added', async () => {
        expect(await th.dappValueFor(`key_${th.userNft}`)).to.eq(undefined)
      })
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
              fee: 900000
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
              call: {
                function: 'addKey',
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

      it('key not added', async () => {
        expect(await th.walletValueFor(th.Device, `key_${th.userNft}`)).to.eq(
          undefined
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
              fee: 900000
            },
            th.Dapp.seed
          )
        )
      })

      it('key added', async () => {
        expect(await th.walletValueFor(th.Device, `key_${th.deviceKey}`)).to.eq(
          ACTIVE
        )
      })
    })

    describe('add organization key', function () {
      it('invoke', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Device.address,
              chainId: th.chainId,
              call: {
                function: 'addKey',
                args: [{ type: 'string', value: th.organizationKey }]
              },
              payment: [],
              fee: 900000
            },
            th.Dapp.seed
          )
        )
      })

      it('key added', async () => {
        expect(
          await th.walletValueFor(th.Device, `key_${th.organizationKey}`)
        ).to.eq(ACTIVE)
      })
    })

    describe('add silent key', function () {
      it('invoke', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Device.address,
              chainId: th.chainId,
              call: {
                function: 'addKey',
                args: [{ type: 'string', value: th.silentKey }]
              },
              payment: [],
              fee: 900000
            },
            th.Dapp.seed
          )
        )
      })

      it('key added', async () => {
        expect(await th.walletValueFor(th.Device, `key_${th.silentKey}`)).to.eq(
          ACTIVE
        )
      })
    })

    describe('add expired key', function () {
      it('invoke', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Device.address,
              chainId: th.chainId,
              call: {
                function: 'addKey',
                args: [{ type: 'string', value: th.expiredDeviceKey }]
              },
              payment: [],
              fee: 900000
            },
            th.Dapp.seed
          )
        )
      })

      it('key added', async () => {
        expect(
          await th.walletValueFor(th.Device, `key_${th.expiredDeviceKey}`)
        ).to.eq(ACTIVE)
      })
    })

    // for next test
    after('transfer created keys', async () => {
      th.sendKey(th.deviceKey, th.Dapp, th.KeyOwner)
      th.sendKey(th.expiredDeviceKey, th.Dapp, th.KeyOwner)
      th.sendKey(th.organizationKey, th.Dapp, th.Organization)
      th.sendKey(th.secondOrgKey, th.Dapp, th.Organization)
    })
  })
}
export default DappAddsKeyToDevice

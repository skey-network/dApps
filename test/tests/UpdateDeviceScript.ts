import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import * as fs from 'fs'

const UpdateDeviceScript = (th: TestHelper) => {
  describe('UpdateDeviceScript', () => {
    before('write device data', async () => {
      await th.txSuccess(
        Transactions.data(
          {
            data: [
              {
                key: 'updater_public_key'
              }
            ],
            chainId: th.chainId,
            fee: 900000
          },
          th.Device.seed
        )
      )
      // expect(await th.walletValueFor(th.Device, `test_key_to_rem`)).to.eq(
      //   '40'
      // )
    })
    describe('updater public key not set', async () => {
      it('cant update', async () => {
        await th.txFailFullMsg(
          Transactions.setScript(
            {
              script: fs.readFileSync('./compiled/device.txt').toString(),
              chainId: th.chainId,
              fee: 1400000,
              senderPublicKey: th.Device.publicKey
            },
            th.Dapp.seed
          ),
          'Transaction is not allowed by account-script'
        )
      })
    })
    describe('updater public key set', async () => {
      before('write device data', async () => {
        await th.txSuccess(
          Transactions.data(
            {
              data: [
                {
                  key: 'updater_public_key',
                  value: th.Dapp.publicKey,
                  type: 'string'
                }
              ],
              chainId: th.chainId,
              fee: 900000
            },
            th.Device.seed
          )
        )
        // expect(await th.walletValueFor(th.Device, `test_key_to_rem`)).to.eq(
        //   '40'
        // )
      })

      it('other account cant update', async () => {
        await th.txFailFullMsg(
          Transactions.setScript(
            {
              script: fs.readFileSync('./compiled/device.txt').toString(),
              chainId: th.chainId,
              fee: 1400000,
              senderPublicKey: th.Device.publicKey
            },
            th.Dummy.seed
          ),
          'Transaction is not allowed by account-script'
        )
      })

      it('can update', async () => {
        await th.txSuccess(
          Transactions.setScript(
            {
              script: fs.readFileSync('./compiled/device.txt').toString(),
              chainId: th.chainId,
              fee: 1400000,
              senderPublicKey: th.Device.publicKey
            },
            th.Dapp.seed
          )
        )
      })
    })
  })
}
export default UpdateDeviceScript

import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import { IInvokeScriptCall } from '@waves/waves-transactions/dist/transactions'
import { keyPair } from '@waves/ts-lib-crypto'

const OwnerRequestsKey = (th: TestHelper) => {
  describe('OwnerRequestsKey', () => {
    before('setup', async () => {
      // charge dev owner so he can buy key
      const params = {
        chainId: th.chainId.charCodeAt(0),
        fee: 1000000,
        transfers: [{ amount: 100000000, recipient: th.DevOwner.address }]
      }

      let tx = await th.txSuccess(
        Transactions.massTransfer(params, th.Bank.seed)
      )

      th.requestKeyCall = {
        function: 'requestKey',
        args: [
          { type: 'string', value: th.Device.address },
          { type: 'integer', value: th.keyDuration }
        ]
      }
    })

    // describe('TODO wrong payment asset', function(){
    //   // it('invoke', async ()=>{
    //   //   await th.txFail(Transactions.invokeScript({
    //   //     dApp: th.Dapp.address,
    //   //     chainId: th.chainId,
    //   //     call:th.requestKeyCall,
    //   //     payment: [{amount: th.keyPrice, assetId: null}],
    //   //     fee: 500000,

    //   // },th.DevOwner.seed), 'wrong asset, supported only xyz')
    //   // })

    //   // it('no asset change', async ()=>{
    //   //   await th.balance.expectChange(th.DevOwner,0)
    //   // })

    //   // it('no key transfered', async ()=>{
    //   //   expect((await th.getNftFrom(th.DevOwner, th.Dapp)).length).to.eq(0)
    //   // })
    // })

    describe('wrong payment amounts', function () {
      let nftCount

      it('invoke', async () => {
        nftCount = (await th.getNftFrom(th.DevOwner, th.Dapp)).length
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call: th.requestKeyCall,
              payment: [
                { amount: th.keyPrice * th.keyDuration - 5, assetId: null }
              ],
              fee: 500000
            },
            th.DevOwner.seed
          ),
          'wrong payment value, expected ' + th.keyPrice * th.keyDuration
        )
      })

      // it('no asset change', async ()=>{
      //   await th.balance.expectChange(th.DevOwner,0)
      // })

      it('had no keys', async () => {
        expect(nftCount).to.eq(0)
      })

      it('no key transfered', async () => {
        expect((await th.getNftFrom(th.DevOwner, th.Dapp)).length).to.eq(
          nftCount
        )
      })
    })

    describe('not owned device', function () {
      let nftCount
      before('', async () => th.balance.setActual(th.Dummy))

      it('invoke', async () => {
        nftCount = (await th.getNftFrom(th.Dummy, th.Dapp)).length
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call: th.requestKeyCall,
              payment: [
                { amount: th.keyPrice * th.keyDuration, assetId: null }
              ],
              fee: 500000
            },
            th.Dummy.seed
          ),
          'Not permitted'
        )
      })

      it('no asset change', async () => {
        await th.balance.expectChange(th.Dummy, 0)
      })

      it('no key transfered', async () => {
        expect((await th.getNftFrom(th.Dummy, th.Dapp)).length).to.eq(nftCount)
      })
    })

    describe('request key', function () {
      before('', async () => th.balance.setActual(th.DevOwner))

      it('invoke', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call: th.requestKeyCall,
              payment: [
                { amount: th.keyPrice * th.keyDuration, assetId: null }
              ],
              fee: 500000
            },
            th.DevOwner.seed
          )
        )
      })

      it('asset change', async () => {
        await th.balance.expectChange(
          th.DevOwner,
          -th.keyPrice * th.keyDuration - 500000 /*fee*/
        )
      })

      //get key from wallet?
      it('key transfered', async () => {
        expect((await th.getNftFrom(th.DevOwner, th.Dapp)).length).to.eq(1)
      })
    })

    after('transfer created key', async () => {
      th.requestedDeviceKey = (await th.getNftFrom(th.DevOwner, th.Dapp))[0]
      console.log('\t\trequested key id: ' + th.requestedDeviceKey)
      await th.txSuccess(
        Transactions.transfer(
          {
            chainId: th.chainId,
            amount: 1,
            assetId: th.requestedDeviceKey,
            fee: 100000,

            recipient: th.DevOwner.address
          },
          th.DevOwner.seed // transfer from dapp as was not transfered to device owner
        )
      )
    })
  })
}
export default OwnerRequestsKey

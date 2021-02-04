import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import { IInvokeScriptCall } from '@waves/waves-transactions/dist/transactions'
import { keyPair } from '@waves/ts-lib-crypto'

const KeyOwnerTransfersKey = (th:TestHelper)=>{
  describe('KeyOwnerTransfersKey', ()=>{
    before ('setup', async ()=>{
      // setup wws count for dev owner, to check if it will be refilled
      const params = {
        chainId: th.chainId.charCodeAt(0),
        fee: 1000000,
        transfers: [
            {amount: th.rechargeLimit/2, recipient: th.Dapp.address},
          ]
      } 
    
      await th.txSuccess(Transactions.massTransfer(params, th.KeyOwner.seed))

      th.transferKeyCall ={
        function:"transferKey",
        args:[
          { type: "string", value: th.Dummy.address}
        ]
      }
    })

    describe('not issued by dapp', function(){
      before('',async ()=> th.balance.setActual(th.DevOwner))
      before('',async ()=> th.balance.setActual(th.Dummy))

      it('invoke', async ()=>{
        await th.txDappFail(Transactions.invokeScript({
          dApp: th.Dapp.address,
          chainId: th.chainId,
          call:th.transferKeyCall,
          payment: [{amount: 1, assetId: th.userNft}],
          fee: 500000
      },th.DevOwner.seed),"wrong asset issuer")
      })

      it('no \'owner\' asset change', async ()=>{
        await th.balance.expectChange(th.DevOwner, 0)    
      })

      it('no dummy asset change', async ()=>{
        await th.balance.expectChange(th.Dummy,0)    
      })
    
      it('key not transfered', async ()=>{
        expect((await th.getNftFrom(th.Dummy, th.Dapp)).length).to.eq(0)
      })
    })


    describe('sends key', function(){
      before('',async ()=> th.balance.setActual(th.KeyOwner))
      before('',async ()=> th.balance.setActual(th.Dummy))

      it('invoke', async ()=>{
        await th.txSuccess(Transactions.invokeScript({
          dApp: th.Dapp.address,
          chainId: th.chainId,
          call:th.transferKeyCall,
          payment: [{amount: 1, assetId: th.deviceKey}],
          fee: 500000
      },th.KeyOwner.seed))
      })

      it('owner asset change', async ()=>{
        await th.balance.expectRise(th.KeyOwner)    
      })

      it('dummy asset change', async ()=>{
        await th.balance.expectRise(th.Dummy)    
      })
    
      it('key transfered', async ()=>{
        expect((await th.getNftFrom(th.Dummy, th.Dapp)).length).to.eq(1)
      })
    })
  })
}
export default KeyOwnerTransfersKey
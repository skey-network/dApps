import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import { IInvokeScriptCall } from '@waves/waves-transactions/dist/transactions'
import { keyPair } from '@waves/ts-lib-crypto'

const ACTIVE="active"

const OwnerAddsKeyToDevice = (th:TestHelper)=>{
  describe('OwnerAddsKeyToDevice', ()=>{
    before ('setup', async ()=>{
      // add right key call
      th.addDeviceKeyCall ={
        function:"addKey",
        args:[
          { type: "string", value: th.requestedDeviceKey},
        ]
      }
    })

    describe('wrong token issuer', function(){
      it('invoke', async ()=>{
        await th.txDappFail(Transactions.invokeScript({
          dApp: th.Device.address,
          chainId: th.chainId,
          call: {
            function:"addKey",
            args:[
              { type: "string", value: th.userNft},
            ]
          },
          payment: [],
          fee: 500000,
          
      },th.DevOwner.seed), "Wrong key issuer")
      })
    
      it('key not added', async ()=>{
        expect(await th.walletValueFor(th.Device,`key_${th.userNft}`)).to.eq(undefined)
      })
    })

    describe('not owned device', function(){
      it('invoke', async ()=>{
        await th.txDappFail(Transactions.invokeScript({
          dApp: th.Device.address,
          chainId: th.chainId,
          call: th.addDeviceKeyCall,
          payment: [],
          fee: 500000,
          
      },th.Dummy.seed), 'Not permitted')
      })
    
      it('key not added', async ()=>{
        expect(await th.walletValueFor(th.Device,`key_${th.userNft}`)).to.eq(undefined)
      })
    })

    describe('add key', function(){
      it('invoke', async ()=>{
        await th.txSuccess(Transactions.invokeScript({
          dApp: th.Device.address,
          chainId: th.chainId,
          call:th.addDeviceKeyCall,
          payment: [],
          fee: 500000,
          
      },th.DevOwner.seed))
      })
    
      it('key added', async ()=>{
        expect(await th.walletValueFor(th.Device,`key_${th.requestedDeviceKey}`)).to.eq(ACTIVE)
      })
    })
  })
}
export default OwnerAddsKeyToDevice
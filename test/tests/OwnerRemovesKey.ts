import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'

const OwnerRemovesKey = (th:TestHelper)=>{
  describe('OwnerRemovesKey', ()=>{
    describe('not an owner/dapp', function(){
      it('invoke', async ()=>{
        await th.txDappFail(Transactions.invokeScript({
          dApp: th.Device.address,
          chainId: th.chainId,
          call:{
            function:"removeKey",
            args:[
              { type: "string", value: th.expiredDeviceKey},
            ]
          },
          payment: [],
          fee: 500000,
      },th.Dummy.seed), 'Not permitted')
      })
    
      it('key not removed', async ()=>{
        expect(await th.walletValueFor(th.Device,`key_${th.expiredDeviceKey}`)).to.not.eq(undefined)
      })
    })

    describe('removes key', function(){
      it('invoke', async ()=>{
        await th.txSuccess(Transactions.invokeScript({
          dApp: th.Device.address,
          chainId: th.chainId,
          call:{
            function:"removeKey",
            args:[
              { type: "string", value: th.expiredDeviceKey},
            ]
          },
          payment: [],
          fee: 500000,
      },th.DevOwner.seed))
      })
    
      it('key removed', async ()=>{
        expect(await th.walletValueFor(th.Device,`key_${th.expiredDeviceKey}`)).to.eq(undefined)
      })
    })    
  })
}
export default OwnerRemovesKey
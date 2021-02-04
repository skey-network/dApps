import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'

const UpdateDeviceData = (th:TestHelper)=>{
  describe('UpdateDeviceData', ()=>{    
    before('write device data', async () => {
      await th.txSuccess(
        Transactions.data(
          {
            data: [{key: "test_key_to_rem", value: "40", type: "string"}],
            chainId: th.chainId,
            fee: 500000,
          },
          th.Device.seed
      ))
        expect(await th.walletValueFor(th.Device,`test_key_to_rem`)).to.eq("40")
    })
    

    describe('not a dapp', ()=>{
      it('invoke', async ()=>{
        await th.txDappFail(Transactions.invokeScript({
          dApp: th.Device.address,
          chainId: th.chainId,
          call:{
            function:"updateData",
            args:[
              { type: "list", value: [{type: "string", value: "set#int#test_here#42"},{type: "string", value: "delete#test_key_to_rem"}] },
            ]
          },
          payment: [],
          fee: 900000 
        },th.Dummy.seed),'Not permitted')
      })
      
      it('data not changed', async ()=>{
        expect(await th.walletValueFor(th.Device,`test_here`)).to.eq(undefined)
        expect(await th.walletValueFor(th.Device,`test_key_to_rem`)).to.eq("40")
      })
    })   
  
    describe('modifies data', ()=>{
      it('invoke', async ()=>{
        await th.txSuccess(Transactions.invokeScript({
          dApp: th.Device.address,
          chainId: th.chainId,
          call:{
            function:"updateData",
            args:[
              { type: "list", value: [{type: "string", value: "set#int#test_here#42"},{type: "string", value: "delete#test_key_to_rem"}] },
            ]
          },
          payment: [],
          fee: 900000 
        },th.Dapp.seed))
      })
      

      it('data not changed', async ()=>{
        expect(await th.walletValueFor(th.Device,`test_here`)).to.eq(42)
        expect(await th.walletValueFor(th.Device,`test_key_to_rem`)).to.eq(undefined)
      })
    })   
     
  })
  
}
export default UpdateDeviceData
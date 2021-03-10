import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'

const CLOSE="close"
const OPEN="open"
const ACTIVE="active"
const INACTIVE="inactive"

const DappUnbansKey = (th:TestHelper)=>{
  describe('DappUnbansKey', ()=>{
    describe('unbans key', function(){
      it('invoke', async ()=>{
        await th.txSuccess(Transactions.invokeScript({
          dApp: th.Device.address,
          chainId: th.chainId,
          call:{
            function:"addKey",
            args:[
              { type: "string", value: th.deviceKey},
            ]
          },
          payment: [],
          fee: 900000 
      },th.Dapp.seed))
      })
    
      it('key unbanned', async ()=>{
        expect(await th.walletValueFor(th.Device,`key_${th.deviceKey}`)).to.eq(ACTIVE)
      })
    })
    
    describe('unbanned key can open device', function(){
      const invoker = th.Dummy
      it('invoke', async ()=>{
          await th.txSuccess(Transactions.invokeScript({
            dApp: th.Dapp.address,
            chainId: th.chainId,
            call:{
              function:"deviceAction",
              args:[
                { type: "string", value: th.deviceKey},
                { type: "string", value: "open"},
                // { type: "string", value: invoker.address},
              ]
            },
            payment: [],
            fee: 500000,
            
        },invoker.seed))
      })

      it('device opened', async ()=>{
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(OPEN)
        // expect(await th.dappValueFor(`device_counter_${th.Device.address}`)).to.eq(2)
      })
    })
  })
}
export default DappUnbansKey
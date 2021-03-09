import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'

const CLOSE = 'close'
const OPEN = 'open'

const Close = (th:TestHelper)=>{
  describe('Close', ()=>{

    describe('not owned key', function(){
      const invoker= th.DevOwner
      it('invoke', async ()=>{
          await th.txDappFail(Transactions.invokeScript({
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call:{
                function:"deviceAction",
                args:[
                  { type: "string", value: th.deviceKey},
                  { type: "string", value: "close"},
                  // { type: "string", value: invoker.address},
                ]
              },
              payment: [],
              fee: 500000,
            
          },invoker.seed),"Key not owned")
      })

      it('device not closed', async ()=>{
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(OPEN)
        expect(await th.dappValueFor(`device_counter_${th.Device.address}`)).to.eq(1)
      })
    })

    describe('not a key', function(){
      const invoker= th.DevOwner
      it('invoke', async ()=>{
          await th.txDappFail(Transactions.invokeScript({
            dApp: th.Dapp.address,
            chainId: th.chainId,
            call:{
              function:"deviceAction",
              args:[
                { type: "string", value: th.userNft},
                { type: "string", value: "close"},
                // { type: "string", value: invoker.address},

              ]
            },
            payment: [],
            fee: 500000,
            
        },invoker.seed),"Not a device key")
      })

      it('device not closed', async ()=>{
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(OPEN)
        expect(await th.dappValueFor(`device_counter_${th.Device.address}`)).to.eq(1)

      })
    })

    describe('key closes device', function(){
      const invoker= th.KeyOwner
      it('invoke', async ()=>{
          await th.txSuccess(Transactions.invokeScript({
            dApp: th.Dapp.address,
            chainId: th.chainId,
            call:{
              function:"deviceAction",
              args:[
                { type: "string", value: th.deviceKey},
                { type: "string", value: "close"},
                // { type: "string", value: invoker.address},
              ]
            },
            payment: [],
            fee: 500000,
            
        },invoker.seed))
      })

      it('device closed', async ()=>{
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(CLOSE)
        expect(await th.dappValueFor(`device_counter_${th.Device.address}`)).to.eq(2)
      })
    })
  })
}
export default Close
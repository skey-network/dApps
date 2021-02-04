import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'

const CLOSE = 'close'
const OPEN = 'open'

const Open = (th:TestHelper)=>{
  before('save token counts',
    async()=>{
      await th.balance.setActual(th.Dummy)
      await th.balance.setActual(th.KeyOwner)
      await th.balance.setActual(th.DevOwner)
    }
  )
  describe('open', ()=>{

    describe('not owned key', function(){
      it('invoke', async ()=>{
          await th.txDappFail(Transactions.invokeScript({
              dApp: th.Dapp.address,
              chainId: th.chainId,
              call:{
                function:"deviceAction",
                args:[
                  { type: "string", value: th.deviceKey},
                  { type: "string", value: "open"},
                ]
              },
              payment: [],
              fee: 500000,
              
          },th.DevOwner.seed),"Key not owned")
      })

      it('asset not recharged?', async()=>{
        await th.balance.expectFall(th.DevOwner)
      })


      it('device not opened', async ()=>{
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(CLOSE)
        expect(await th.dappValueFor(`device_counter_${th.Device.address}`)).to.eq(0)
      })
    })

    describe('not a key', function(){
      it('invoke', async ()=>{
          await th.txDappFail(Transactions.invokeScript({
            dApp: th.Dapp.address,
            chainId: th.chainId,
            call:{
              function:"deviceAction",
              args:[
                { type: "string", value: th.userNft},
                { type: "string", value: "open"},
              ]
            },
            payment: [],
            fee: 500000,
            
        },th.DevOwner.seed),"Not a device key")
      })

      it('asset not recharged - not changed', async()=>{
        await th.balance.expectChange(th.KeyOwner,0)
      })

      it('device not opened', async ()=>{
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(CLOSE)
        expect(await th.dappValueFor(`device_counter_${th.Device.address}`)).to.eq(0)

      })
    })

    describe('expired key cant open device', function(){
      it('invoke', async ()=>{
          await th.txDappFail(Transactions.invokeScript({
            dApp: th.Dapp.address,
            chainId: th.chainId,
            call:{
              function:"deviceAction",
              args:[
                { type: "string", value: th.expiredDeviceKey},
                { type: "string", value: "open"},
              ]
            },
            payment: [],
            fee: 500000,
            
        },th.KeyOwner.seed),"Key expired")
      })

      it('asset not recharged - not changed', async()=>{
        await th.balance.expectChange(th.KeyOwner,0)
      })

      it('device not opened', async ()=>{
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(CLOSE)
        expect(await th.dappValueFor(`device_counter_${th.Device.address}`)).to.eq(0)
      })
    })

    describe('key opens device', function(){
      it('invoke', async ()=>{
          await th.txSuccess(Transactions.invokeScript({
            dApp: th.Dapp.address,
            chainId: th.chainId,
            call:{
              function:"deviceAction",
              args:[
                { type: "string", value: th.deviceKey},
                { type: "string", value: "open"},
              ]
            },
            payment: [],
            fee: 500000,
            
        },th.KeyOwner.seed))
      })

      it('asset recharged', async()=>{
        await th.balance.expectRise(th.KeyOwner)
      })

      it('device opened', async ()=>{
        expect(await th.dappValueFor(`device_${th.Device.address}`)).to.eq(OPEN)
        expect(await th.dappValueFor(`device_counter_${th.Device.address}`)).to.eq(1)
      })
    })
  })
}
export default Open
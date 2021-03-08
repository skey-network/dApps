import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'

const ACTIVE="active"

const DappAddsKeyToDevice = (th:TestHelper)=>{
  describe('DappAddsKeyToDevice', ()=>{
    before ('setup key by dapp', async ()=>{
      // create key by dapp
      const tokenParams :Transactions.IIssueParams = {
        chainId: th.chainId,
        name: "Device key",
        quantity: 1,
        decimals: 0,
        reissuable: false,
        description: th.Device.address+"_"+(Date.now()+th.keyDuration),
        fee: 500000
      };
      const signedIssueTx = Transactions.issue(tokenParams, th.Dapp.seed)
      let tx = await th.txSuccess(signedIssueTx)
      console.log("\t\tdev key id: " + tx.id);
      th.deviceKey = tx.id

      const tokenParams3 :Transactions.IIssueParams = {
        chainId: th.chainId,
        name: "Device key",
        quantity: 1,
        decimals: 0,
        reissuable: false,
        description: th.Device.address+"_"+(Date.now()-th.keyDuration),
        fee: 500000
      };
      const signedIssueTx3 = Transactions.issue(tokenParams3, th.Dapp.seed)
      let tx3 = await th.txSuccess(signedIssueTx3)
      console.log("\t\texp dev key id: " + tx3.id);
      th.expiredDeviceKey = tx3.id
      
      // key for organization
      const tokenParams4 :Transactions.IIssueParams = {
        chainId: th.chainId,
        name: "Device key",
        quantity: 1,
        decimals: 0,
        reissuable: false,
        description: th.Device.address+"_"+(Date.now()+th.keyDuration),
        fee: 500000
      };
      const signedIssueTx4 = Transactions.issue(tokenParams4, th.Dapp.seed)
      let tx4 = await th.txSuccess(signedIssueTx4)
      console.log("\t\torg key id: " + tx4.id);
      th.organizationKey = tx4.id
      

      // create key by user
      const tokenParams2 :Transactions.IIssueParams = {
        chainId: th.chainId,
        name: "MyKey",
        quantity: 1,
        decimals: 0,
        reissuable: false,
        description: "Test nft token",
        fee: 100000
      };
      const signedIssueTx2 = Transactions.issue(tokenParams2, th.DevOwner.seed)
      let tx2 = await th.txSuccess(signedIssueTx2)
      console.log("\t\twrong key id: " + tx2.id);
      th.userNft = tx2.id
    
      // add right key call
      th.addDeviceKeyCall ={
        function:"addKey",
        args:[
          { type: "string", value: tx.id},
        ]
      }
    })

    describe('random user tries to add key', function(){
      it('invoke', async ()=>{
        await th.txDappFail(Transactions.invokeScript({
            dApp: th.Device.address,
            chainId: th.chainId,
            call: th.addDeviceKeyCall,
            payment: [],
            fee: 900000 
        },th.Dummy.seed), 'Not permitted')
      })

      it('no asset change', async ()=>{
         await th.balance.expectChange(th.Dummy,0)    
      })
    
      it('key not added', async ()=>{
        expect(await th.dappValueFor(`key_${th.userNft}`)).to.eq(undefined)
      })
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
          fee: 900000 
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
          call: {
            function:"addKey",
            args:[
              { type: "string", value: th.deviceKey}
            ]
          },
          payment: [],
          fee: 900000 
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
          fee: 900000 
      },th.Dapp.seed))
      })
    
      it('key added', async ()=>{
        expect(await th.walletValueFor(th.Device,`key_${th.deviceKey}`)).to.eq(ACTIVE)
      })
    })

    describe('add organization key', function(){
      it('invoke', async ()=>{
        await th.txSuccess(Transactions.invokeScript({
          dApp: th.Device.address,
          chainId: th.chainId,
          call:{
            function:"addKey",
            args:[
              { type: "string", value: th.organizationKey}
            ]
          },
          payment: [],
          fee: 900000 
      },th.Dapp.seed))
      })
    
      it('key added', async ()=>{
        expect(await th.walletValueFor(th.Device,`key_${th.deviceKey}`)).to.eq(ACTIVE)
      })
    })

    describe('add expired key', function(){
      it('invoke', async ()=>{
        await th.txSuccess(Transactions.invokeScript({
          dApp: th.Device.address,
          chainId: th.chainId,
          call:{
            function:"addKey",
            args:[
              { type: "string", value: th.expiredDeviceKey}
            ]
          },
          payment: [],
          fee: 900000 
      },th.Dapp.seed))
      })
    
      it('key added', async ()=>{
        expect(await th.walletValueFor(th.Device,`key_${th.deviceKey}`)).to.eq(ACTIVE)
      })
    })

    // for next test
    after('transfer created keys', async ()=>{
      await th.txSuccess(
        Transactions.transfer(
          {
            chainId: th.chainId,
            amount: 1,
            assetId: th.deviceKey,
            fee:500000,
            recipient: th.KeyOwner.address
          },
          th.Dapp.seed // transfer from dapp as was not transfered to device owner
        )
      )
      await th.txSuccess( // key for organization
        Transactions.transfer(
          {
            chainId: th.chainId,
            amount: 1,
            assetId: th.organizationKey,
            fee: 500000,
            recipient: th.Organization.address
          },
          th.Dapp.seed // transfer from dapp as was not transfered to device owner
        )
      )
      await th.txSuccess(
        Transactions.transfer(
          {
            chainId: th.chainId,
            amount: 1,
            assetId: th.expiredDeviceKey,
            fee:500000,
            recipient: th.KeyOwner.address
          },
          th.Dapp.seed // transfer from dapp as was not transfered to device owner
        )
      )
    })
  })
}
export default DappAddsKeyToDevice
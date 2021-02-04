// import * as Transactions from '@waves/waves-transactions'
// import * as Crypto from '@waves/ts-lib-crypto'
// import Account from '../classes/Account'
// import * as chalk from 'chalk'
// import { expect } from 'chai'
// import fetch from 'node-fetch'

// const accountA = new Account("wheel life loan when hurry upgrade brown mechanic hockey dismiss deal lady area dynamic purpose")
// const accountB = new Account("parade doctor swift nerve bring rich immune dial kidney unveil rug deputy long version inner")
// const account3 = new Account("runway merge worth marriage jelly one rapid diesel truck olympic jar exist scorpion cream disease")
// const account4 = new Account("arrive real endorse broken fire turkey soda describe shallow write ready bitter clock slender sausage")
// const account5 = new Account("march nest shove render future initial volume autumn subject balcony display chimney act traffic noise")





// const testnetUrl = 'https://nodes-testnet.wavesnodes.com'

// const wvs = 10 ** 8
// const waves = wavlets => wavlets * wvs
// const wavlets = waves => waves / wvs

// // const createCommit = (vote: string) => {
// //   const salt = Crypto.base58Encode(Crypto.randomBytes(32))
// //   const hash = Crypto.sha256(Crypto.stringToBytes(vote + salt))
// //   return { hash: Crypto.base58Encode(hash), salt }
// // }

// // const removeAllData = async (account: Account) => {
// //   const res = await fetch(`${testnetUrl}/addresses/data/${account.address}`)
// //   const data = await res.json() as Array<any>
// //   const entries = data.map(item => ({
// //     key: item.key,
// //     type: null,
// //     value: null
// //   }))
// //   const payload = Transactions.data({
// //     data: entries,
// //     chainId: 'T',
// //     fee: 900_000
// //   }, account.seed)
// //   const tx = await Transactions.broadcast(payload, testnetUrl)
// //   await Transactions.waitForTx(tx.id, { apiBase: testnetUrl })
// //   console.log(tx)
// // }


// // it ('dapp invoke purchase', async function(){
// //   let txObjectSigned = Transactions.invokeScript({
// //       dApp: accountB.address,
// //       call:{
// //           function:"purchase",
// //           args:[]
// //       },
// //       payment: [{ amount: 5000000, assetId: null}],
// //       fee: 500000 
// //   },account4.seed)

// //   let tx = await Transactions.broadcast(txObjectSigned, testnetUrl)
// //   await Transactions.waitForTx(tx.id,{ apiBase: testnetUrl })
// //   console.log(JSON.stringify(tx))
// // })

// ///////////////////////////////////////////////////////////////////////////

// // let datajson = {
// //   "title":        "t-Shirt, vote 1",
// //   "coupon_price": 10000000,
// //   "old_price":    1000000000,
// //   "new_price":    100000000,
// //   "address":      "Universe",
// //   "description":  "Whatever desc",
// //   "image":        "https://via.placeholder.com/350x150"
// // }

// // it('add item', async function(){
// //   let ts = Transactions.invokeScript({
// //     chainId: 'T',
// //     dApp: account3.address,
// //     call:{
// //       function:"addItem",
// //       args: [
// //         {type:"string",  value: datajson.title},
// //         {type:"integer", value: datajson.coupon_price},
// //         {type:"string",  value: JSON.stringify(datajson)}
// //       ]},
// //     payment: [],
// //     fee: 900000
// //   }, account4.seed)
// //   let tx = await Transactions.broadcast(ts, testnetUrl)
// //   await Transactions.waitForTx(tx.id, {apiBase: testnetUrl})
// // })

// //////////////////////////////////////////////////////////////////////////////

// // it('purchase item', async function(){
// //   let item = "item_4EtQrTyAScriB145oYu3TkbZwcYffgyZujkzPEFadopy"
// //   let ts = Transactions.invokeScript({
// //     dApp: account3.address,
// //     chainId: 'T',
// //     call:{
// //       function:"purchase",
// //       args:[
// //         { type:"string", value: item}
// //       ]
// //     },
// //     payment: [{amount: datajson.coupon_price, assetId:null}]
// //   }, account5.seed)
// //   let tx = await Transactions.broadcast(ts,testnetUrl)
// //   await Transactions.waitForTx(tx.id,{apiBase: testnetUrl})
// // })

// ///////////////////////////////////////////////////////////////////////////////

// // it('withdraw funds', async function(){
// //    let ts = Transactions.invokeScript({
// //       dApp:account3.address,
// //       chainId: 'T',
// //       call:{
// //         function:"withdraw",
// //         args:[]
// //       },
// //       payment: [],
// //       fee: 900000
// //     }, account4.seed)
// //    let tx = await Transactions.broadcast(ts,testnetUrl)
// //    await Transactions.waitForTx(tx.id, {apiBase: testnetUrl}) 
// // })


// // let commits = [
// //   "G8ZMEiXEGefpEdgEFN5mYr6oEEABJrtcBBLkZf6Ujmcq",
// //   "Bf2yysmAoroXAzVidK1wxuVYpRGLy1nWe6cNAGXBf5Hi",
// //   "ACHSFMGY7bp3aHryCLYc499XvojeGrgBp59zSvwgLnkQ",
// // ]
// // let reveals = ["delisted", "featured", "featured"]
// // let salts = ["random1", "random2", "random3"]
// // let seeds = [account3.seed /*accountDappSeed*/, account5.seed /*accountCustomerSeed*/, account4.seed /*accountSupplierSeed*/]

// // for(let x=0; x<3; x++){
// //   console.log(
// //     Crypto.base58Encode(
// //       Crypto.sha256(
// //         Crypto.stringToBytes(reveals[x]+salts[x])
// //       )
// //     )
// //   )
// // }

// // it('vote commit', async function(){
// //   let item = "item_4EtQrTyAScriB145oYu3TkbZwcYffgyZujkzPEFadopy"
// //   let user = 0
// //   let ts = Transactions.invokeScript({
// //     dApp: account3.address /*dappAddress*/,
// //     chainId: 'T',
// //     call:{
// //       function: "voteCommit",
// //       args: [ 
// //         { type: "string", value: item},
// //         { type: "string", value: commits[user]}
// //       ]},
// //     payment: [],
// //     fee: 900000
// //   }, seeds[user])
// //   let tx = await Transactions.broadcast(ts,testnetUrl)
// //   await Transactions.waitForTx(tx.id, {apiBase: testnetUrl})
// // })

// // it('vote reveal', async function(){
// //   let item = "item_4EtQrTyAScriB145oYu3TkbZwcYffgyZujkzPEFadopy"
// //   let user = 0
// //   let ts = Transactions.invokeScript({
// //     dApp: account3.address /*dappAddress*/,
// //     chainId: 'T',
// //     call:{
// //       function: "voteReveal",
// //       args:[
// //         {type: "string", value: item},
// //         {type: "string", value: reveals[user]},
// //         {type: "string", value: salts[user]},
// //       ]
// //     },
// //     payment: [],
// //     fee: 900000
// //   }, seeds[user])
// //   let tx = await Transactions.broadcast(ts, testnetUrl)
// //   await Transactions.waitForTx(tx.id, {apiBase: testnetUrl})
// // })

// // console.log(Crypto.base58Encode(Crypto.sha256(Crypto.stringToBytes("delisted"+ "random4"))))

// // it('custom currency token', async function(){
// //   const tokenParamsCustomCurrency = {
// //     chainId: 'T',
// //     name: "Whatever",
// //     quantity: 100,
// //     decimals: 0,
// //     reissuable: true,
// //     description: "This is not a currency, and cant be divided, but can be reissued"
// //   };

// //   const signedIssueTx = Transactions.issue(tokenParamsCustomCurrency, account5.seed)
// //   let tx = await Transactions.broadcast(signedIssueTx, testnetUrl);
// //   await Transactions.waitForTx(tx.id, {apiBase: testnetUrl})

// //   console.log("tx / token id: " + tx.id);
// // })


// let token = "5GFY8QsKcrYr3ySRQCaJ7wRiY6fVfHTroYMBQw1mDvC6"

// // it('re-issue coupon smart token', async function(){
// //   const tokenParams = {
// //     quantity: 10,
// //     chainId: 'T',
// //     assetId: token,
// //     reissuable: true
// //   };

// //   const signedIssueTx = Transactions.reissue( tokenParams, account5.seed);
// //   let tx = await Transactions.broadcast(signedIssueTx,testnetUrl)
// //   await Transactions.waitForTx(tx.id, {apiBase: testnetUrl})
// //   console.log("token id:" + tx.id)
// // })


// it('burn custom token', async function(){
//   const burnCustomTokenParams = {
//     assetId: token,
//     amount: 10,
//     chainId: "T"
//   }

//   const signedIssueTx = Transactions.burn(burnCustomTokenParams,account5.seed)
//   let tx = await Transactions.broadcast(signedIssueTx,testnetUrl);
//   await Transactions.waitForTx(tx.id, {apiBase: testnetUrl})

//   console.log("burn tx id: "+ tx.id)
// })

// ################

// it('re-issue coupon smart token', async function(){
//   const tokenParams = {
//     quantity: 10,
//     chainId: 'T',
//     assetId: token,
//     reissuable: true
//   };

//   const signedIssueTx = Transactions.reissue( tokenParams, account5.seed);
//   let tx = await Transactions.broadcast(signedIssueTx,testnetUrl)
//   await Transactions.waitForTx(tx.id, {apiBase: testnetUrl})
//   console.log("token id:" + tx.id)
// })


// it('burn custom token', async function(){
//   const burnCustomTokenParams = {
//     assetId: token,
//     amount: 10,
//     chainId: "T"
//   }

//   const signedIssueTx = Transactions.burn(burnCustomTokenParams,account5.seed)
//   let tx = await Transactions.broadcast(signedIssueTx,testnetUrl);
//   await Transactions.waitForTx(tx.id, {apiBase: testnetUrl})

//   console.log("burn tx id: "+ tx.id)
// })

// it('deposits tokens', async function () {
//   let ts = Transactions.invokeScript({
//     dApp: account6.address /*dappAddress*/,
//     chainId: 'T',
//     call:{
//       function: "deposit",
//       args:[]
//     },
//     payment: [{
//       amount: 3,
//       assetId: asset,
//     }],
//     fee: 900000
//   }, account5.seed)
//   let tx = await Transactions.broadcast(ts, testnetUrl)
//   await Transactions.waitForTx(tx.id, {apiBase: testnetUrl})
// })

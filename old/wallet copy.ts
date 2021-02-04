import * as Transactions from '@waves/waves-transactions'
import * as Crypto from '@waves/ts-lib-crypto'
import Account from '../classes/Account'
import * as chalk from 'chalk'
import { expect } from 'chai'
import fetch from 'node-fetch'
import * as Util from 'util'
import { balance } from '@waves/waves-transactions/dist/nodeInteraction'
import { IInvokeScriptCall } from '@waves/waves-transactions/dist/transactions'

const execFile = Util.promisify(require('child_process').execFile);
const DAPP_ERROR_STR = 'Error while executing account-script: '
const testnetUrl = 'https://nodes-testnet.wavesnodes.com'
const localUrl = 'http://localhost:6869/'
const chainID='R'
const chosenUrl = localUrl
const wvs = 10 ** 8
const waves = wavlets => wavlets * wvs
const wavlets = waves => waves / wvs
const ACTIVE = 'active'
const BANNED = 'banned'
const OPEN = 'open'
const CLOSED = 'closed'

// for storing balances between tests
let balances = {}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// utx functions
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // deploys app by invoking deploy script with given seed
  async function deployDapp(seed:String) {
    const dir = __dirname.substr(0,__dirname.length - 5)
    const { stdout } = await execFile('surfboard', ['run', 'scripts/wallet.deploy.js', '--variables', `SEED=${seed}`], {cwd: dir});
    return stdout;
  }

  // utx for testing tx success
  async function txSuccess(signedTx){
    let tx = await Transactions.broadcast(signedTx, chosenUrl)
    await Transactions.waitForTx(tx.id,{ apiBase: chosenUrl })
    // console.log(JSON.stringify(tx))
    return tx
  }

  // utx for testing dapp failure
  async function txDappFail(signedTx, expectedMessage){
      expectedMessage = DAPP_ERROR_STR + expectedMessage
      let message = null
      try{
        let tx = await Transactions.broadcast(signedTx, chosenUrl)
        await Transactions.waitForTx(tx.id,{ apiBase: chosenUrl })
        //console.log(JSON.stringify(tx))
      }catch(e){
        message = e.message
      }
      expect(message).to.be.eq(expectedMessage)
  }

  // creates random account and logs to console
  function createAndLogAccount(name:string){
    const account = new Account(Crypto.randomSeed(),chainID)
    console.log(`${name} ${account.address}`)
    return account
  }

  async function fetchAssetBalance(account:Account,asset:string){
    let resp = await fetch(`${chosenUrl}assets/balance/${account.address}/${asset}`)
    let json = await resp.json()
    return parseInt(json.balance)
  }

  async function setAssetActualBalance(account:Account, asset:string){
    balances[`${account.address}_${asset}`] = await fetchAssetBalance(account,asset)
  }

  async function expectAssetBalanceChange(account:Account, asset:string, change:Number){
    let actual = await fetchAssetBalance(account,asset) 
    let previous = balances[`${account.address}_${asset}`]
    expect(actual,`${account.address} balance of ${asset}`).to.be.eq(previous + change)
    balances[`${account.address}_${asset}`] = actual
  }

  async function dappValueFor(dapp:Account, key:String){
    let resp = await fetch(`${chosenUrl}addresses/data/${dapp.address}/${key}`)
    let json = await resp.json()
    return json.value
  }
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Setup accounts/prices etc
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  let testsData:any = {
    devicePrice:3,
    keyPrice:2,
    assetID:"AgKUh9MjegpBBSxFAYJcofQHaexP9nDT3cr1cb6XKX5H", // asset on local net, optionally overriden by issuing new one,
    userNft:""
  }

  //from local net
  const bank = new Account('***REMOVED***','R')

  // dynamic creation
  let accountDevOwner =createAndLogAccount("DevOwner")
  let accountOracle = createAndLogAccount("Oracle")
  let accountDapp = createAndLogAccount("Dapp")
  let accountDevice = createAndLogAccount("Device")
  let accountKeyOwner = createAndLogAccount("KeyOwner") 
  let accountRemovedKeyOwner = createAndLogAccount("RemovedKeyOwner") 
  let accountDummy = createAndLogAccount("Dummy")
  let accountBannedOracle = createAndLogAccount("BannedOracle")

  // static account addressess
  // const accountDevOwner = new Account("arrive real endorse broken fire turkey soda describe shallow write ready bitter clock slender sausage")
  // const accountOracle = new Account("march nest shove render future initial volume autumn subject balcony display chimney act traffic noise")
  // const accountDapp = new Account("spread half warrior trend phone drill federal guilt language divide chest exchange supreme witness wave")
  // const accountDevice = new Account("noodle analyst web burger call gorilla tone upper text upgrade blanket speak setup improve inch")
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Setup wallets
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  it('setup wallets', async()=>{
    const params = {
      chainId: chainID.charCodeAt(0),
      fee: 1000000,
      transfers: [
        {amount: 100000000, recipient: accountOracle.address},
        {amount: 1000000000, recipient: accountDevOwner.address},
        {amount: 100000000, recipient: accountKeyOwner.address},
        {amount: 100000000, recipient: accountRemovedKeyOwner.address},
        {amount: 100000000, recipient: accountDevice.address},
        {amount: 100000000, recipient: accountDummy.address},
        {amount: 100000000, recipient: accountBannedOracle.address},
        {amount: 1000000000, recipient: accountDapp.address},
      ]
    } 

    let tx = await Transactions.broadcast(
      Transactions.massTransfer(params, bank.seed),
      chosenUrl)

    await Transactions.waitForTx(tx.id, {apiBase: chosenUrl})
  })
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Setup dapp [issue token, write to data, pricing to data, send assets]
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  describe('setup dapp', ()=>{
    it('issue asset', async ()=>{
      const tokenParams :Transactions.IIssueParams = {
        chainId: chainID,
        name: "Whatever2",
        quantity: 1000000,
        decimals: 0,
        reissuable: true,
        description: "Test token",
        fee: 100400000
      };
      const signedIssueTx = Transactions.issue(tokenParams, accountDapp.seed)
      let tx = await txSuccess(signedIssueTx)
      console.log("\t\tmain token id: " + tx.id);
      testsData.assetID = tx.id
    })
    
    it('send assets to external users', async()=>{
      const params = {
        chainId: chainID.charCodeAt(0),
        fee: 1000000,
        assetId: testsData.assetID,
        transfers: [
          {amount: 50, recipient: accountDummy.address},
          {amount: 50, recipient: accountKeyOwner.address},
          {amount: 50, recipient: accountDevOwner.address},
          {amount: 50, recipient: accountRemovedKeyOwner.address},
        ]
      } 

      let tx = await Transactions.broadcast(
        Transactions.massTransfer(params, accountDapp.seed),
        chosenUrl)

      await Transactions.waitForTx(tx.id, {apiBase: chosenUrl})
    })

    it('save balances', async()=>{
      await setAssetActualBalance(accountDummy,testsData.assetID)
      await setAssetActualBalance(accountKeyOwner,testsData.assetID)
      await setAssetActualBalance(accountDevOwner,testsData.assetID)
      await setAssetActualBalance(accountRemovedKeyOwner,testsData.assetID)
    })

    it('init data [asset, device price, key price]', async () => {
        await txSuccess(
          Transactions.data(
            {
              data: [{key: "asset", value: testsData.assetID},
              {key: "device_price", value: testsData.devicePrice},
              {key: "device_key_price", value: testsData.keyPrice}],
              chainId: chainID,
              fee: 500000,
            },
            accountDapp.seed
          )
        )
    })

    it('add oracles', async () => {
      await txSuccess(
        Transactions.data(
          {
            data: [{key: "oracle_"+accountOracle.address, value: "active"},
                  {key: "oracle_"+accountBannedOracle.address, value: "banned"}],
            chainId: chainID,
            fee: 500000,
          },
          accountDapp.seed
      ))
    })

    it('deploy script', async() =>{
      await deployDapp(accountDapp.seed)
    })
  })
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  adding user by oracle
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  describe('addUser', ()=>{
    const addUserCall: IInvokeScriptCall = {
      function:"addUser",
      args:[
        { type: "string", value: accountDevOwner.address },
        { type: "integer", value: 10 },
      ]
    }

    // try add not as oracle
    it('not by oracle', async ()=>{
      await txDappFail(
        Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call: addUserCall,
          payment: [],
          fee: 500000 
      },accountDummy.seed),
      'forbidden')

      await expectAssetBalanceChange(accountDevOwner,testsData.assetID,0)    
    
      // user not active in dapp
      expect(await dappValueFor(accountDapp,`user_${accountDevOwner.address}`)).to.not.eq(ACTIVE)
    })

    // add banned, should act same as second time
    it('by banned oracle', async ()=>{
      await txDappFail(
        Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:addUserCall,
          payment: [],
          fee: 500000 
        },accountBannedOracle.seed),
        'forbidden')
        await expectAssetBalanceChange(accountDevOwner,testsData.assetID,0)
    })

    it('by oracle', async ()=>{
      await txSuccess(
        Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:addUserCall,
          payment: [],
          fee: 500000 
        },accountOracle.seed)
      )
      await expectAssetBalanceChange(accountDevOwner,testsData.assetID,10)
    })
      
    // add user second time, should just incr his balance TODO
  })
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Adding device by user
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  describe('addDevice', ()=>{
    const addDeviceCall:IInvokeScriptCall={
      function:"addDevice",
      args:[
        { type: "string", value: accountDevice.address},
      ]
    }
    
    it('write device owner', async () => {
      await txSuccess(
        Transactions.data(
          {
            data: [{key: "owner", value: accountDevOwner.address}],
            chainId: chainID,
            fee: 500000,
          },
          accountDevice.seed
      ))
    })

    it('not a member', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:addDeviceCall,
          payment: [{amount: testsData.devicePrice, assetId: testsData.assetID}],
          fee: 900000 
      },accountDummy.seed),'user not registered')
    
      await expectAssetBalanceChange(accountDummy,testsData.assetID,0) // did nothing
    })

    it(' wrong asset', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:addDeviceCall,
          payment: [{amount: testsData.devicePrice, assetId: null}],
          fee: 900000 
      },accountDevOwner.seed),'wrong asset, supported only xyz')
    
      await expectAssetBalanceChange(accountDevOwner,testsData.assetID,0) 
    })

    it('wrong payment amount', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:addDeviceCall,
          payment: [{amount: testsData.devicePrice-1, assetId: testsData.assetID}],
          fee: 900000 
      },accountDevOwner.seed),'wrong payment value, expected '+testsData.devicePrice)
    
      await expectAssetBalanceChange(accountDevOwner,testsData.assetID,0) 
    })
    
    it('adds device', async function(){
      await txSuccess(Transactions.invokeScript({
        dApp: accountDapp.address,
        chainId: chainID,
        call:addDeviceCall,
        payment: [{amount: testsData.devicePrice, assetId: testsData.assetID}],
        fee: 900000 
      },accountDevOwner.seed))

      await expectAssetBalanceChange(accountDevOwner,testsData.assetID,-testsData.devicePrice) 
    })
    
    it('same device second time', async function(){
      await txDappFail(Transactions.invokeScript({
        dApp: accountDapp.address,
          chainId: chainID,
          call:addDeviceCall,
          payment: [{amount: testsData.devicePrice, assetId: testsData.assetID}],
          fee: 900000 
        },accountDevOwner.seed),'device already added')
    
      await expectAssetBalanceChange(accountDevOwner,testsData.assetID,0) 
    })
  })
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Adding key by user
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  describe('addKey', ()=>{
    before ('user creates key, setup', async ()=>{
      const tokenParams :Transactions.IIssueParams = {
        chainId: chainID,
        name: "MyKey",
        quantity: 1,
        decimals: 0,
        reissuable: false,
        description: "Test nft token",
        fee: 100000
      };
      const signedIssueTx = Transactions.issue(tokenParams, accountDevOwner.seed)
      let tx = await txSuccess(signedIssueTx)
      console.log("\t\tkey id: " + tx.id);
      testsData.userNft = tx.id
      testsData.addKeyCall ={
        function:"addKey",
        args:[
          { type: "string", value: accountDevice.address},
          { type: "string", value: tx.id},
        ]
      }
    })
    
    // it('add key -- set tokens count', async ()=>{
    //   await setAssetActualBalance(accountDevOwner,testsData.userNft)
    //   await setAssetActualBalance(accountKeyOwner,testsData.userNft) 
    //   await setAssetActualBalance(accountDummy,testsData.userNft) 
    // })

    it('external user tries to add', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call: testsData.addKeyCall,
          payment: [{amount: testsData.keyPrice, assetId: testsData.assetID}],
          fee: 900000 
      },accountDummy.seed), 'user not registered')

      await expectAssetBalanceChange(accountDummy,testsData.assetID,0)
    })

    it('wrong payment asset', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:testsData.addKeyCall,
          payment: [{amount: testsData.keyPrice, assetId: null}],
          fee: 900000 
      },accountDevOwner.seed), 'wrong asset, supported only xyz')
      
      await expectAssetBalanceChange(accountDevOwner,testsData.assetID,0)
    })
    

    it('wrong payment amount', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call: testsData.addKeyCall,
          payment: [{amount: testsData.keyPrice-1, assetId: testsData.assetID}],
          fee: 900000 
      },accountDevOwner.seed), 'wrong payment value, expected '+testsData.keyPrice)

      await expectAssetBalanceChange(accountDevOwner,testsData.assetID,0) 

    })

    it('not owned token', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call: {
            function:"addKey",
            args:[
              { type: "string", value: accountDevice.address},
              { type: "string", value: "FjTTApuujLAvQRudsgRfkj3qkWF9xmbfsATSt4ky5ELA"},
            ]
          },
          payment: [{amount: testsData.keyPrice, assetId: testsData.assetID}],
          fee: 900000 
      },accountDevOwner.seed), "key is not present in user wallet")

      await expectAssetBalanceChange(accountDevOwner,testsData.assetID,0) 
    })

    it('not owned device', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call: {
            function:"addKey",
            args:[
              { type: "string", value: accountDummy.address},
              { type: "string", value: testsData.userNft},
            ]
          },
          payment: [{amount: testsData.keyPrice, assetId: testsData.assetID}],
          fee: 900000 
      },accountDevOwner.seed), 'not an owner')

      await expectAssetBalanceChange(accountDevOwner,testsData.assetID,0) 
    })

    it('not an nft', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call: {
            function:"addKey",
            args:[
              { type: "string", value: accountDevice.address},
              { type: "string", value: testsData.assetID},
            ]
          },
          payment: [{amount: testsData.keyPrice, assetId: testsData.assetID}],
          fee: 900000 
      },accountDevOwner.seed), 'key is not nft')

      await expectAssetBalanceChange(accountDevOwner,testsData.assetID,0) 
    })

    it('add key', async function(){
      // console.log(JSON.stringify(testsData.addKeyCall))
      await txSuccess(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:testsData.addKeyCall,
          payment: [{amount: testsData.keyPrice, assetId: testsData.assetID}],
          fee: 900000 
      },accountDevOwner.seed))

      await expectAssetBalanceChange(accountDevOwner,testsData.assetID,-testsData.keyPrice) 
    })

    it('transfer registered key', async ()=>{
      await txSuccess(
        Transactions.transfer(
          {
            chainId: chainID,
            amount: 1,
            assetId: testsData.userNft,
            fee:500000,
            recipient: accountKeyOwner.address
          },
          accountDevOwner.seed
        )
      )
    })
  })
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//  Removing key by user
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  describe('removeKey', ()=>{
    before('user creates key', async ()=>{
      const tokenParams :Transactions.IIssueParams = {
        chainId: chainID,
        name: "MyKey",
        quantity: 1,
        decimals: 0,
        reissuable: false,
        description: "Test nft token",
        fee: 100000
      };
      const signedIssueTx = Transactions.issue(tokenParams, accountDevOwner.seed)
      let tx = await txSuccess(signedIssueTx)
      console.log("\t\tkey id: " + tx.id);
      testsData.userNftToRemove = tx.id
    })

    it('user adds key before removing it', async function(){
      await txSuccess(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:{
            function:"addKey",
            args:[
              { type: "string", value: accountDevice.address},
              { type: "string", value: testsData.userNftToRemove},
            ]
          },
          payment: [{amount: testsData.keyPrice, assetId: testsData.assetID}],
          fee: 900000 
      },accountDevOwner.seed))
    })

    it('removes key', async function(){
      await txSuccess(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:{
            function:"removeKey",
            args:[
              { type: "string", value: testsData.userNftToRemove},
            ]
          },
          payment: [],
          fee: 900000 
      },accountDevOwner.seed))
    })

    it('transfer removed key', async ()=>{
      await txSuccess(
        Transactions.transfer(
          {
            chainId: chainID,
            amount: 1,
            assetId: testsData.userNftToRemove,
            fee:500000,
            recipient: accountRemovedKeyOwner.address
          },
          accountDevOwner.seed
        )
      )
    })
    // todo additional validations?
  })
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Open device
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  describe('open', ()=>{
    it('not owned key', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:{
            function:"open",
            args:[
              { type: "string", value: testsData.userNft},
            ]
          },
          payment: [],
          fee: 500000 
      },accountDevOwner.seed),"key not owned")
    })

    it('key is not registered', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:{
            function:"open",
            args:[
              { type: "string", value: testsData.assetID},
            ]
          },
          payment: [],
          fee: 500000 
      },accountDevOwner.seed),"key not registered")
    })

    it('key is not registered (removed key)', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:{
            function:"open",
            args:[
              { type: "string", value: testsData.userNftToRemove},
            ]
          },
          payment: [],
          fee: 500000 
      },accountRemovedKeyOwner.seed),"key not registered")
    })

    it('key opens device', async function(){
      await txSuccess(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:{
            function:"open",
            args:[
              { type: "string", value: testsData.userNft},
            ]
          },
          payment: [],
          fee: 500000 
      },accountKeyOwner.seed))
    })
  })
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Close device
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  describe('close', ()=>{
    it('not owned key', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:{
            function:"close",
            args:[
              { type: "string", value: testsData.userNft},
            ]
          },
          payment: [],
          fee: 500000 
      },accountDevOwner.seed),"key not owned")
    })

    it('key is not registered', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:{
            function:"close",
            args:[
              { type: "string", value: testsData.assetID},
            ]
          },
          payment: [],
          fee: 500000 
      },accountDevOwner.seed),"key not registered")
    })

    it('key is not registered (removed key)', async function(){
      await txDappFail(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:{
            function:"close",
            args:[
              { type: "string", value: testsData.userNftToRemove},
            ]
          },
          payment: [],
          fee: 500000 
      },accountRemovedKeyOwner.seed),"key not registered")
    })

    it('key closes device', async function(){
      await txSuccess(Transactions.invokeScript({
          dApp: accountDapp.address,
          chainId: chainID,
          call:{
            function:"close",
            args:[
              { type: "string", value: testsData.userNft},
            ]
          },
          payment: [],
          fee: 500000 
      },accountKeyOwner.seed))
    })
  })
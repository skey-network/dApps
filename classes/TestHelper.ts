import Account from './Account'
import BalanceTracker from './BalanceTracker'
import * as Crypto from '@waves/ts-lib-crypto'
import * as Util from 'util'
import * as Transactions from '@waves/waves-transactions'
import { expect } from 'chai'
import fetch from 'node-fetch'



class TestHelper{
  defaultConfig:any={
    chainId:'R',
    nodeUrl:'http://localhost:6869/',
    keyPrice:2000000,
    keyDuration:1000000,
    rechargeLimit:50 *100000,
    initAccounts:true
  }
  _execFile = Util.promisify(require('child_process').execFile);
  _dapp_error_str = 'Error while executing account-script: '
  
  // wws config
  chainId:string
  nodeUrl:string
  
  // prices etc
  devicePrice:number
  keyPrice:number
  keyDuration:number
  rechargeLimit:number
  
  // dynamic test variables
  userNft:string
  deviceKey:string
  requestedDeviceKey:string
  expiredDeviceKey:string
  deviceActionsCount:number
  
  // calls
  requestKeyCall:any
  addUserCall:any
  addDeviceCall:any
  addDeviceKeyCall:any
  transferKeyCall:any
  addKeysCall:any
  openAsOrgCall:any
  
  // for n keys test
  keysForTest: string[]
  

  // open by organization
  organizationKey:string


  balance:BalanceTracker

  // accounts
  Bank:Account=new Account('***REMOVED***','R')
  DevOwner:Account
  Dapp:Account
  Device:Account
  KeyOwner:Account
  Dummy:Account
  Organization:Account
  OrganizationUser:Account

  public constructor(config?:any){
    config = {...this.defaultConfig, ...(config ?? {})}

    this.chainId=config.chainId
    this.nodeUrl=config.nodeUrl
    this.keyPrice=config.keyPrice
    this.devicePrice=config.devicePrice
    this.keyDuration=config.keyDuration
    this.rechargeLimit=config.rechargeLimit
    this.balance = new BalanceTracker(this.nodeUrl)

    if(config.initAccounts) this.initAccounts()
  }

  initAccounts(){
    this.DevOwner= this.createAndLogAccount("DevOwner")
    //this.Dapp= new Account('***REMOVED*** input',this.chainId) 
    this.Dapp=this.createAndLogAccount("Dapp")
    this.Device= this.createAndLogAccount("Device")
    this.KeyOwner= this.createAndLogAccount("KeyOwner") 
    this.Dummy= this.createAndLogAccount("Dummy")
    this.Organization= this.createAndLogAccount("Organization")
    this.OrganizationUser= this.createAndLogAccount("OrganizationUser")
  }

  public createAndLogAccount(name:string){
    const account = new Account(Crypto.randomSeed(),this.chainId)
    console.log(`${name} ${account.address}`)
    console.log(account.seed)
    return account
  }

  public async deployDapp(seed:String) {
    const dir = __dirname.substr(0,__dirname.length - 7)
    const { stdout } = await this._execFile('surfboard', ['run', 'scripts/dapp_wallet.deploy.js', '--variables', `SEED=${seed}`], {cwd: dir});
    console.log(stdout);
    return stdout;
  }

  public async deployDevice(seed:String) {
    const dir = __dirname.substr(0,__dirname.length - 7)
    const { stdout } = await this._execFile('surfboard', ['run', 'scripts/device_wallet.deploy.js', '--variables', `SEED=${seed}`], {cwd: dir});
    console.log(stdout);
    return stdout;
  }

  // utx for testing tx success
  public async txSuccess(signedTx){
    let tx = await Transactions.broadcast(signedTx, this.nodeUrl)
    await Transactions.waitForTx(tx.id,{ apiBase: this.nodeUrl })
    return tx
  }

  // utx for testing dapp failure
  public async txDappFail(signedTx, expectedMessage){
      expectedMessage = this._dapp_error_str + expectedMessage
      let message = null
      try{
        let tx = await Transactions.broadcast(signedTx, this.nodeUrl)
        await Transactions.waitForTx(tx.id,{ apiBase: this.nodeUrl})
      }catch(e){
        message = e.message
      }
      expect(message).to.be.eq(expectedMessage)
  }

  async dappValueFor(key:String){
    let resp = await fetch(`${this.nodeUrl}addresses/data/${this.Dapp.address}/${key}`)
    let json = await resp.json()
    return json.value
  }

  async walletValueFor(wallet:Account,key:String){
    let resp = await fetch(`${this.nodeUrl}addresses/data/${wallet.address}/${key}`)
    let json = await resp.json()
    return json.value
  }

  async getNftFrom(wallet:Account, issuer: Account){
    let resp = await fetch(`${this.nodeUrl}assets/nft/${wallet.address}/limit/1000`)
    let json = await resp.json()
    let filtered = json.filter(x=>x.issuer==issuer.address).map(x => x.assetId)
    return filtered
  }

  makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
}

export default TestHelper
import Account from './Account'
import BalanceTracker from './BalanceTracker'
import * as Crypto from '@waves/ts-lib-crypto'
import * as Util from 'util'
import * as Transactions from '@waves/waves-transactions'
import { expect } from 'chai'
import fetch from 'node-fetch'
import { TInvokeScriptCallArgument } from '@waves/waves-transactions/dist/transactions'
import * as fs from 'fs'
// import util from 'util'
const HOUR_IN_TS = 3600000

const util = require('util') // as there is problem with imports...
//const fs = require('fs')

const readFileProm = util.promisify(fs.readFile)
const writeFileProm = util.promisify(fs.writeFile)

class TestHelper {
  defaultConfig: any = {
    chainId: process.env.CHAIN,
    // chainId: 'C',
    nodeUrl: process.env.NODE1,
    // nodeUrl: 'https://master.testnet.node.smartkeyplatform.io/',
    secondNodeUrl: process.env.NODE2,
    // secondNodeUrl: 'https://srv-de-2.testnet.node.smartkeyplatform.io/',
    keyPrice: 2000,
    keyDuration: 5,
    rechargeLimit: 50 * 100000,
    // bankSeed:
    //   '***REMOVED***'
    // bankSeed: '***REMOVED***'
    bankSeed: process.env.BANK!
    //'***REMOVED***'
  }
  config: any = {}
  _execFile = Util.promisify(require('child_process').execFile)
  _dapp_error_str = 'Error while executing account-script: '

  // wws config
  chainId: string
  nodeUrl: string
  secondNodeUrl: string

  // prices etc
  devicePrice: number
  keyPrice: number
  keyDuration: number
  rechargeLimit: number

  // keys
  deviceKey: string
  silentKey: string
  requestedDeviceKey: string
  expiredDeviceKey: string
  userNft: string
  organizationKey: string
  secondOrgKey: string

  // dynamic test variables
  deviceActionsCount: number = 0

  // calls
  requestKeyCall: any
  addUserCall: any
  addDeviceCall: any
  addDeviceKeyCall: any
  transferKeyCall: any
  addKeysCall: any
  openAsOrgCall: any

  // for n keys test
  keysForTest: string[]

  // organization
  orgAccessKey: string
  fakeOrgAccessKey: string
  balance: BalanceTracker

  // accounts
  Bank: Account
  DappFather: Account
  DevOwner: Account
  unauthorizedByFather: {
    Dapp?: Account
    Device?: Account
    KeyOwner?: Account
    deviceKey?: string
  } = {}
  Dapp: Account
  Device: Account
  KeyOwner: Account
  Dummy: Account
  Organization: Account
  OrganizationUser: Account
  OrganizationUserByKey: Account

  public constructor(config?: any) {
    this.config = { ...this.defaultConfig, ...(config ?? {}) }

    this.chainId = this.config.chainId
    this.nodeUrl = this.config.nodeUrl
    this.secondNodeUrl = this.config.secondNodeUrl
    this.keyPrice = this.config.keyPrice
    this.devicePrice = this.config.devicePrice
    this.keyDuration = this.config.keyDuration
    this.rechargeLimit = this.config.rechargeLimit
    this.balance = new BalanceTracker(this.nodeUrl)

    this.setupSurfboard()
    this.initAccounts()
  }

  initAccounts() {
    this.Bank = new Account(this.config.bankSeed, this.config.chainId)
    this.DevOwner = this.createAndLogAccount('DevOwner')

    this.DappFather = this.createAndLogAccount('DappFather')
    this.Dapp = new Account(
      '***REMOVED*** input',
      this.chainId,
      true
    )
    // this.Dapp = this.createAndLogAccount('Dapp')
    console.log('Dapp:', this.Dapp.address)
    this.Device = new Account(
      '***REMOVED*** program',
      this.chainId
    )
    // this.Device = this.createAndLogAccount('Device')
    this.KeyOwner = this.createAndLogAccount('KeyOwner')
    this.Dummy = this.createAndLogAccount('Dummy')
    this.Organization = this.createAndLogAccount('Organization')
    this.OrganizationUser = this.createAndLogAccount('OrganizationUser')
    this.OrganizationUserByKey = this.createAndLogAccount(
      'OrganizationUserByKey'
    )
    this.unauthorizedByFather.Dapp =
      this.createAndLogAccount('unathorized Dapp')
    this.unauthorizedByFather.Device =
      this.createAndLogAccount('unathorized Device')
    this.unauthorizedByFather.KeyOwner =
      this.createAndLogAccount('unathorized User')
  }

  public createAndLogAccount(name: string) {
    const account = new Account(Crypto.randomSeed(), this.chainId)
    console.log(`${name} ${account.address}`)
    console.log(account.seed)
    return account
  }

  public async setupSurfboard() {
    let replace = {
      CHAIN_ID: this.config.chainId,
      API_BASE: this.config.nodeUrl
    }
    let text = (await readFileProm('surfboard.config.json.example')).toString()
    for (const [key, value] of Object.entries(replace)) {
      text = text.replace(`${key}_HERE`, value as string)
    }
    const result = await writeFileProm('surfboard.config.json', text)
  }

  public async deployDapp(seed: string) {
    await this.deploy(seed, 'scripts/dapp_wallet.deploy.js')
    this.storeCompiledScript(
      'supplier.txt',
      await this.getScriptFrom(new Account(seed, this.config.chainId).address)
    )
  }
  public async deployDappFather(seed: string) {
    await this.deploy(seed, 'scripts/father_wallet.deploy.js')
    this.storeCompiledScript(
      'father.txt',
      await this.getScriptFrom(new Account(seed, this.config.chainId).address)
    )
  }

  public async deployDevice(seed: string) {
    await this.deploy(seed, 'scripts/device_wallet.deploy.js')
    this.storeCompiledScript(
      'device.txt',
      await this.getScriptFrom(new Account(seed, this.config.chainId).address)
    )
  }

  public async deployOrg(seed: string) {
    await this.deploy(seed, 'scripts/org_wallet.deploy.js')
    this.storeCompiledScript(
      'organization.txt',
      await this.getScriptFrom(new Account(seed, this.config.chainId).address)
    )
  }

  async deploy(seed: string, file: string) {
    const dir = __dirname.substr(0, __dirname.length - 7)
    const { stdout } = await this._execFile(
      'surfboard',
      ['run', file, '--variables', `SEED=${seed}`],
      { cwd: dir }
    )
    console.log(stdout)
    return stdout
  }

  // utx for testing tx success
  public async txSuccess(signedTx, useSecondNode: boolean = false) {
    const nodeUrl = useSecondNode ? this.secondNodeUrl : this.nodeUrl
    let tx = await Transactions.broadcast(signedTx, nodeUrl)
    await Transactions.waitForTx(tx.id, { apiBase: nodeUrl })
    return tx
  }

  public async txFailFullMsg(
    signedTx,
    expectedMessage,
    useSecondNode: boolean = false
  ) {
    const nodeUrl = useSecondNode ? this.secondNodeUrl : this.nodeUrl

    // expectedMessage = this._dapp_error_str + expectedMessage
    let message = null
    try {
      let tx = await Transactions.broadcast(signedTx, nodeUrl)
      await Transactions.waitForTx(tx.id, { apiBase: nodeUrl })
    } catch (e) {
      message = e.message
    }
    expect(message).to.be.eq(expectedMessage)
  }

  // utx for testing dapp failure
  public async txFail(
    signedTx,
    expectedMessage,
    useSecondNode: boolean = false
  ) {
    expectedMessage = this._dapp_error_str + expectedMessage
    await this.txFailFullMsg(signedTx, expectedMessage, useSecondNode)
  }

  async dappValueFor(key: String, useSecondNode: boolean = false) {
    const nodeUrl = useSecondNode ? this.secondNodeUrl : this.nodeUrl
    let resp = await fetch(
      `${nodeUrl}addresses/data/${this.Dapp.address}/${key}`
    )
    let json = await resp.json()
    return json.value
  }

  async walletValueFor(
    wallet: Account,
    key: String,
    useSecondNode: boolean = false
  ) {
    const nodeUrl = useSecondNode ? this.secondNodeUrl : this.nodeUrl
    let resp = await fetch(`${nodeUrl}addresses/data/${wallet.address}/${key}`)
    let json = await resp.json()
    return json.value
  }

  async getNftFrom(
    wallet: Account,
    issuer: Account,
    useSecondNode: boolean = false
  ) {
    const nodeUrl = useSecondNode ? this.secondNodeUrl : this.nodeUrl
    let resp = await fetch(
      `${this.nodeUrl}assets/nft/${wallet.address}/limit/1000`
    )
    let json = await resp.json()
    let filtered = json
      .filter((x) => x.issuer == issuer.address)
      .map((x) => x.assetId)
    return filtered
  }

  async hasNft(account: Account, nft: string, useSecondNode: boolean = false) {
    const nodeUrl = useSecondNode ? this.secondNodeUrl : this.nodeUrl
    let resp = await fetch(
      `${this.nodeUrl}assets/nft/${account.address}/limit/1000`
    )
    let json = await resp.json()
    return json.find((x) => x.assetId == nft) !== undefined
  }

  async createKey(
    name: string,
    device: Account,
    supplier: Account,
    validTo?: number
  ) {
    const tokenParams: Transactions.IIssueParams = {
      chainId: this.chainId,
      name: name,
      quantity: 1,
      decimals: 0,
      reissuable: false,
      description:
        device.address +
        '_' +
        (validTo ?? Date.now() + this.keyDuration * HOUR_IN_TS),
      fee: 500000
    }
    const signedIssueTx = Transactions.issue(tokenParams, supplier.seed)
    let tx = await this.txSuccess(signedIssueTx)
    console.log(`\t\tkey "${name}" id:  ${tx.id}`)
    return tx.id
  }

  async sendKey(key: string, from: Account, to: Account) {
    await this.txSuccess(
      Transactions.transfer(
        {
          chainId: this.chainId,
          amount: 1,
          assetId: key,
          fee: 500000,
          recipient: to.address
        },
        from.seed // transfer from dapp as was not transfered to device owner
      )
    )
  }

  async getScriptFrom(address: string) {
    const resp = await fetch(`${this.nodeUrl}addresses/scriptInfo/${address}`)
    let json = await resp.json()
    return json.script
  }

  async storeCompiledScript(name: string, script: string) {
    fs.writeFileSync(`./compiled/${name}`, script)
  }

  buildInvokeTx(
    dapp: Account,
    invoker: Account,
    func: string,
    args?: TInvokeScriptCallArgument<string | number>[]
  ) {
    return Transactions.invokeScript(
      {
        dApp: dapp.address,
        chainId: this.chainId,
        call: {
          function: func,
          args: args
        },
        payment: [],
        fee: invoker.invokeFee
      },
      invoker.seed
    )
  }

  makeid(length) {
    var result = ''
    var characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    var charactersLength = characters.length
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength))
    }
    return result
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export default TestHelper

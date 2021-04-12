import Account from './Account'
import BalanceTracker from './BalanceTracker'
import * as Crypto from '@waves/ts-lib-crypto'
import * as Util from 'util'
import * as Transactions from '@waves/waves-transactions'
import { expect } from 'chai'
import fetch from 'node-fetch'
// import fs from 'fs'
// import util from 'util'
const util = require('util') // as there is problem with imports...
const fs = require('fs')

const readFileProm = util.promisify(fs.readFile)
const writeFileProm = util.promisify(fs.writeFile)

class TestHelper {
  defaultConfig: any = {
    chainId: 'A',
    nodeUrl: 'https://master.testnet.node.smartkeyplatform.io/',
    secondNodeUrl: 'https://srv-de-2.testnet.node.smartkeyplatform.io/',
    keyPrice: 2000,
    keyDuration: 5,
    rechargeLimit: 50 * 100000,
    bankSeed:
      '***REMOVED***'
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

  // dynamic test variables
  userNft: string
  deviceKey: string
  requestedDeviceKey: string
  expiredDeviceKey: string
  silentKey: string
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
  organizationKey: string
  orgAccessKey: string
  fakeOrgAccessKey: string

  balance: BalanceTracker

  // accounts
  Bank: Account
  DevOwner: Account
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

    this.Dapp = new Account(
      '***REMOVED*** input',
      this.chainId
    )
    console.log('Dapp:', this.Dapp.address)
    // this.Dapp = this.createAndLogAccount('Dapp')
    this.Device = this.createAndLogAccount('Device')
    this.KeyOwner = this.createAndLogAccount('KeyOwner')
    this.Dummy = this.createAndLogAccount('Dummy')
    this.Organization = this.createAndLogAccount('Organization')
    this.OrganizationUser = this.createAndLogAccount('OrganizationUser')
    this.OrganizationUserByKey = this.createAndLogAccount(
      'OrganizationUserByKey'
    )
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
  }

  public async deployDevice(seed: string) {
    await this.deploy(seed, 'scripts/device_wallet.deploy.js')
  }

  public async deployOrg(seed: string) {
    await this.deploy(seed, 'scripts/org_wallet.deploy.js')
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

  // utx for testing dapp failure
  public async txDappFail(
    signedTx,
    expectedMessage,
    useSecondNode: boolean = false
  ) {
    const nodeUrl = useSecondNode ? this.secondNodeUrl : this.nodeUrl

    expectedMessage = this._dapp_error_str + expectedMessage
    let message = null
    try {
      let tx = await Transactions.broadcast(signedTx, nodeUrl)
      await Transactions.waitForTx(tx.id, { apiBase: nodeUrl })
    } catch (e) {
      message = e.message
    }
    expect(message).to.be.eq(expectedMessage)
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

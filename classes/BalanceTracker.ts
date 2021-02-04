import Account from './Account'
import { expect } from 'chai'
import fetch from 'node-fetch'


class BalanceTracker{
  balances: any = {}
  chosenUrl: string
  defaultAsset : string

  public constructor(chosenUrl:string, defaultAsset?:string){
    this.chosenUrl = chosenUrl
    this.defaultAsset = defaultAsset
  }

  public setDefaultAsset(defaultAsset:string){
    this.defaultAsset = defaultAsset
  }
  
  public async fetchCurrent(account:Account,asset:string){
    asset = asset ?? this.defaultAsset
    if(asset==null) return await this.fetchDefaultCurrent(account)
    let resp = await fetch(`${this.chosenUrl}assets/balance/${account.address}/${asset}`)
    let json = await resp.json()
    return parseInt(json.balance)
  }

  public async fetchDefaultCurrent(account:Account){
    let resp = await fetch(`${this.chosenUrl}addresses/balance/${account.address}`)
    let json = await resp.json()
    return parseInt(json.balance)
  }

  public async setActual(account:Account, asset?:string){
    asset = asset ?? this.defaultAsset
    this.balances[`${account.address}_${asset}`] = await this.fetchCurrent(account,asset)
  }

  public expectChange(account: Account, change: Number){
    return this.expectChangeFor(account,this.defaultAsset,change)
  }

  public async expectChangeFor(account:Account, asset:string, change:Number){
    let actual = await this.fetchCurrent(account,asset) 
    let previous = this.balances[`${account.address}_${asset}`]
    expect(actual,`${account.address} balance of ${asset}`).to.be.eq(previous + change)
    this.balances[`${account.address}_${asset}`] = actual
  }

  public async expectRise(account: Account, asset?: string){
    asset = asset ?? this.defaultAsset
    let actual = await this.fetchCurrent(account,asset) 
    let previous = this.balances[`${account.address}_${asset}`]
    expect(actual,`${account.address} balance of ${asset} (${previous} ${actual})`).to.be.gt(previous)
    this.balances[`${account.address}_${asset}`] = actual
  }

  public async expectFall(account: Account, asset?: string){
    asset = asset ?? this.defaultAsset
    let actual = await this.fetchCurrent(account,asset) 
    let previous = this.balances[`${account.address}_${asset}`]
    expect(actual,`${account.address} balance of ${asset} (${previous} ${actual})`).to.be.lt(previous)
    this.balances[`${account.address}_${asset}`] = actual
  }
}
export default BalanceTracker
# DappFather

## Data

- refill_amount - amount which triggers refill & sets value of transfer
- supplier\_`<address>` - address of supplier, value: 'active'
- org\_`<address>` - address of organization, value: 'active'

<br>

## refill(targetAddrStr:String)

Refills target account if main asset is under specified amount

Params:

- targetAddrStr - address of target

Requirements:

- caller is written as supplier/organization in data

# Supplier

## Data

- user\_`<address>` - registered user, value: 'active'
- org\_`<address>` - supported organization, value: 'active'
- dapp_father - DappFather address, used for account recharge

<br>

## deviceAction(keyID: String, action: String)

Makes some action on device (tries to refill account on success)

Params:

- keyID - id of nft token
- action - action to be made

Requirements:

- Valid key (timestamp, issuer)
- Key whitelisted in device's wallet
- Asset (key) in invoking users wallet

## deviceActionAs(keyID: String, action: String, keyOwner: String, mobileId:String)

Makes some action on device using key from provided organization (tries to refill account on success)

Params:

- keyID - id of nft token
- action - action to be made
- keyOwner - organization address
- mobileId - id of organization user's device

Requirements:

- Valid key (timestamp, issuer)
- Key whitelisted in device's wallet
- Asset (key) in organization's wallet
- User listed in organization as member
- Organization listed as supported in suppliers dapp
- matching & set mobile id in organizaion data or wildcard (\*)

## transferKey(recipient: String)

Transfers key to other user (tries to refill both accounts on success)

Params:

- recipient - address of recipient
- key as payment - key to send

Requirements:

- Valid key (issuer, timestamp)
- Key in users wallet

## requestKey(deviceAddr: String, duration: Int)

Creates key for device if possible

Params:

- deviceAddr - address of device
- duration - time in minutes

Requirements:

- price per minute defined in device
- user is owner of device
- payment amount is equal

# Device

## Data

- owner - owner address
- dapp - main dapp address
- key\_`<assetId>` - whitelisted key
- key_price - price per minute (for requestKey in supplier)

<br>

## addKey(keyID: String)

Adds key to device.

Params:

- keyID - id of nft token

Requirements:

- Invoking wallet must be owner of device or main dapp
- Key issued by suppliers dapp

## removeKey(keyID: String)

Removes key from device.

Params:

- keyID - id of nft token

Requirements:

- Invoking wallet must be owner of device or main dapp

## updateData(args:List[String])

Updates data in device wallet.

Params:
list of actions written as string in schema:
`set#type#key#value`

- set - create new entry/update old one
- type - type of entry (int/string)
- key - key of entry
- value - value of entry
  or
  `delete#key`
- delete - remove entry
- key - key of entry
  Eg:
  `set#int#counter#1`
  `delete#counter2`

## addManyKeys(args:List[String])

Adds many keys (80 max) in one invoke

Params:
List of keys

# Organization

## Data

- user\_`<address>` - registered user, value is mobileId, '?' when not set, otherwise device id string or wildcard '\*'
- token\_`<assetId>` - activation token, value: 'active'/'inactive'

<br>

## activate(id: String)

Activates organization user, writes its mobile id

Payments:

- activation token

Requirements:

- Activation token must be whitelisted
- mobile id must be string other than '?' and '\*'

## removeKey(key: String)

Removes key to device from organization wallet

Params:

- key - id of nft token

Requirements:

- Invoked by owner of device or supplier

## setMobileId(id:String)

Sets mobile id if user is added to organization and has no id specified

Params:

- id - id of mobile device

Requirements

- user written in organization with '?' as mobile

# Running tests

```bash
npm run test
# or
source env.sh
test # conflicts with git command completion
```

# TestHelper

## Config

Default config looks like this:

```javascript
{
  chainId:'R', 						// chain id - 'R' for local test node
  nodeUrl:'http://localhost:6869/', // url of waves node
  keyDuration:100000,     // how long key will be valid
  rechargeLimit:50,   // recharge limit
  initAccounts:true 				// generates random accounts
}
```

## Accounts

- Bank - wallet used for charging other wallets
- DevOwner - owner of device
- Dapp - main script wallet
- Device - device which will be added
- KeyOwner - future owner of registered key
- Dummy - just to test that not registered user without any key can't do anything

## Methods

- createAndLogAccount(name:String) - creates and logs account address in console
- deployDapp(seed:String) - compiles wallet.ride and deploys using provided seed
- txSuccess(signedTx) - broadcasts provided transaction, expects tx success
- txFail(signedTx, expectedMessage) - broadcasts provided transaction, expects dapp failure equal to provided message
- dappValueFor(key:String) - gets value for given key from dapp
- walletValueFor(wallet:Account,key:String) - same but for given wallet
- getNftFrom(wallet:Account, issuer: Account) - gets list of nft from selected wallet by provided issuer
- makeid(length) - makes random id (used for addManyKeys test)

## Balance

Helper contains instance of BalanceTracker (accessible by helper.balance) responsible for tracking asset balance changes.

Methods:

- setDefaultAsset(defaultAsset:string) - sets default asset
- fetchCurrent(account:Account,asset:string) - fetches current balance of given asset (not saving it)
- setActual(account:Account, asset?:string) - saves current balance of given/default asset for account
- expectChange(account: Account, change: Number) - expects change(positive/zero/negative) for default asset
- expectChangeFor(account:Account, asset:string, change:Number) - same but for given asset
- expectRise(account: Account, asset?: string) - expects rise of asset count
- expectFall(account: Account, asset?: string) - expects fall of asset count

# Run waves node locally

```bash
docker run -d -p 6869:6869 wavesplatform/waves-private-node
```

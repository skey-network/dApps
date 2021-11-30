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

Error messages:

- `Key not owned` - Key not found in user's wallet
- `Wrong key issuer` - Key issuer is other than supplier
- `No such device` - There is no such device in supplier's dapp
- `Key not whitelisted` - Key is not whitelisted in device's data
- `Device not connected`
- `Device not active`
- `Key expired`
- `Not a device key` - There is no device info in key
- `Not a key` - There is no asset with given id

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

Error messages:

- `Key not owned` - Key not found in organization wallet
- `Organization not permitted` - not allowed by supplier dapp
- `Not permitted by organization` - user not permitted by organization
- `Mobile id not set` - user mobile id not set in organization
- `Id mismatch` - user mobile id is different than one in organization
- `Wrong key issuer` - Key issuer is other than supplier
- `No such device` - There is no such device in supplier's dapp
- `Key not whitelisted` - Key is not whitelisted in device's data
- `Device not connected`
- `Device not active`
- `Key expired`
- `Not a device key` - There is no device info in key
- `Not a key` - There is no asset with given id

## transferKey(recipient: String)

Transfers key to other user (tries to refill both accounts on success)

Params:

- recipient - address of recipient
- key as payment - key to send

Requirements:

- Valid key (issuer, timestamp)
- Key in users wallet

Error messages:

- `wrong assets count` - more or less than one asset provided as payment
- `wrong asset issuer` - asset issuer is other than supplier
- `key expired` - timestamp in key description expired

## requestKey(deviceAddr: String, duration: Int)

Creates key for device if possible

Params:

- deviceAddr - address of device
- duration - time in minutes

Requirements:

- price per minute defined in device
- user is owner of device
- payment amount is equal

Error messages:

- `Owner not specified in device`
- `Price not specified in device`
- `Not permitted`- device not owned by user
- `wrong price`- wrong amount of asset

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

Error messages:

- `Wrong key issuer` - Issuer of asset is other than supplier
- `Not permitted` - user is not a device owne or
- `This key is banned` - key is banned by supplier
- `This key is already assigned`

## removeKey(keyID: String)

Removes key from device.

Params:

- keyID - id of nft token

Requirements:

- Invoking wallet must be owner of device or main dapp

Error messages:

- `Not permitted` - User is not supplier/owner or key is banned/not added

## updateData(args:List[String])

Updates data in device wallet.

Params:
list of actions written as string in schema:
`action#type#key#value`

- action - set (create new/update old entry), delete (remove entry)
- type - type of entry (int/string/bool), skip for delete
- key - key of entry
- value - value of entry, skip for delete

Eg:
`set#int#counter#1`
`delete#counter2`

Error messages:

- `Not permitted` - User is not device's supplier

## addManyKeys(args:List[String])

Adds many keys (80 max) in one invoke

Params:
List of keys

Error messages:

- `Not permitted` - User is not device's supplier

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

Error messages:

- `Forbidden id string` - id string cant be `*` or `?`
- `Activation failed, token is inactive` - asset was deactivated
- `Wrong payments count` - more or less than 1 paymets attached
- `Wrong asset` - wrong asset sent as payment

## removeKey(key: String)

Removes key to device from organization wallet

Params:

- key - id of nft token

Requirements:

- Invoked by owner of device or supplier

Error messages:

- `Not a key` - there is no token with given asset id
- `Not a device key` - asset is not a device key
- `Not an owner address` - owner address in token is incorrect
- `Owner not specified in device` - device has no owner address specified
- `Not permitted` - if invoking user is not supplier/owner of device

## setMobileId(id:String)

Sets mobile id if user is added to organization and has no id specified

Params:

- id - id of mobile device

Requirements

- user written in organization with '?' as mobile id

Error messages:

- `Not a member` - organization has no such user
- `Forbidden id string` - mobile id is forbidden string (`?`/`*`)
- `Cant change existing id` - id was already set

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

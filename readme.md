# Main dapp functions

## addDevice(deviceAddr: String)

Adds device if wasn't added before.

Params:

- deviceAddr - address of device to be added

Requirements:

- Must be invoked from dapp wallet.

## deviceAction(keyID: String, action: String)

Makes some action on device

Params:

- keyID - id of nft token
- action - action to be made

Requirements:

- Key must be whitelisted in device wallet
- Invoking user wallet must contain this asset
- Action must be allowed, currently: 'open', 'closed'

# Main dapp data

- rechargeLimit - limit for recharge

# Device dapp functions

## addKey(keyID: String)

Adds key to device.

Params:

- keyID - id of nft token

Requirements:

- Invoking wallet must be owner of device or main dapp
- Only keys issued from dapp are accepted

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

# Device dapp data

- owner - owner address
- dapp - main dapp address

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

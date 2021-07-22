import { config } from 'dotenv'
config()

import * as Transactions from '@waves/waves-transactions'
import * as Crypto from '@waves/ts-lib-crypto'
import Account from '../classes/Account'
import * as chalk from 'chalk'
import { expect } from 'chai'
import { balance } from '@waves/waves-transactions/dist/nodeInteraction'
import { IInvokeScriptCall } from '@waves/waves-transactions/dist/transactions'
import TestHelper from '../classes/TestHelper'
import { Test } from 'mocha'
import SetupDapps from './tests/SetupDapps'
import AddDevice from './tests/AddDevice'
import Open from './tests/Open'
import Close from './tests/Close'
import DappAddsKeyToDevice from './tests/DappAddsKeyToDevice'
import DappRemovesKey from './tests/DappRemovesKey'
import OwnerRemovesKey from './tests/OwnerRemovesKey'
import UpdateDeviceData from './tests/UpdateDeviceData'
import KeyOwnerTransfersKey from './tests/KeyOwnerTransfersKey'
import DappAddsManyKeysToDevice from './tests/DappAddsManyKeysToDevice'
import OpenAsOrganization from './tests/OpenAsOrganization'
import OwnerRequestsKey from './tests/OwnerRequestsKey'
import OwnerAddsKeyToDevice from './tests/OwnerAddsKeyToDevice'
import DappUnbansKey from './tests/DappUnbansKey'
import Organization from './tests/Organization'
import RemoveKeyFromOrg from './tests/RemoveKeyFromOrg'
import UnauthorizedByFather from './tests/UnauthorizedByFather'

const wvs = 10 ** 8
const waves = (wavlets) => wavlets * wvs
const wavlets = (waves) => waves / wvs

/** --------------- quick tests area --------------------- */
// const th = new TestHelper()

// const acc1 = new Account(
//   '***REMOVED***',
//   'R'
// )
// const acc2 = new Account(
//   '***REMOVED***',
//   'R'
// )

// console.log(acc1.publicKey)
// //const acc2 = th.createAndLogAccount('acc2')

// // const params = {
// //   chainId: th.chainId.charCodeAt(0),
// //   fee: 1000000,
// //   transfers: [
// //     { amount: 100000000, recipient: acc1.address },
// //     { amount: 100000000, recipient: acc2.address }
// //   ]
// // }
// // th.txSuccess(Transactions.massTransfer(params, th.Bank.seed)).then(() => {
// //   console.log('paid')
// // })

// // th.deployOrg(acc2.seed).then(() => console.log('setup'))

// th.txSuccess(
//   Transactions.data(
//     {
//       data: [{ key: 'test', value: 'test', type: 'string' }],
//       senderPublicKey: acc2.publicKey,
//       chainId: 'R',
//       fee: '500000'
//     },
//     acc1.seed
//   )
// ).then(() => console.log('successss'))

// // th.deployOrg(acc2.seed)

/** ------------------ test of dapps ---------------------------*/
// Setup object  (accounts/prices etc)
const th = new TestHelper()

//  Setup wallets
it('setup wallets', async () => {
  const params = {
    chainId: th.chainId.charCodeAt(0),
    fee: 1000000,
    transfers: [
      { amount: 100000000, recipient: th.Device.address },
      { amount: 1000000000, recipient: th.Dapp.address },
      { amount: 1000000000, recipient: th.DappFather.address },
      { amount: 1000000000, recipient: th.Organization.address },
      { amount: 1000000000, recipient: th.unauthorizedByFather.Dapp.address },
      { amount: 1000000000, recipient: th.unauthorizedByFather.Device.address }
    ]
  }

  let tx = await th.txSuccess(Transactions.massTransfer(params, th.Bank.seed))
})

// Setup dapp [issue token, write to data, pricing to data, send assets, set script]
SetupDapps(th)

// Setup organization [set script]
Organization(th)

// Adding device by dapp, place reqired data and deploy script
AddDevice(th)

// Updating device data by dapp
UpdateDeviceData(th)

// Adding key by dapp
DappAddsKeyToDevice(th)

// Adding many keys to device
DappAddsManyKeysToDevice(th)

// // Open device
Open(th)

// Close device
Close(th)

// Transfer key
KeyOwnerTransfersKey(th)

// Removing key by dapp
DappRemovesKey(th)

// Removing key by user
OwnerRemovesKey(th)

// Organizations
OpenAsOrganization(th)

// Owner requests new key from dapp
OwnerRequestsKey(th)

// Owner adds key to device
OwnerAddsKeyToDevice(th)

// Dapp unbans key
DappUnbansKey(th)

// Remove key from org
RemoveKeyFromOrg(th)

// Unauthorized by dapp father - no recharge
UnauthorizedByFather(th)

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
import SetupDapp from './tests/SetupDapp'
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

const wvs = 10 ** 8
const waves = (wavlets) => wavlets * wvs
const wavlets = (waves) => waves / wvs

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
      { amount: 1000000000, recipient: th.Organization.address }
    ]
  }

  let tx = await th.txSuccess(Transactions.massTransfer(params, th.Bank.seed))
})

// Setup dapp [issue token, write to data, pricing to data, send assets, set script]
SetupDapp(th)

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

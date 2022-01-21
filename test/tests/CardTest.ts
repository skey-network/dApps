import { expect } from 'chai'
import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'
import DappsErrors from '../dapps_errors'
import Account from '../../classes/Account'
import * as Crypto from '@waves/ts-lib-crypto'

type CTX = {
  owner?: Account
  tss?: Account
  card?: Account
  key?: string
}
const ctx: CTX = {}

async function fillAccount(th: TestHelper, acc: Account, amount: number) {
  await th.txSuccess(
    Transactions.transfer(
      { recipient: acc.address, chainId: th.chainId, amount, fee: 900000 },
      th.Bank.seed
    )
  )
}

const CardTest = (th: TestHelper) => {
  describe('CardTest', () => {
    before(async () => {
      ctx.owner = new Account(Crypto.randomSeed(), th.chainId)
      ctx.tss = new Account(Crypto.randomSeed(), th.chainId)
      ctx.card = new Account(Crypto.randomSeed(), th.chainId)
      await Promise.all([
        fillAccount(th, ctx.owner, 900000),
        fillAccount(th, ctx.tss, 900000),
        fillAccount(th, ctx.card, 4000000)
      ])
      await th.txSuccess(
        Transactions.data(
          {
            data: [
              { key: 'owner', value: ctx.owner.publicKey },
              { key: 'authorised', value: ctx.tss.publicKey }
            ],
            chainId: th.chainId
          },
          ctx.card.seed
        )
      )
      ctx.key = await th.createKey('someKey', th.Device, th.Dapp)
      await th.txSuccess(
        Transactions.data(
          {
            data: [{ key: `key_${ctx.key}`, value: 'active' }],
            fee: 900000,
            chainId: th.chainId
          },
          th.Device.seed
        )
      )
      await th.sendKey(ctx.key, th.Dapp, ctx.card)
      // card account owner/authorized
      await th.deployCard(ctx.card.seed)
      // card acc script deployed
    })

    describe('authorized', () => {
      it('deviceAction', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              call: {
                function: 'deviceAction',
                args: [
                  { value: ctx.key, type: 'string' },
                  { value: 'open', type: 'string' }
                ]
              },
              fee: 900000,
              chainId: th.chainId,
              senderPublicKey: ctx.card.publicKey
            },
            ctx.tss.seed
          )
        )
      })
      it('failt to transferKey', async () => {
        await th.txFailFullMsg(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              call: {
                function: 'transferKey',
                args: [{ value: th.DevOwner.address, type: 'string' }]
              },
              payment: [{ amount: 1, assetId: ctx.key }],
              chainId: th.chainId,
              fee: 900000,
              senderPublicKey: ctx.card.publicKey
            },
            ctx.tss.seed
          ),
          'Transaction is not allowed by account-script'
        )
      })
      it('key not transfered', async () => {
        expect(await th.hasNft(ctx.card, ctx.key)).to.be.true
      })
    })

    describe('owner', () => {
      it('deviceAction', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              call: {
                function: 'deviceAction',
                args: [
                  { value: ctx.key, type: 'string' },
                  { value: 'open', type: 'string' }
                ]
              },
              fee: 900000,
              chainId: th.chainId,
              senderPublicKey: ctx.card.publicKey
            },
            ctx.owner.seed
          )
        )
      })
      it('transferKey', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Dapp.address,
              call: {
                function: 'transferKey',
                args: [{ value: th.DevOwner.address, type: 'string' }]
              },
              payment: [{ amount: 1, assetId: ctx.key }],
              chainId: th.chainId,
              fee: 900000,
              senderPublicKey: ctx.card.publicKey
            },
            ctx.owner.seed
          )
        )
      })
      it('key transfered', async () => {
        expect(await th.hasNft(ctx.card, ctx.key)).to.be.false
      })
    })

    // gen key to device
    // transfer to card
    // exec as account a and account b

    //problems:
    // tss can transfer key too...
  })
}
export default CardTest

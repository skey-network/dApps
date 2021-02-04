// import * as Transactions from '@waves/waves-transactions'
// import * as Crypto from '@waves/ts-lib-crypto'
// import Account from '../classes/Account'
// import * as chalk from 'chalk'
// import { expect } from 'chai'
// import fetch from 'node-fetch'

// // account2
// // SALT 3A1XLfwa3e1ts1Cydj3nMc1EVTfpoKVvaeja29A4HRD1
// // HASH FfFgkrQNGSisSiP1AEmcgyFSkg6hyPCF2HjPAN9v5xkE

// // account3
// // SALT 49qKLKC6gkZCWVPtfm9cYRLLS5F3DiHnCDMvNwNBCDha
// // HASH 88MVXKUgrBTr8dYaZoyrtDABGkdQzVANZYVRFw7638pY

// const dapp = new Account('liar neutral leopard dress rescue busy federal point theory wife mystery festival marble predict grace')
// const account1 = new Account('draw raw cereal buddy dynamic crack poet mansion wall weasel harvest spring junior ship about')
// const account2 = new Account('sand faint virus vessel where tone chimney monster diesel cricket wealth royal section snake method')
// const account3 = new Account('repair lock boss cross inch fork joy nothing notice marble myself kid street dust tape')
// const account4 = new Account('hub you congress tiny camp pride again aspect mail kidney merit fog thrive sick kid')

// const testnetUrl = 'https://nodes-testnet.wavesnodes.com'

// const wvs = 10 ** 8
// const waves = wavlets => wavlets * wvs
// const wavlets = waves => waves / wvs

// const createCommit = (vote: string) => {
//   const salt = Crypto.base58Encode(Crypto.randomBytes(32))
//   const hash = Crypto.sha256(Crypto.stringToBytes(vote + salt))
//   return { hash: Crypto.base58Encode(hash), salt }
// }

// const removeAllData = async (account: Account) => {
//   const res = await fetch(`${testnetUrl}/addresses/data/${account.address}`)
//   const data = await res.json() as Array<any>
//   const entries = data.map(item => ({
//     key: item.key,
//     type: null,
//     value: null
//   }))
//   const payload = Transactions.data({
//     data: entries,
//     chainId: 'T',
//     fee: 900_000
//   }, account.seed)
//   const tx = await Transactions.broadcast(payload, testnetUrl)
//   await Transactions.waitForTx(tx.id, { apiBase: testnetUrl })
//   console.log(tx)
// }

// describe('success', () => {
//   it('creates hash with salt', () => {
//     const { hash, salt } = createCommit('A')
//     expect(typeof hash).to.eq('string')
//     expect(typeof salt).to.eq('string')
//     expect(hash.length).to.be.greaterThan(0)
//     expect(salt.length).to.be.greaterThan(0)
//     console.log(chalk.green('// SALT'), salt)
//     console.log(chalk.green('// HASH'), hash)
//   })

//   it('remove all data', async () => {
//     await removeAllData(dapp)
//   })
//   // it('commits vote', async () => {
//   //   const { hash, salt } = createCommit('B')
//   //   console.log(chalk.green('// SALT'), salt)
//   //   console.log(chalk.green('// HASH'), hash)
//   //   const payload = Transactions.invokeScript({
//   //     dApp: dapp.address,
//   //     call: {
//   //       function: 'commit',
//   //       args: [{ type: 'string', value: hash }]
//   //     },
//   //     chainId: 'T',
//   //     fee: 900_000
//   //   }, dapp.seed)
//   //   const tx = await Transactions.broadcast(payload, testnetUrl)
//   //   await Transactions.waitForTx(tx.id, { apiBase: testnetUrl })
//   // })
// })

import * as Transactions from '@waves/waves-transactions'
import TestHelper from '../../classes/TestHelper'

const SetupDapp = (th: TestHelper) => {
  describe('SetupDapp', () => {
    // move it to other 'examples'
    after('save balances', async () => {
      await th.balance.setActual(th.Dummy)
      await th.balance.setActual(th.KeyOwner)
      await th.balance.setActual(th.DevOwner)
    })

    it('send assets to external users', async () => {
      const params = {
        chainId: th.chainId.charCodeAt(0),
        fee: 1000000,
        transfers: [
          { amount: th.rechargeLimit / 2, recipient: th.Dummy.address },
          { amount: th.rechargeLimit / 2, recipient: th.KeyOwner.address },
          { amount: th.rechargeLimit / 2, recipient: th.DevOwner.address },
          // { amount: th.rechargeLimit / 2, recipient: th.Organization.address },
          {
            amount: th.rechargeLimit / 2,
            recipient: th.OrganizationUser.address
          },
          {
            amount: th.rechargeLimit / 2,
            recipient: th.OrganizationUserByKey.address
          }
        ]
      }

      let tx = await Transactions.broadcast(
        Transactions.massTransfer(params, th.Dapp.seed),
        th.nodeUrl
      )

      await Transactions.waitForTx(tx.id, { apiBase: th.nodeUrl })
    })

    it('init data [asset, device price, key price]', async () => {
      await th.txSuccess(
        Transactions.data(
          {
            data: [
              { key: 'device_key_price', value: th.keyPrice },
              { key: 'recharge_limit', value: th.rechargeLimit }
            ],
            chainId: th.chainId,
            fee: 500000
          },
          th.Dapp.seed
        )
      )
    })

    it('deploy script', async () => {
      await th.deployDapp(th.Dapp.seed)
    })
  })
}
export default SetupDapp

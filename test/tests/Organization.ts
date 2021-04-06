import * as Transactions from '@waves/waves-transactions'
import { expect } from 'chai'
import TestHelper from '../../classes/TestHelper'

const ACTIVE = 'active'

const Organization = (th: TestHelper) => {
  describe('Organization', () => {
    before(async () => {
      // issue token
      const tokenParams: Transactions.IIssueParams = {
        chainId: th.chainId,
        name: 'Access token',
        quantity: 100,
        decimals: 0,
        reissuable: false,
        description: '',
        fee: 100400000
      }
      const signedIssueTx = Transactions.issue(
        tokenParams,
        th.Organization.seed
      )
      let tx = await th.txSuccess(signedIssueTx)
      console.log('\t\taccess key id: ' + tx.id)
      th.orgAccessKey = tx.id

      // issue 'fake' token
      const tokenParams2: Transactions.IIssueParams = {
        chainId: th.chainId,
        name: 'Access token',
        quantity: 100,
        decimals: 0,
        reissuable: false,
        description: '',
        fee: 100400000
      }
      const signedIssueTx2 = Transactions.issue(
        tokenParams2,
        th.Organization.seed
      )
      let tx2 = await th.txSuccess(signedIssueTx2)
      console.log('\t\taccess key id: ' + tx2.id)
      th.fakeOrgAccessKey = tx2.id

      // add token to data
      await th.txSuccess(
        Transactions.data(
          {
            data: [{ key: 'token_' + th.orgAccessKey, value: ACTIVE }],
            chainId: th.chainId,
            fee: 900000
          },
          th.Organization.seed
        )
      )

      // send to user
      await th.txSuccess(
        Transactions.transfer(
          {
            recipient: th.OrganizationUserByKey.address,
            assetId: th.orgAccessKey,
            amount: 1,
            chainId: th.chainId,
            fee: 900000
          },
          th.Organization.seed
        )
      )
      await th.txSuccess(
        Transactions.transfer(
          {
            recipient: th.OrganizationUserByKey.address,
            assetId: th.fakeOrgAccessKey,
            amount: 1,
            chainId: th.chainId,
            fee: 900000
          },
          th.Organization.seed
        )
      )
    })

    it('deploy script', async () => {
      await th.deployOrg(th.Organization.seed)
    })

    describe('wrong token', () => {
      it('no access with wrong token', async () => {
        await th.txDappFail(
          Transactions.invokeScript(
            {
              dApp: th.Organization.address,
              chainId: th.chainId,
              fee: 500000,
              call: { function: 'activate', args: [] },
              payment: [{ assetId: th.fakeOrgAccessKey, amount: 1 }]
            },
            th.OrganizationUserByKey.seed
          ),
          'Activation failed, token is inactive'
        )
      })
      it('not in data', async () => {
        expect(
          await th.walletValueFor(
            th.Organization,
            `user_${th.OrganizationUserByKey.address}`
          )
        ).to.eq(undefined)
      })

      it('added to access list with right key', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Organization.address,
              chainId: th.chainId,
              fee: 500000,
              call: { function: 'activate', args: [] },
              payment: [{ assetId: th.orgAccessKey, amount: 1 }]
            },
            th.OrganizationUserByKey.seed
          )
        )
      })
      it('saved in data', async () => {
        expect(
          await th.walletValueFor(
            th.Organization,
            `user_${th.OrganizationUserByKey.address}`
          )
        ).to.eq(ACTIVE)
      })
    })
  })
}
export default Organization

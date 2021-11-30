import * as Transactions from '@waves/waves-transactions'
import { expect } from 'chai'
import TestHelper from '../../classes/TestHelper'

const ACTIVE = 'active'
const TESTID = 'testid'
const wrongMobileIdsCases = ['?', '*', '']

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
      console.log('\t\tfake access key id: ' + tx2.id)
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
      it('invoke', async () => {
        await th.txFail(
          Transactions.invokeScript(
            {
              dApp: th.Organization.address,
              chainId: th.chainId,
              fee: 500000,
              call: {
                function: 'activate',
                args: [{ type: 'string', value: TESTID }]
              },
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
    })

    wrongMobileIdsCases.forEach((mobileid) => {
      describe(`right token, wrong mobile id (${mobileid})`, () => {
        it('invoke', async () => {
          await th.txFail(
            Transactions.invokeScript(
              {
                dApp: th.Organization.address,
                chainId: th.chainId,
                fee: 500000,
                call: {
                  function: 'activate',
                  args: [{ type: 'string', value: mobileid }]
                },
                payment: [{ assetId: th.orgAccessKey, amount: 1 }]
              },
              th.OrganizationUserByKey.seed
            ),
            'Forbidden id string'
          )
        })
        it('not saved in data', async () => {
          expect(
            await th.walletValueFor(
              th.Organization,
              `user_${th.OrganizationUserByKey.address}`
            )
          ).to.eq(undefined)
        })
      })
    })

    describe('right token, right mobile id', () => {
      it('invoke', async () => {
        await th.txSuccess(
          Transactions.invokeScript(
            {
              dApp: th.Organization.address,
              chainId: th.chainId,
              fee: 500000,
              call: {
                function: 'activate',
                args: [{ type: 'string', value: TESTID }]
              },
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
        ).to.eq(TESTID)
      })
    })

    wrongMobileIdsCases.forEach((mobileid) => {
      describe(`unset mobile id, set wrong mobile id '${mobileid}'`, () => {
        before('set user mobileid "?"', async () => {
          await th.txSuccess(
            Transactions.data(
              {
                data: [
                  {
                    key: `user_${th.OrganizationUserByKey.address}`,
                    value: '?'
                  }
                ],
                chainId: th.chainId,
                fee: 500000
              },
              th.Organization.seed
            )
          )
        })
        it('invoke', async () => {
          await th.txFail(
            Transactions.invokeScript(
              {
                dApp: th.Organization.address,
                chainId: th.chainId,
                fee: 500000,
                call: {
                  function: 'setMobileId',
                  args: [{ type: 'string', value: mobileid }]
                },
                payment: []
              },
              th.OrganizationUserByKey.seed
            ),
            'Forbidden id string'
          )
        })
        it('not saved in data', async () => {
          expect(
            await th.walletValueFor(
              th.Organization,
              `user_${th.OrganizationUserByKey.address}`
            )
          ).to.eq('?')
        })
      })
    })
  })
}
export default Organization

import * as Crypto from '@waves/ts-lib-crypto'

class Account {
  seed: string
  chain: string
  isDapp: boolean

  constructor(seed: string, chain?: string, isDapp: boolean = false) {
    this.seed = seed
    this.chain = chain ?? 'T'
    this.isDapp = isDapp
  }

  get address() {
    return Crypto.address(this.seed, this.chain)
  }

  get publicKey() {
    return Crypto.publicKey(this.seed)
  }

  get privateKey() {
    return Crypto.privateKey(this.seed)
  }

  get invokeFee() {
    return this.isDapp ? 900000 : 500000
  }
}

export default Account

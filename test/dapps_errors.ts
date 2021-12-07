const DappsErrors = {
  supplier: {
    EKeyNotOwned: '[E1] Key not owned',
    ENotPermittedByKeyOwner: '[E2] Not permitted by key owner',
    EWrongKeyIssuer: '[E3] Wrong key issuer',
    ENoSuchDevice: '[E4] No such device',
    EKeyNotWhitelisted: '[E5] Key not whitelisted',
    EDeviceNotConnected: '[E6] Device not connected',
    EDeviceNotActive: '[E7] Device not active',
    EKeyExpired: '[E8] Key expired',
    ENotPermittedByOrg: '[E9] Not permitted by organization',
    EMobileIdNotSet: '[E10] Mobile id not set',
    EIdMismatch: '[E11] Id mismatch',
    EOrgNotPermitted: '[E12] Organization not permitted',
    ENotAnOwner: '[E13] Not an owner',
    EWrongPrice: '[E14] Wrong price',
    EWrongPaymentsCount: '[E15] Wrong payments count',
    EWrongPaymentOnlyNative:
      '[E16] Wrong payment - supported only native token',
    EWrongPaymentValueExpected: '[E17] Wrong payment value, expected ',
    EUnknownAssetId: '[E18] Unknown asset id',
    ENotAKey: '[E19] Not a key',
    ENotDeviceKey: '[E20] Not a device key',
    EPriceNotSpecifiedInDev: '[E21] Price not specified in device',
    EOwnerNotSpecifiedInDev: '[E22] Owner not specified in device'
  },
  org: {
    ENotAKey: '[E201] Not a key',
    EWrongPaymentsCount: '[E202] Wrong payments count',
    EWrongAsset: '[E203] Wrong asset',
    ENotDeviceKey: '[E204] Not a device key',
    ENotOwnerAddress: '[E205] Not an owner address',
    ENoOwnerInDevice: '[E206] Owner not specified in device',
    EForbiddenIdStr: '[E207] Forbidden id string',
    EActivationTokenInactive: '[E208] Activation failed, token is inactive',
    ENotPermitted: '[E209] Not permitted',
    ENotAMember: '[E210] Not a member',
    ENoExistingIdChange: '[E211] Cant change existing id'
  },
  device: {
    ENotAKey: '[E101] Not a key',
    EWrongKeyIssuer: '[E102] Wrong key issuer',
    ENotPermitted: '[E103] Not permitted',
    EBannedKey: '[E104] This key is banned',
    EAlreadyAssigned: '[E105] This key is already assigned'
  }
}

export default DappsErrors

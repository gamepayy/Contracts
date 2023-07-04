#Gamepayy Contracts

## Tasklist
- [x] Core Contract
- [x] Arbitrators Contract
- [x] Asset Manager
- [x] Funds Manager
- [x] Oracle Registry
- [x] Rewards Contract
- [ ] UserData at Asset Manager Contract
- [x] Change disapprove asset at AssetManager contract to remove asset
- [x] Check role requirements on all contracts
- [x] Unit tests
    - [x] Main unit tests
    - [ ] Events unit tests
- [x] CI/CD pipeline
- [ ] Integration tests
    - [x] Merkle Tree
    - [x] Ledger API
    - [ ] Tenderly
- [ ] Deployments
- [ ] Documentation

- [ ] Multichain deployment

- Totally extra:
- [ ] Bulk rewards claimer at Rewards Contract

## Testing
### Unit tests
To run unit tests, run the following command:
```bash
yarn test
```

### Integration tests
To run the merkle tree integratio test, run the following command from the main folder:
```bash
yarn test:integration:merkletree
```
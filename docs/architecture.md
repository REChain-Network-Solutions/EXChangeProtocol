# 🧱 EXChangeProtocol Architecture

## Core Components

- **Exchange.sol**: Smart contract handling asset swaps and liquidity
- **Router.sol**: Connects users to various DeFi modules
- **OracleManager.sol**: Manages oracle data feeds

## Workflow Overview

1. Users connect wallet & sign transactions
2. Protocol checks oracle price feed
3. Liquidity pool executes trade or synthetic derivative creation

## DAO Hooks

Future integration with DAO governance via REChain DAO module

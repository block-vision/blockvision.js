# BlockVision SDK for JavaScript

The BlockVision SDK is more convenient for developers to interact with the blockchain when using BlockVision API.

After extending Ethers.js UrlJsonRpcProvider and WebSocketProvider, the SDK supports the exact same syntax and functionality.
At the same time, with the help of BlockVision’s powerful node infrastructure, not only has first-class node reliability, scalability and data accuracy, it also adds a number of improvements on top of Ethers, such as easy access to Blockvision's enhanced API, NFT API, FT API, DeFi API, Mempool API, and powerful WebSockets improvements.

The SDK currently supports the following chains:
- **Ethereum**: `ETH_MAINNET`, `ETH_GOERLI`
- **BNB Chain**: `BNB_MAINNET`, `BNB_TESTNET`
- **Arbitrum**: `ARB_MAINNET`, `ARB_GOERLI`
- **Optimism**: `OPT_MAINNET`, `OPT_GOERLI`
- **Polygon**: `POL_MAINNET`, `POL_TESTNET`
- **Sui**: `SUI_DEVNET`, `SUI_TESTNET`

You can find the introduction of SDK methods, usage examples, etc. in our [BlockVision Docs](https://docs.blockvision.org/blockvision/chain-apis/ethereum).

## Getting started

**Install SDK**
```    
npm install blockvision.js
```
**Import and use the SDK**
```typescript
import { BlockVisionProvider, BlockVisionWebSocketProvider, BvNetwork } from 'blockvision.js'

// Optional parameters, but default to eth-mainnet and default api-key.
const bv = new BlockVisionProvider(BvNetwork.ETH_MAINNET)
const bvWs = new BlockVisionWebSocketProvider(BvNetwork.ETH_MAINNET)
```

> ⚠️ The code sample above uses the default API key, which may be rate limited based on traffic. To avoid this, create your own API key by signing up for a BlockVision account and creating an app on your dashboard to generate a key. This will allow you to customize your API key and avoid potential rate limiting. 

Now you can access the BlockVision API through the `BlockVisionProvider` or `BlockVisionWebSocketProvider` object.

## Using the BlockVision SDK for JavaScript

You can access Ethers.js's native methods, as well as BlockVision's enhanced API, NFT API, FT API, DeFi API, and Mempool API through the BlockVisionProvider object. Additionally, you can access WebSockets improvements through the BlockVisionWebSocketProvider object. This allows you to easily take advantage of a wide range of functionality and features provided by the BlockVision API.
```typescript
import { BlockVisionProvider, BlockVisionWebSocketProvider, BvNetwork } from 'blockvision.js'

// Optional parameters, but default to eth-mainnet and default api-key.
const bv = new BlockVisionProvider(BvNetwork.ETH_MAINNET)
const bvWs = new BlockVisionWebSocketProvider(BvNetwork.ETH_MAINNET)

// Access standard Ethers.js JSON-RPC node request
bv.getBalance('0x407d73d8a49eeb85d32cf465507dd71d507100c1').then(console.log)

// Access BlockVision Enhanced API requests
bv.traceBlock('0x3ef221').then(console.log)

// Access the BlockVision NFT API
bv.getNFTMetadata({
    tokenId: '1',
    contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'
}).then(console.log)

// Access the BlockVision FT API
bv.getERC20Balance({
    contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    accountAddress: '0x02D436DC483f445f63Aac45b37db0eE661949842'
}).then(console.log)

// Access the BlockVision DeFi API
bv.getAccountDeFiPortfolio({
    protocol: 'uniswapv2',
    accountAddress: '0x76c9985d294d9aeadd33f451bfb59bc69b20c474'
}).then(console.log)

// Access the BlockVision Mempool API
bv.getSendBundle({
    txsHex: [
        '0x02f874058085012a05f2008504a817c80082520894ba849911c809f6c922bc4767328a01db30c331e588058d15e17628000080c001a04cf959d89535bc942c3ac3ced842989d8f8452757bba5bba2815ac4afa67c073a005dd3ee1ffd916ec5f3003a94f2c58961f5e1ef04dcfc074be1a18069fe923df'
    ]
}).then(console.log)
```
The previous section explained how to use the BlockVision SDK. In the following section, we will cover some of the SDK's configuration options and method types.

## Learn more about BlockVision SDK for JavaScript

### basic configuration
The BlockVisionProvider and BlockVisionWebSocketProvider objects both have two optional parameters: network and apikey.

- **network(optional)**: The `network` parameter allows you to specify which blockchain and network you want to interact with. It supports 6 chains and 12 networks. For more details, see the documentation at the beginning of this guide.
- **apikey(optional)**: The `apikey` parameter allows you to specify an API key to use when making requests to the BlockVision API. If you do not specify an API key, the default key will be used. However, please note that the default key has a rate limit, so it is recommended that you create your own key by signing up for a BlockVision account.

### [Ethers.js Provider](https://docs.ethers.io/v5/api/) methods
The SDK supports almost all of the methods provided by the Ethers.js Provider object, and also includes a number of additional methods.
- `getUncleCount()`: Get the number of uncles in a block from a block matching the given block hash or tag.
- `getUncleByIndex()`: Get information about a uncle of a block by hash or tag and uncle index position.
- `getBlockTransactionByIndex()`: Get information about a transaction by block hash or tag and transaction index position.
- `getBlockTransactionCount()`: Get the number of transactions in the given block.
- `getMaxPriorityFeePerGas()`: Get a fee per gas that is an estimate of how much you can pay as a priority fee, or "tip", to get a transaction included in the current block.
- `getSyncing()`: Get an object with data about the sync status or false.
- `getChainId()`: Get the currently configured chain ID, a value used in replay-protected transaction signing as introduced by EIP-155.
- `getFeeHistory()`: Get a collection of historical gas information from which you can decide what to submit as your maxFeePerGas and/or maxPriorityFeePerGas. This method was introduced with EIP 1559.
- `getProtocolVersion()`: Get the current ethereum protocol version.
- `getSHA3()`: Get Keccak-256 (not the standardized SHA3-256) of the given data.

### BlockVision Enhanced API
In order to support more functions and expand more businesses, BlockVision provides the following enhanced APIs for Ethereum, Optimism and Arbitrum:
- `getBlockReceipts()`: Get all transaction receipts for a given block on Ethereum. Supported on Ethereum.
- `getClientVersion()`: Get the current client version. Supported on Ethereum.
- `getListening()`: Get true if the client is actively listening for network connections. Supported on Ethereum.
- `traceCall()`: Get a number of possible traces. Supported on Ethereum.
- `traceCallMany()`: Get a number of possible traces. Supported on Ethereum.
- `traceTransaction()`: Get all traces of given transaction. Supported on Ethereum.
- `traceGet()`: Get trace at given position. Supported on Ethereum.
- `traceBlock()`: Get traces created at given block. Supported on Ethereum.
- `getNewFilter()`: Creates a filter object, based on filter options, to notify when the state changes (logs). Supported on Arbitrum and Optimism.
- `getUninstallFilter()`: Get true if the filter was successfully uninstalled, otherwise false. Supported on Arbitrum and Optimism.
- `getNewBlockFilter()`: Creates a filter in the node, to notify when a new block arrives. Supported on Arbitrum and Optimism.
- `getNewPendingTransactionFilter()`: Creates a filter in the node, to notify when new pending transactions arrive. Supported on Arbitrum and Optimism.
- `getFilterLogs()`: Get an array of all logs matching filter with given id. Supported on Arbitrum and Optimism.
- `getFilterChanges()`: Polling method for a filter, which returns an array of logs which occurred since last poll. Supported on Arbitrum and Optimism.

### BlockVision FT Methods
> An ERC20 token contract keeps track of fungible tokens(FT): any one token is exactly equal to any other token; no tokens have special rights or behavior associated with them. This makes ERC20 tokens useful for things like a medium of exchange currency, voting rights, staking, and more.

The SDK FT Methods can interact with ERC20 contracts, view and learn all FT related functions [here](https://docs.blockvision.org/blockvision/indexing-apis/ft-api).

### BlockVision NFT Methods
> In scenarios such as real estate, voting rights, or collectibles, certain items are more valuable than others due to usefulness, rarity, etc. ERC721 is a standard for representing ownership of non-fungible tokens, that is, where each token is unique.
> ERC721 is a more complex standard than ERC20, with multiple optional extensions, and is split across a number of contracts.

The SDK NFT Methods can interact with ERC721 contracts, view and learn all NFT related functions [here](https://docs.blockvision.org/blockvision/indexing-apis/nft-api).

### BlockVision Account Methods
The SDK Account Methods can acquire a wide range of NFT, FT, etc., data owned by a specific holder, view and learn all Account related functions [here](https://docs.blockvision.org/blockvision/indexing-apis/account-api).

### BlockVision DeFi Methods
The SDK DeFi methods can obtain the positions and assets of the account in the supported DeFi protocols. Using this method, you can find out things like liquidity pool, supply, borrow, rewards, farming, locking, yield, deposits, staked assets, token information, and dollar amount for each token. Call this method to do some DeFi research and strategy.
View and learn all DeFi related functions [here](https://docs.blockvision.org/blockvision/indexing-apis/defi).

### BlockVision Mempool Methods
> The BlockVision Mempool module provides two main features. First, you can easily subscribe to events such as `bvPendingTransactions`, `newPendingTransactions`, `newHeads`, and `logs` using the eth_subscribe method provided by the SDK.
> Second, you can use the `eth_sendBundle` series of methods to easily interact with the FlashBots functionality and conveniently complete your on-chain arbitrage activities.

The SDK provides a range of Mempool methods that allow you to easily access real-time data about pending transactions and events on chain. The SDK also offers convenient tools to help you interact with FlashBots. For more details on these methods and how to use them, please see the documentation or the code examples in this [guide](https://docs.blockvision.org/blockvision/indexing-apis/mempool).

## Questions and Feedback

In our [documentation](https://docs.blockvision.org/blockvision/chain-apis/ethereum) you can find how to use all the SDK, if you have any questions, issues, or feedback, please file the issue on [GitHub](https://github.com/block-vision/blockvision.js/issues), or drop us a message on our [Discord](https://discord.gg/Re6prK86Tr) channel for the SDK query.
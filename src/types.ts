export enum BvNetwork {
	ETH_MAINNET = 'homestead',
	ETH_GOERLI = 'goerli',
	BNB_MAINNET = 'bnb',
	BNB_TESTNET = 'bnbt',
	ARB_MAINNET = 'arbitrum',
	ARB_GOERLI = 'arbitrum-goerli',
	OPT_MAINNET = 'optimism',
	OPT_GOERLI = 'optimism-goerli',
	POL_MAINNET = 'matic',
	POL_TESTNET = 'maticmum',
	SUI_MAINNET = 'sui',
	SUI_TESTNET = 'suit',
	SUI_DEVNET = 'suid'
}

export type Tag = 'latest' | 'earliest' | 'pending'

export interface TraceTransaction {
	from?: string
	to?: string
	gas?: number
	value?: string
	gasPrice?: number
	data?: string
}

export type TraceType = 'vmTrace' | 'trace' | 'stateDiff'

export interface TransfersOptional {
	accountAddress?: string
	contractAddress?: string
	fromBlockNumber?: number
	toBlockNumber?: number
	fromAddress?: string
	toAddress?: string
	pageSize?: number
	pageIndex?: number
}
export interface TransfersRequired {
	contractAddress: string
	accountAddress?: string
	fromBlockNumber?: number
	toBlockNumber?: number
	fromAddress?: string
	toAddress?: string
	pageSize?: number
	pageIndex?: number
}

export interface EthTransfers {
	accountAddress?: string
	fromAddress?: string
	toAddress?: string
	fromBlockNumber?: number
	toBlockNumber?: number
	txHash?: string
	pageSize?: number
	pageIndex?: number
}

export type CategoryType = 'mint' | 'burn' | 'all'
export interface ERC20MintsBurns {
	contractAddress: string
	fromBlockNumber?: number
	toBlockNumber?: number
	category?: CategoryType
	pageSize?: number
	pageIndex?: number
}

export interface ERC20BalanceChangedList {
	contractAddress: string
	accountAddress: string
	fromBlockNumber?: number
	toBlockNumber?: number
	pageSize?: number
	pageIndex?: number
}

export interface NFTMints {
	contractAddress?: string
	accountAddress?: string
	pageSize?: number
	pageIndex?: number
}

export interface NFTAccountPositions {
	accountAddress: string
	blockNumber?: number
	pageSize?: number
	pageIndex?: number
}

export interface NFTAccountTokenIDs {
	contractAddress: string
	accountAddress: string
	blockNumber?: number
	pageSize?: number
	pageIndex?: number
}

export interface NFTBalance {
	contractAddress: string
	accountAddress: string
	tokenId?: string
	blockNumber?: number
}

export interface NFTCollectionHolders {
	contractAddress: string
	blockNumber?: number
	pageSize?: number
	pageIndex?: number
}

export interface NFTCirculations {
	tokenId: string
	contractAddress: string
	accountAddress?: string
	pageSize?: number
	pageIndex?: number
}

export interface NFTCollectionNfts {
	contractAddress: string
	withMetadata?: boolean
	pageSize?: number
	pageIndex?: number
}

export interface NFTListings {
	contractAddress: string
	tokenId: string
	pageSize?: number
	pageIndex?: number
}

export interface getTransactionByAccount {
	fromAddress?: string
	toAddress?: string
	fromBlockNumber?: number
	toBlockNumber?: number
	pageSize?: number
	pageIndex?: number
}

import { deepCopy, defineReadOnly } from '@ethersproject/properties'
import { Logger } from '@ethersproject/logger'
import { version } from './_version'
import {
	BlockTag,
	CommunityResourcable,
	UrlJsonRpcProvider,
	WebSocketProvider,
	Network
} from '@ethersproject/providers'
import { ConnectionInfo, fetchJson } from '@ethersproject/web'
import { isHexString } from '@ethersproject/bytes'
import { getDefaultApiKeyPrefix, showThrottleMessage } from './util'
import { Network as NetworkFromEthers, getNetwork as getNetworkFromEthers, Networkish } from '@ethersproject/networks'
import {
	BvNetwork,
	ERC20BalanceChangedList,
	ERC20MintsBurns,
	TransfersOptional,
	EthTransfers,
	TransfersRequired,
	Tag,
	TraceTransaction,
	TraceType,
	NFTMints,
	NFTAccountPositions,
	NFTAccountTokenIDs,
	NFTBalance,
	NFTCollectionHolders,
	NFTCirculations,
	NFTCollectionNfts,
	NFTListings,
	getTransactionByAccount
} from './types'

import { w3cwebsocket as NodeWebsocket } from 'websocket'

const logger = new Logger(version)

const defaultApiKey = '2D1t7BmW5EHTswWSlDxczYVAVC'

const CustomNetworks: { [key: string]: NetworkFromEthers } = {
	sui: {
		chainId: 6000,
		name: 'sui-mainnet'
	},
	suid: {
		chainId: 600,
		name: 'sui-devnet'
	},
	suit: {
		chainId: 601,
		name: 'sui-testnet'
	}
}

export class BlockVisionWebSocketProvider extends WebSocketProvider implements CommunityResourcable {
	readonly apiKey!: string
	readonly url!: string

	constructor(network?: BvNetwork, apiKey?: string | null) {
		const provider = new BlockVisionProvider(network, apiKey)

		const url = provider.connection.url.replace(/^http/i, 'ws')

		super(url, provider.network)
		this.url = url
		defineReadOnly(this, 'apiKey', provider.apiKey)
	}

	isCommunityResource(): boolean {
		return this.apiKey === defaultApiKey
	}

	/**
	 * You can subscribe to events via _bvSubscribe method.
	 *
	 * @param eventType 'bvPendingTransactions' | 'newPendingTransactions' | 'newHeads' | 'logs'
	 * @param callback After the websocket is established, the callback method to be called
	 * @param params When eventType is bvPendingTransactions, the format of params is { fromAddress?: string[]; toAddress?: string[]; methodIds?: string[] }.When eventType is logs, the format of params is { address?: string[]; topics?: string[] }.
	 * @returns subscription information
	 */
	_bvSubscribe(
		eventType: 'bvPendingTransactions' | 'newPendingTransactions' | 'newHeads' | 'logs',
		callback: { open?: Function; message: Function; error?: Function },
		params?: Object
	) {
		let subParams =
			(eventType === 'bvPendingTransactions' || eventType === 'logs') && params ? [eventType, params] : [eventType]
		const data = { jsonrpc: '2.0', id: 1, method: 'eth_subscribe', params: subParams }

		let wsRef = { closeInitiated: false, ws: new NodeWebsocket(this.url) }
		let ws: any

		const initConnect = () => {
			if (typeof window === 'object') {
				ws = new WebSocket(this.url)
				wsRef.ws = ws

				ws.onopen = () => {
					ws.send(JSON.stringify(data))
					callback.open && callback.open()
				}
				ws.onmessage = (event: any) => {
					callback.message && callback.message(JSON.parse(event.data))
				}
				ws.onerror = (err: any) => {
					callback.error && callback.error(err)
				}
				ws.onclose = () => {
					if (!wsRef.closeInitiated) {
						setTimeout(() => {
							initConnect()
						}, 1000)
					} else {
						wsRef.closeInitiated = false
					}
				}
			} else {
				ws = new NodeWebsocket(this.url)
				wsRef.ws = ws

				ws.onopen = () => {
					ws.send(JSON.stringify(data))
					callback.open && callback.open()
				}
				ws.onmessage = (event: any) => {
					callback.message && callback.message(JSON.parse(event.data))
				}
				ws.onerror = (err: any) => {
					callback.error && callback.error(err)
				}
				ws.onclose = () => {
					if (!wsRef.closeInitiated) {
						setTimeout(() => {
							initConnect()
						}, 1000)
					} else {
						wsRef.closeInitiated = false
					}
				}
			}
		}
		initConnect()
		return wsRef
	}

	/**
	 * Disconnect the websocket connection established by _bvSubscribe
	 */
	_bvUnsubscribe(wsRef: { ws: WebSocket; closeInitiated: boolean }) {
		if (!wsRef || !wsRef.ws) return logger.throwError('No connection to close.')
		else {
			wsRef.closeInitiated = true
			wsRef.ws.close()
		}
	}
}

export class BlockVisionProvider extends UrlJsonRpcProvider {
	constructor(network?: BvNetwork, apiKey?: string | null) {
		super(network, apiKey)
	}

	static getWebSocketProvider(network?: BvNetwork, apiKey?: any): BlockVisionWebSocketProvider {
		return new BlockVisionWebSocketProvider(network, apiKey)
	}

	static getApiKey(apiKey?: string | null): any {
		if (!apiKey) {
			return defaultApiKey
		}
		if (apiKey && typeof apiKey !== 'string') {
			throw new Error(`Invalid apiKey '${apiKey}' provided. apiKey must be a string.`)
		}
		return apiKey
	}

	static getNetwork(network: Networkish): NetworkFromEthers {
		if (typeof network === 'string' && network in CustomNetworks) {
			return CustomNetworks[network]
		}

		return getNetworkFromEthers(network)
	}

	static getUrl(network: Network, apiKey: string): ConnectionInfo {
		let host: string | null = null
		switch (network.name) {
			case 'homestead':
				host = 'eth-mainnet.blockvision.org/v1/'
				break
			case 'goerli':
				host = 'eth-goerli.blockvision.org/v1/'
				break
			case 'bnb':
				host = 'bsc-mainnet.blockvision.org/v1/'
				break
			case 'bnbt':
				host = 'bsc-testnet.blockvision.org/v1/'
				break
			case 'optimism':
				host = 'opt-mainnet.blockvision.org/v1/'
				break
			case 'optimism-goerli':
				host = 'opt-goerli.blockvision.org/v1/'
				break
			case 'arbitrum':
				host = 'arb-mainnet.blockvision.org/v1/'
				break
			case 'arbitrum-goerli':
				host = 'arb-goerli.blockvision.org/v1/'
				break
			case 'matic':
				host = 'pol-mainnet.blockvision.org/v1/'
				break
			case 'maticmum':
				host = 'pol-testnet.blockvision.org/v1/'
				break
			case 'sui-devnet':
				host = 'sui-devnet.blockvision.org/v1/'
				break
			case 'sui-testnet':
				host = 'sui-testnet.blockvision.org/v1/'
				break

			default:
				throw new Error('Unsupported network')
		}

		return {
			allowGzip: true,
			url: `https://${host}${apiKey === defaultApiKey ? getDefaultApiKeyPrefix(network) : ''}${apiKey}`,
			throttleCallback: (attempt: number, url: string) => {
				if (apiKey === defaultApiKey) {
					showThrottleMessage()
				}
				return Promise.resolve(true)
			}
		}
	}

	isCommunityResource(): boolean {
		return this.apiKey === defaultApiKey
	}

	/**
	 * @returns Process the return result of the request
	 */
	getApiResult(payload: { error?: { code?: number; data?: any; message?: string }; result?: any }): any {
		if (payload.error) {
			const error: any = new Error(payload.error.message)
			error.code = payload.error.code
			error.data = payload.error.data
			throw error
		}

		return payload.result
	}

	/**
	 * the function receives a request whose data format is an object
	 *
	 * @param method method of request
	 * @param params request parameters
	 * @returns the result returned by the interface
	 */
	sendRest(method: string, params: object): Promise<any> {
		const request = {
			method: method,
			params: params,
			id: this._nextId++,
			jsonrpc: '2.0'
		}
		this.emit('debug', {
			action: 'request',
			request: deepCopy(request),
			provider: this
		})

		const result = fetchJson(this.connection, JSON.stringify(request), this.getApiResult).then(
			result => {
				this.emit('debug', {
					action: 'response',
					request: request,
					response: result,
					provider: this
				})

				return result
			},
			error => {
				this.emit('debug', {
					action: 'response',
					error: error,
					request: request,
					provider: this
				})

				throw error
			}
		)

		return result
	}

	/**
	 * BlockVision Blocks Methods
	 *
	 * Returns the number of uncles in a block from a block matching the given block hash or tag.
	 *
	 * @param blockHashOrBlockTag block number or block hash, or the string “latest”, “earliest” or “pending”
	 * @returns the hex-digit string
	 */
	async getUncleCount(blockHashOrBlockTag: Tag | BlockTag | Promise<Tag | BlockTag>): Promise<string> {
		await this.getNetwork()

		blockHashOrBlockTag = await blockHashOrBlockTag

		if (isHexString(blockHashOrBlockTag, 32)) {
			return await this.send('eth_getUncleCountByBlockHash', [blockHashOrBlockTag])
		} else {
			return await this.send('eth_getUncleCountByBlockNumber', [blockHashOrBlockTag])
		}
	}

	/**
	 * BlockVision Blocks Methods
	 *
	 * Returns information about a uncle of a block by hash or tag and uncle index position.
	 *
	 * @param blockHashOrBlockTag block number or block hash, or the string “latest”, “earliest” or “pending”
	 * @param index hex-digit string, the uncle’s index position.
	 * @returns uncle block's information
	 */
	async getUncleByIndex(blockHashOrBlockTag: Tag | BlockTag | Promise<Tag | BlockTag>, index: string): Promise<object> {
		await this.getNetwork()

		blockHashOrBlockTag = await blockHashOrBlockTag

		if (isHexString(blockHashOrBlockTag, 32)) {
			return await this.send('eth_getUncleByBlockHashAndIndex', [blockHashOrBlockTag, index])
		} else {
			return await this.send('eth_getUncleByBlockNumberAndIndex', [blockHashOrBlockTag, index])
		}
	}

	/**
	 * BlockVision Networks Status Network
	 *
	 * Returns a fee per gas that is an estimate of how much you can pay as a priority fee, or "tip", to get a transaction included in the current block.
	 *
	 * @returns the hex-digit string
	 */
	async getMaxPriorityFeePerGas(): Promise<string> {
		await this.getNetwork()

		return await this.send('eth_maxPriorityFeePerGas', [])
	}

	/**
	 * BlockVision Networks Status Network
	 *
	 * Returns an object with data about the sync status or false.
	 *
	 * @returns string or false.
	 */
	async getSyncing(): Promise<boolean | string> {
		await this.getNetwork()

		return await this.send('eth_syncing', [])
	}

	/**
	 * BlockVision Networks Status Network
	 *
	 * Returns the currently configured chain ID, a value used in replay-protected transaction signing as introduced by EIP-155.
	 *
	 * @returns the hex-digit string
	 */
	async getChainId(): Promise<boolean | string> {
		await this.getNetwork()

		return await this.send('eth_chainId', [])
	}

	/**
	 * BlockVision Networks Status Network
	 *
	 * Returns a collection of historical gas information from which you can decide what to submit as your maxFeePerGas and/or maxPriorityFeePerGas. This method was introduced with EIP 1559.
	 *
	 * @param blockCount number of blocks in the requested range. Between 1 and 1024 blocks can be requested in a single query. Less than requested may be returned if not all blocks are available.
	 * @param newestBlock highest number block of the requested range.
	 * @param rewardPercentiles a monotonically increasing list of percentile values to sample from each block's effective priority fees per gas in ascending order, weighted by gas used.
	 * @returns the hex-digit string
	 */
	async getFeeHistory(
		blockCount: number | string,
		newestBlock: BlockTag,
		rewardPercentiles: number[]
	): Promise<object> {
		await this.getNetwork()

		return await this.send('eth_feeHistory', [blockCount, newestBlock, rewardPercentiles])
	}

	/**
	 * BlockVision Networks Status Network
	 *
	 * Returns the current ethereum protocol version.
	 *
	 * @returns the hex-digit string
	 */
	async getProtocolVersion(): Promise<boolean | string> {
		await this.getNetwork()

		return await this.send('eth_protocolVersion', [])
	}

	/**
	 *
	 * Returns Keccak-256 (not the standardized SHA3-256) of the given data.
	 *
	 * @param DATA The data to convert into a SHA3 hash.
	 * @returns The Keccak-256 hash
	 */
	async getSHA3(DATA: string): Promise<string> {
		await this.getNetwork()

		if (!isHexString(DATA)) {
			return logger.throwArgumentError('invalid DATA', 'DATA', DATA)
		}

		return await this.send('web3_sha3', [DATA])
	}

	/**
	 * BlockVision Networks Status Network
	 *
	 * Returns the current client version.
	 *
	 * @returns The current client version
	 */
	async getClientVersion(): Promise<string> {
		await this.getNetwork()

		return await this.send('web3_clientVersion', [])
	}

	/**
	 * BlockVision Networks Status Network
	 *
	 * Returns true if the client is actively listening for network connections.
	 *
	 * @returns Returns true when actively listening, otherwise false.
	 */
	async getListening(): Promise<boolean> {
		await this.getNetwork()

		return await this.send('net_listening', [])
	}

	/**
	 * BlockVision Transcations Methods
	 *
	 * Returns information about a transaction by block hash or tag and transaction index position.
	 *
	 * @param blockHashOrBlockTag block number or block hash, or the string “latest”, “earliest” or “pending”
	 * @param index the hex-digit string
	 * @returns the transaction
	 */
	async getBlockTransactionByIndex(
		blockHashOrBlockTag: Tag | BlockTag | Promise<Tag | BlockTag>,
		index: string
	): Promise<object> {
		await this.getNetwork()

		blockHashOrBlockTag = await blockHashOrBlockTag

		if (isHexString(blockHashOrBlockTag, 32)) {
			return await this.send('eth_getTransactionByBlockHashAndIndex', [blockHashOrBlockTag, index])
		} else {
			return await this.send('eth_getTransactionByBlockNumberAndIndex', [blockHashOrBlockTag, index])
		}
	}

	/**
	 * BlockVision Transcations Methods
	 *
	 * Returns the number of transactions in the given block.
	 *
	 * @param blockHashOrBlockTag block number or block hash, or the string “latest”, “earliest” or “pending”
	 * @returns the hex-digit string
	 */
	async getBlockTransactionCount(blockHashOrBlockTag: Tag | BlockTag | Promise<Tag | BlockTag>): Promise<string> {
		await this.getNetwork()

		blockHashOrBlockTag = await blockHashOrBlockTag

		if (isHexString(blockHashOrBlockTag, 32)) {
			return await this.send('eth_getBlockTransactionCountByHash', [blockHashOrBlockTag])
		} else {
			return await this.send('eth_getBlockTransactionCountByNumber', [blockHashOrBlockTag])
		}
	}

	/**
	 * BlockVision Transcations Methods
	 *
	 * Get all transaction receipts for a given block on Ethereum.
	 *
	 * @param blockHashOrBlockTag block number or block hash, or the string “latest”, “earliest” or “pending”
	 * @returns the Receipts
	 */
	async getBlockReceipts(blockHashOrBlockTag: Tag | BlockTag | Promise<Tag | BlockTag>): Promise<object> {
		await this.getNetwork()

		blockHashOrBlockTag = await blockHashOrBlockTag

		return await this.send('eth_getBlockReceipts', [blockHashOrBlockTag])
	}

	/**
	 * BlockVision Traces Methods
	 *
	 * Executes the given call and returns a number of possible traces for it.
	 *
	 * @param transaction Transaction object where from field is optional and nonce field is ommited.
	 * @param types Type of trace, one or more of: "vmTrace", "trace", "stateDiff".
	 * @param blockTag (optional) Integer of a block number, or the string 'earliest', 'latest' or 'pending'.
	 * @returns Block traces
	 */
	async traceCall(
		transaction: TraceTransaction,
		types: TraceType[],
		blockTag?: Tag | BlockTag | Promise<Tag | BlockTag>
	): Promise<object> {
		await this.getNetwork()

		blockTag = await blockTag

		return await this.send('trace_call', [transaction, types, blockTag])
	}

	/**
	 * BlockVision Traces Methods
	 *
	 * Performs multiple call traces on top of the same block. Allows to trace dependent transactions.
	 *
	 * @param types List of trace calls with the type of trace, one or more of: "vmTrace", "trace", "stateDiff".
	 * @param blockTag (optional) Integer block number, or the string 'latest', 'earliest' or 'pending'.
	 * @returns Array of the given transactions’ traces
	 */
	async traceCallMany(
		types: [TraceTransaction, TraceType[]][],
		blockTag?: Tag | BlockTag | Promise<Tag | BlockTag>
	): Promise<object> {
		await this.getNetwork()

		blockTag = await blockTag

		return await this.send('trace_callMany', [types, blockTag])
	}

	/**
	 * BlockVision Traces Methods
	 *
	 * Returns all traces of given transaction.
	 *
	 * @param transactionHash Transaction hash
	 * @returns Traces of given transaction
	 */
	async traceTransaction(transactionHash: string): Promise<Array<object>> {
		await this.getNetwork()

		if (!isHexString(transactionHash)) {
			return logger.throwArgumentError('invalid Transaction Hash', 'Transaction Hash', transactionHash)
		}

		return await this.send('trace_transaction', [transactionHash])
	}

	/**
	 * BlockVision Traces Methods
	 *
	 * Returns trace at given position.
	 *
	 * @param transactionHash Transaction hash.
	 * @param positions Index positions of the traces.
	 * @returns Trace object
	 */
	async traceGet(transactionHash: string, positions: string[]): Promise<object> {
		await this.getNetwork()

		if (!isHexString(transactionHash)) {
			return logger.throwArgumentError('invalid Transaction Hash', 'Transaction Hash', transactionHash)
		}

		return await this.send('trace_get', [transactionHash, positions])
	}

	/**
	 * BlockVision Traces Methods
	 *
	 * Returns traces created at given block.
	 *
	 * @param blockTag Integer of a block number, or the string 'earliest', 'latest' or 'pending'.
	 * @returns Block traces
	 */
	async traceBlock(blockTag: Tag | BlockTag | Promise<Tag | BlockTag>): Promise<Array<object>> {
		await this.getNetwork()

		return await this.send('trace_block', [blockTag])
	}

	/**
	 * BlockVision BSC Methods
	 *
	 * Returns all transaction receipts for a given block.
	 *
	 * @param blockNumber integer block number in hex string format.
	 * @returns all transaction receipts for a given block.
	 */
	async getTransactionReceiptsByBlockNumber(blockNumber: string): Promise<Array<object>> {
		await this.getNetwork()

		if (isHexString(blockNumber)) {
			return logger.throwArgumentError('invalid blockNumber', 'blockNumber', blockNumber)
		}

		return await this.send('eth_getTransactionReceiptsByBlockNumber', [blockNumber])
	}

	/**
	 * BlockVision Arbitrum/Optimism Methods
	 *
	 * Creates a filter object, based on filter options, to notify when the state changes (logs). To check if the state has changed, call eth_getFilterChanges.
	 *
	 * @param fromBlock (optional) Integer block number, or "latest" for the last mined block or "pending", "earliest" for not yet mined transactions.
	 * @param toBlock (optional) Integer block number, or "latest" for the last mined block or "pending", "earliest" for not yet mined transactions.
	 * @param address (optional) Contract address or a list of addresses from which logs should originate.
	 * @param topics (optional) Array of 32 Bytes DATA topics. Topics are order-dependent. Each topic can also be an array of DATA with "or" options.
	 * @returns A filter id.
	 */
	async getNewFilter(
		object: {
			fromBlock?: Tag | BlockTag | Promise<Tag | BlockTag>
			toBlock?: Tag | BlockTag | Promise<Tag | BlockTag>
			address?: string | Array<string>
			topics?: (string | Array<string> | null)[]
		}[]
	): Promise<string> {
		await this.getNetwork()

		return await this.send('eth_newFilter', object)
	}

	/**
	 * BlockVision Arbitrum/Optimism Methods
	 *
	 * Uninstalls a filter with given id. Should always be called when watch is no longer needed. Additionally Filters timeout when they aren't requested with eth_getFilterChanges for a period of time.
	 *
	 * @param QUANTITY The filter id.
	 * @returns true if the filter was successfully uninstalled, otherwise false.
	 */
	async getUninstallFilter(QUANTITY?: string): Promise<boolean> {
		await this.getNetwork()

		return await this.send('eth_uninstallFilter', [QUANTITY])
	}

	/**
	 * BlockVision Arbitrum/Optimism Methods
	 *
	 * Creates a filter in the node, to notify when a new block arrives. To check if the state has changed, call eth_getFilterChanges.
	 *
	 * @returns A filter id.
	 */
	async getNewBlockFilter(): Promise<string> {
		await this.getNetwork()

		return await this.send('eth_newBlockFilter', [])
	}

	/**
	 * BlockVision Arbitrum/Optimism Methods
	 *
	 * Creates a filter in the node, to notify when new pending transactions arrive. To check if the state has changed, call eth_getFilterChanges.
	 *
	 * @returns A filter id.
	 */
	async getNewPendingTransactionFilter(): Promise<string> {
		await this.getNetwork()

		return await this.send('eth_newPendingTransactionFilter', [])
	}

	/**
	 * BlockVision Arbitrum/Optimism Methods
	 *
	 * Returns an array of all logs matching filter with given id.
	 *
	 * @param QUANTITY The filter id.
	 * @returns Array of log objects, or an empty array if nothing has changed since last poll.
	 */
	async getFilterLogs(QUANTITY: string): Promise<string> {
		await this.getNetwork()

		return await this.send('eth_getFilterLogs', [QUANTITY])
	}

	/**
	 * BlockVision Arbitrum/Optimism Methods
	 *
	 * Polling method for a filter, which returns an array of logs which occurred since last poll.
	 *
	 * @param QUANTITY The filter id.
	 * @returns Array of log objects, or an empty array if nothing has changed since last poll.
	 */
	async getFilterChanges(QUANTITY: string): Promise<string> {
		await this.getNetwork()

		return await this.send('eth_getFilterChanges', [QUANTITY])
	}

	/**
	 * BlockVision ERC20 Methods
	 *
	 * Get the history of ERC20 transfer events for any address without scanning the entire chain.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param accountAddress (optional) the account address to filter for.
	 * @param contractAddress (optional) the ERC20 contact address to filter for.
	 * @param fromBlockNumber (optional) the starting time range you want to fetch events over.
	 * @param toBlockNumber (optional) the ending time range you want to fetch events over.
	 * @param fromAddress (optional) the sending address in the transaction.
	 * @param toAddress (optional) the receiving address in the transaction.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the history of ERC20 transfer events.
	 */
	async getERC20Transfers(object: TransfersOptional): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('erc20_transfers', object)
	}

	/**
	 * BlockVision ERC20 Methods
	 *
	 * Get the history of transmission events for any address without scanning the entire chain.
	 *
	 * Supported on Ethereum.
	 *
	 * @param accountAddress (optional) the account address to filter for.
	 * @param fromAddress (optional) the sending address in the transaction.
	 * @param toAddress (optional) the receiving address in the transaction.
	 * @param fromBlockNumber (optional) the starting time range you want to fetch events over.
	 * @param toBlockNumber (optional) the ending time range you want to fetch events over.
	 * @param txHash (optional) the hash code for the transaction.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the history of transmission events.
	 */
	async getEthTransfers(object: EthTransfers): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('eth_transfers', object)
	}

	/**
	 * BlockVision ERC20 Methods
	 *
	 * Get the history of ERC20 approval events for any address without scanning the entire chain.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param accountAddress (optional) the account address to filter for.
	 * @param contractAddress (optional) the ERC20 contact address to filter for.
	 * @param fromBlockNumber (optional) the starting time range you want to fetch events over.
	 * @param toBlockNumber (optional) the ending time range you want to fetch events over.
	 * @param fromAddress (optional) the sending address in the transaction.
	 * @param toAddress (optional) the receiving address in the transaction.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the history of ERC20 approval events.
	 */
	async getERC20Approvals(object: TransfersOptional): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('erc20_approvals', object)
	}

	/**
	 * BlockVision ERC20 Methods
	 *
	 * Get the history of mint and burn events for any erc20 contract address.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the ERC20 contact address to filter for.
	 * @param fromBlockNumber (optional) the starting time range you want to fetch events over.
	 * @param toBlockNumber (optional) the ending time range you want to fetch events over.
	 * @param category (optional) mint or burn or all.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the history of mint and burn events.
	 */
	async getERC20MintsBurns(object: ERC20MintsBurns): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('erc20_mintsBurns', object)
	}

	/**
	 * BlockVision ERC20 Methods
	 *
	 * Get the balance of the account address.
	 *
	 * Supported on Ethereum, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the ERC20 contact address to filter for.
	 * @param accountAddress the account address you want to query.
	 * @param blockNumber (optional) the blockNumber for snapshot query (default latest). BlockVision can not only support users to query the current information, but also support users to query the historical information at any time.
	 * @returns the balance of the account address.
	 */
	async getERC20Balance(object: {
		contractAddress: string
		accountAddress: string
		blockNumber?: number
	}): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('erc20_balance', object)
	}

	/**
	 * BlockVision ERC20 Methods
	 *
	 * Get the historical balance for any address without scanning the entire chain.
	 *
	 * Supported on Ethereum.
	 *
	 * @param accountAddress the account address to filter for.
	 * @param contractAddress the ERC20 contact address to filter for.
	 * @param fromBlockNumber (optional) the starting time range you want to fetch events over.
	 * @param toBlockNumber (optional) the ending time range you want to fetch events over.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the historical balance for any address.
	 */
	async getERC20BalanceChangedList(object: ERC20BalanceChangedList): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('erc20_balanceChangedList', object)
	}

	/**
	 * BlockVision ERC20 Methods
	 *
	 * Get total supply information for erc20 contracts.
	 *
	 * Supported on Ethereum, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the contract address for ERC20 token.
	 * @param blockNumber (optional) the blockNumber for snapshot query (default latest). BlockVision can not only support users to query the current information, but also support users to query the historical information at any time.
	 * @returns total supply information.
	 */
	async getERC20TotalSupply(object: { contractAddress: string; blockNumber?: number }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('erc20_totalSupply', object)
	}

	/**
	 * BlockVision ERC20 Methods
	 *
	 * Get the metadata (name, symbol, decimals) of the given erc20 contract address.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the contract address for ERC20 token.
	 * @returns the metadata (name, symbol, decimals) of the given erc20 contract address.
	 */
	async getERC20Metadata(object: { contractAddress: string }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('erc20_metadata', object)
	}

	/**
	 * BlockVision ERC20 Methods
	 *
	 * Get a list of account address ranked by balance from high to low.
	 *
	 * Supported on Ethereum and Optimism.
	 *
	 * @param contractAddress the contract address for ERC20 token.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns a list of account address.
	 */
	async getERC20TokenHolders(object: {
		contractAddress: string
		pageSize?: number
		pageIndex?: number
	}): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('erc20_tokenHolders', object)
	}

	/**
	 * BlockVision ERC20 Methods
	 *
	 * Get current/historical price data.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param blockNumber specify the blockNumber for snapshot query (default latest). BlockVision can not only support users to query the current position, but also support users to query the historical information at any time.
	 * @param token0 address of a token that you want to query.
	 * @param token1 address of the other token you want to query.
	 * @returns current/historical price data.
	 */
	async getERC20TokenPrice(object: { blockNumber?: number; token0: string; token1: string }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('erc20_tokenPrice', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get historical events for NFT transfers at any address without scanning the entire chain.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param accountAddress (optional) the account address you want to query.
	 * @param fromBlockNumber (optional) the starting time range you want to fetch events over.
	 * @param toBlockNumber (optional) the ending time range you want to fetch events over.
	 * @param fromAddress (optional) the sending address in the transaction.
	 * @param toAddress (optional) the receiving address in the transaction.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns historical events for NFT transfers.
	 */
	async getNFTTransfers(object: TransfersRequired): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_transfers', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get historical events for NFT approval at any address without scanning the entire chain.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress (optional) the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param accountAddress (optional) the account address you want to query.
	 * @param fromBlockNumber (optional) the starting time range you want to fetch events over.
	 * @param toBlockNumber (optional) the ending time range you want to fetch events over.
	 * @param fromAddress (optional) the sending address in the transaction.
	 * @param toAddress (optional) the receiving address in the transaction.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns historical events for NFT approval.
	 */
	async getNFTApprovals(object: TransfersOptional): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_approvals', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get historical events for NFT approval at any address without scanning the entire chain.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param accountAddress (optional) the account address you want to query.
	 * @param fromBlockNumber (optional) the starting time range you want to fetch events over.
	 * @param toBlockNumber (optional) the ending time range you want to fetch events over.
	 * @param fromAddress (optional) the sending address in the transaction.
	 * @param toAddress (optional) the receiving address in the transaction.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns historical events for NFT approval.
	 */
	async getNFTApprovalForAll(object: TransfersRequired): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_approvalForAll', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get NFT mint records without scanning the entire chain.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress (optional) the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param accountAddress (optional) the account address you want to query.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns NFT mint records.
	 */
	async getNFTMints(object: NFTMints): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_mints', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get historical position information for any account address without scanning the entire chain.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param accountAddress the account address you want to query.
	 * @param blockNumber (optional) the blockNumber for snapshot query (default latest). BlockVision can not only support users to query the current position, but also support users to query the historical position at any time.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns historical position information.
	 */
	async getNFTAccountPositions(object: NFTAccountPositions): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_accountPositions', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get all NFTs hold by the account address in any contract address without scanning the entire chain.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param accountAddress the account address you want to query.
	 * @param blockNumber (optional) the blockNumber for snapshot query (default latest). BlockVision can not only support users to query the current position, but also support users to query the historical position at any time.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns all NFTs hold by the account address in any contract address.
	 */
	async getNFTAccountTokenIDs(object: NFTAccountTokenIDs): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_accountTokenIDs', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Gets the balance for the given account address.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param accountAddress the account address you want to query.
	 * @param tokenId (optional) id of the NFT. optional for ERC721. required for ERC1155.
	 * @param blockNumber (optional) the blockNumber for snapshot query (default latest). BlockVision can not only support users to query the current position, but also support users to query the historical position at any time.
	 * @returns the balance for the given account address.
	 */
	async getNFTBalance(object: NFTBalance): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_balance', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get a list of addresses that own NFTs from a specific collection at a given time, which is sorted by balance value from high to low.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param blockNumber (optional) the blockNumber for snapshot query (default latest). BlockVision can not only support users to query the current position, but also support users to query the historical position at any time.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns list of addresses holding NFT.
	 */
	async getNFTCollectionHolders(object: NFTCollectionHolders): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_collectionHolders', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Gets the NFT's metadata with contract address and token id.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param tokenId id of the NFT.
	 * @returns the NFT's metadata.
	 */
	async getNFTMetadata(object: { contractAddress: string; tokenId: string }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_metadata', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get the URI of the token ID.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param tokenId id of the NFT.
	 * @param blockNumber (optional) the blockNumber for snapshot query (default latest). BlockVision can not only support users to query the current position, but also support users to query the historical position at any time.
	 * @returns the URI of the token ID.
	 */
	async getNFTUri(object: { contractAddress: string; tokenId: string; blockNumber?: number }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_uri', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get historical records of NFT transfers without scanning the entire chain.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param tokenId id of the NFT.
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param accountAddress (optional) the account address you want to query.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns historical records of NFT transfers.
	 */
	async getNFTCirculations(object: NFTCirculations): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_circulations', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Gets the current or previous owner of any NFT.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param tokenId id of the NFT.
	 * @returns the current or previous owner of any NFT.
	 */
	async getNFTOwners(object: { contractAddress: string; tokenId: string }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_owners', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get account stats information for any NFT collection.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param accountAddress (optional) the account address you want to query.
	 * @param blockNumber (optional) the blockNumber for snapshot query (default latest). BlockVision can not only support users to query the current position, but also support users to query the historical position at any time.
	 * @returns account stats information for any NFT collection.
	 */
	async getNFTAccountStats(object: {
		contractAddress: string
		accountAddress?: string
		blockNumber?: number
	}): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_accountStats', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get overall stats information for any NFT collection.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param blockNumber (optional) the blockNumber for snapshot query (default latest). BlockVision can not only support users to query the current position, but also support users to query the historical position at any time.
	 * @returns overall stats information for any NFT collection.
	 */
	async getNFTContractStats(object: { contractAddress: string; blockNumber?: number }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_contractStats', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Gets an NFT listing's floor price for a given marketplace.
	 *
	 * Supported on Ethereum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param tokenId id of the NFT.
	 * @returns an NFT listing's floor price for a given marketplace.
	 */
	async getNFTFloorPrice(object: { contractAddress: string; tokenId: string }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_floorPrice', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get the floor price of a collection.
	 *
	 * Supported on Ethereum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @returns the floor price of a collection.
	 */
	async getNFTCollectionFloorPrice(object: { contractAddress: string }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_collectionFloorPrice', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get market information for an NFT collection.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @returns market information for an NFT collection.
	 */
	async getNFTCollectionMarketInfo(object: { contractAddress: string }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_collectionMarketInfo', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get the owners information of an NFT collection.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @returns the owners information of an NFT collection.
	 */
	async getNFTCollectionOwners(object: { contractAddress: string }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_collectionOwners', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get the NFT information of a collection.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param withMetadata (optional) indicate the query need NFT's metadata or not.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the NFT information of a collection.
	 */
	async getNFTCollectionNfts(object: NFTCollectionNfts): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_collectionNfts', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get NFT listings from a marketplace.
	 *
	 * Supported on Ethereum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param tokenId id of the NFT.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns NFT listings from a marketplace.
	 */
	async getNFTListings(object: NFTListings): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_listings', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get the top accounts with the highest NFT market value.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param contractAddress (optional) the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the top accounts with the highest NFT market value.
	 */
	async getNFTTopAccounts(object: {
		contractAddress?: string
		pageSize?: number
		pageIndex?: number
	}): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_topAccounts', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get the current NFT collections with the highest market capitalization.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the current NFT collections with the highest market capitalization.
	 */
	async getNFTTopCollections(object: { pageSize?: number; pageIndex?: number }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_topCollections', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get the current NFT with the highest market capitalization.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param contractAddress (optional) the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the current NFT with the highest market capitalization.
	 */
	async getNFTTopNfts(object: { contractAddress?: string; pageSize?: number; pageIndex?: number }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_topNfts', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get the auction records of any NFT collection.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the auction records of any NFT collection.
	 */
	async getNFTCollectionAuctionRecords(object: {
		contractAddress: string
		pageSize?: number
		pageIndex?: number
	}): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_collectionAuctionRecords', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Gets the auction records for a given account address.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param accountAddress the account address you want to query.
	 * @param contractAddress (optional) the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the auction records for a given account address.
	 */
	async getNFTAccountAuctionRecords(object: {
		accountAddress: string
		contractAddress?: string
		pageSize?: number
		pageIndex?: number
	}): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_accountAuctionRecords', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get the auction records of any NFT.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param tokenId id of the NFT.
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the auction records.
	 */
	async getNFTAuctionRecords(object: {
		tokenId: string
		contractAddress: string
		pageSize?: number
		pageIndex?: number
	}): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_auctionRecords', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get NFT daily volume, monthly volume and total market volume without scanning the chain.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param unit (optional) volume unit. optional values include (daily, monthly or total).
	 * @returns NFT volume.
	 */
	async getNFTVolume(object: { unit?: 'daily' | 'monthly' | 'total' }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_volume', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Returns true if Opensea flagged the NFT as suspicious, otherwise false.
	 *
	 * Supported on Ethereum.
	 *
	 * @param contractAddress the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param tokenId id of the NFT.
	 * @returns true if Opensea flagged the NFT as suspicious, otherwise false.
	 */
	async getNFTIsSuspicious(object: { contractAddress: string; tokenId: string }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_isSuspicious', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get the top buyers and sellers of the whole NFT market without scanning the entire chain.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param timeDimension time dimension, such as 1h 6h 12h 1d 3d 7d all.
	 * @param type the specifies type of trade to query for. such as buy or sell.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the top buyers and sellers of the whole NFT market.
	 */
	async getNFTTopBuyerAndSeller(object: {
		type: 'buy' | 'sell'
		timeDimension?: '1h' | '6h' | '12h' | '1d' | '3d' | '7d' | 'all'
		pageSize?: number
		pageIndex?: number
	}): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_topBuyerAndSeller', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get all renting NFTs for an account address without scanning the entire chain.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param accountAddress the account address you want to query.
	 * @param contractAddress (optional) the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @returns all renting NFTs for an account address.
	 */
	async getNFTAccountRentTokenIDs(object: { accountAddress: string; contractAddress?: string }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_accountRentTokenIDs', object)
	}

	/**
	 * BlockVision NFT Methods
	 *
	 * Get all owned or renting NFTs for an account address without scanning the entire chain.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param accountAddress the account address you want to query.
	 * @param contractAddress (optional) the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns all owned or renting NFTs for an account address.
	 */
	async getNFTAccountOwnedOrRentTokenIDs(object: {
		accountAddress: string
		contractAddress?: string
		pageSize?: number
		pageIndex?: number
	}): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('nft_accountOwnedOrRentTokenIDs', object)
	}

	/**
	 * BlockVision Account Methods
	 *
	 * Get NFT assets and NFT metadata owned by any account address.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param accountAddress the account address you want to query.
	 * @param contractAddress (optional) the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns NFT assets and NFT metadata.
	 */
	async getAccountNFTPortfolio(object: {
		accountAddress: string
		contractAddress?: string
		pageSize?: number
		pageIndex?: number
	}): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('account_nftPortfolio', object)
	}

	/**
	 * BlockVision Account Methods
	 *
	 * Get FT assets owned by any account address.
	 *
	 * Supported on Ethereum and BNB Chain.
	 *
	 * @param accountAddress the account address you want to query.
	 * @param contractAddress (optional) the contract address of the collection. BlockVision currently support both ERC721 and ERC1155.
	 * @param showAll (optional) whether to return tokens with low liquidity. The enumeration value is 0, or 1, if set to 1, will return tokens with low liquidity. Defaults to 0.
	 * @returns FT assets.
	 */
	async getAccountFTPortfolio(object: {
		accountAddress: string
		contractAddress?: string
		showAll?: 0 | 1
	}): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('account_ftPortfolio', object)
	}

	/**
	 * BlockVision DeFi Methods
	 *
	 * Get the account's positions and assets in the supported DeFi protocol.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, Polygon, and Arbitrum.
	 *
	 * @param accountAddress the account address you want to query.
	 * @param protocol (optional) If you don't specify the protocol, the API can return position data for all supported DeFi protocols.
	 * @returns the account's positions and assets in the supported DeFi protocol.
	 */
	async getAccountDeFiPortfolio(object: {
		accountAddress: string
		protocol?:
			| 'aavev3'
			| 'gmx'
			| 'uniswapv3'
			| 'coinwind'
			| 'pancake'
			| 'venus'
			| '0x'
			| '1inch'
			| 'aavev2'
			| 'arrakis'
			| 'aura'
			| 'balancerv1'
			| 'balancerv2'
			| 'bancorv2'
			| 'bancorv3'
			| 'compound'
			| 'convex'
			| 'curve'
			| 'dydx'
			| 'ETH2'
			| 'frax'
			| 'graph'
			| 'hex'
			| 'instadapp'
			| 'liquity'
			| 'lido'
			| 'makerdao'
			| 'polygonStaking'
			| 'rocketPool'
			| 'shibaswap'
			| 'stakefish'
			| 'sushiswap'
			| 'stargate'
			| 'synthetix'
			| 'tornado'
			| 'unicrypt'
			| 'uniswapv2'
			| 'uniswapv3'
			| 'yearn'
			| 'animalfarm'
			| 'maple'
			| 'olympus'
			| 'wombat'
	}): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('account_defiPortfolio', object)
	}

	/**
	 * BlockVision Account Methods
	 *
	 * Get the account's coin and NFT assets on the Sui chain.
	 *
	 * Supported on Sui.
	 *
	 * @param account the account address you want to query.
	 * @returns the account's coin and NFT assets on the Sui chain.
	 */
	async getSuiAccountPortfolio(object: { account: string }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('sui_accountPortfolio', object)
	}

	/**
	 * BlockVision Account Methods
	 *
	 * Get the transactions sent by a specific address without scanning the entire chain.
	 *
	 * Supported on Ethereum, BNB Chain, Optimism, and Arbitrum.
	 *
	 * @param fromAddress (optional) the sending address in the transaction.
	 * @param toAddress (optional) the receiving address in the transaction.
	 * @param fromBlockNumber (optional) the starting time range you want to fetch events over.
	 * @param toBlockNumber (optional) the ending time range you want to fetch events over.
	 * @param pageSize (optional) max number of results to return per call.
	 * @param pageIndex (optional) page index.
	 * @returns the transactions information.
	 */
	async getTransactionByAccount(object: getTransactionByAccount): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('eth_getTransactionByAccount', object)
	}

	/**
	 * BlockVision Mempool Methods
	 *
	 * Get the hash of the bundle.
	 *
	 * Supported on Ethereum.
	 *
	 * @param txsHex array or string that contains raw transactions hash.
	 * @param blockNumber (optional) the blockNumber that the bundle should be included.
	 * @returns the hash of the bundle.
	 */
	async getSendBundle(object: { txsHex: string[]; blockNumber?: number }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('eth_sendBundle', object)
	}

	/**
	 * BlockVision Mempool Methods
	 *
	 * Get the simulated bundle for a given block number.
	 *
	 * Supported on Ethereum.
	 *
	 * @param txsHex array or string that contains raw transactions hash.
	 * @param blockNumber (optional) the blockNumber that the bundle should be included.
	 * @returns bundle simulated for specific block number.
	 */
	async getCallBundle(object: { txsHex: string[]; blockNumber?: number }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('eth_callBundle', object)
	}

	/**
	 * BlockVision Mempool Methods
	 *
	 * Get bundle stats from flashbots relay via this api.
	 *
	 * Supported on Ethereum.
	 *
	 * @param bundleHash the hash value of the bundle.
	 * @param blockNumber (optional) the blockNumber that the bundle should be included.
	 * @returns bundle stats.
	 */
	async getBundleStat(object: { bundleHash: string; blockNumber?: number }): Promise<string> {
		await this.getNetwork()

		return await this.sendRest('eth_getBundleStat', object)
	}

	/**
	 * BlockVision Mempool Methods
	 *
	 * Returns true if unsubscribed successfully, otherwise false.
	 *
	 * Supported on Ethereum.
	 *
	 * @param subscriptionId subscription id.
	 * @returns true if unsubscribed successfully, otherwise false.
	 */
	async getUnsubscribe(subscriptionId: string): Promise<string> {
		await this.getNetwork()

		return await this.send('eth_unsubscribe', [subscriptionId])
	}
}

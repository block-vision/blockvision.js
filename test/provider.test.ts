import { AlchemyProvider } from '@ethersproject/providers'
import { BlockVisionProvider, BvNetwork, BlockVisionWebSocketProvider } from '../src'
import { parseEther } from '@ethersproject/units'
import { loadEnv } from './utils'

loadEnv()

const BLOCKVISION_API_KEY = process.env.BLOCKVISION_API_KEY || null
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || null

const WHETHER_TEST_MEMPOOL_METHODS = false
const WHETHER_TEST_ACCOUNT_METHODS = false
const WHETHER_TEST_NFT_METHODS = false
const WHETHER_TEST_ERC20_METHODS = false
const WHETHER_TEST_ACCOUNTS_METHODS = true
const WHETHER_TEST_TRANSACTIONS_METHODS = false
const WHETHER_TEST_LOGS_METHODS = false
const WHETHER_TEST_TRACES_METHODS = false
const WHETHER_TEST_ARBITRUM_OPTIMISM_METHODS = false
const WHETHER_TEST_BLOCKS_METHODS = false
const WHETHER_TEST_NETWORDS_STATUS_METHODS = false

const bv = new BlockVisionProvider(BvNetwork['ETH_MAINNET'], BLOCKVISION_API_KEY)
const bvWs = new BlockVisionWebSocketProvider(BvNetwork['ETH_MAINNET'], BLOCKVISION_API_KEY)
const alchemy = new AlchemyProvider('mainnet', ALCHEMY_API_KEY)

jest.setTimeout(8 * 1000)

/* Mempool Methods */
WHETHER_TEST_MEMPOOL_METHODS &&
	describe('Mempool Methods', () => {
		test('getSendBundle', async () => {
			const actual = await bv.getSendBundle({
				txsHex: [
					'0x02f874058085012a05f2008504a817c80082520894ba849911c809f6c922bc4767328a01db30c331e588058d15e17628000080c001a04cf959d89535bc942c3ac3ced842989d8f8452757bba5bba2815ac4afa67c073a005dd3ee1ffd916ec5f3003a94f2c58961f5e1ef04dcfc074be1a18069fe923df'
				]
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getCallBundle', async () => {
			const actual = await bv.getCallBundle({
				txsHex: [
					'0x02f874058085012a05f2008504a817c80082520894ba849911c809f6c922bc4767328a01db30c331e588058d15e17628000080c001a04cf959d89535bc942c3ac3ced842989d8f8452757bba5bba2815ac4afa67c073a005dd3ee1ffd916ec5f3003a94f2c58961f5e1ef04dcfc074be1a18069fe923df'
				]
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getBundleStat', async () => {
			const actual = await bv.getBundleStat({
				bundleHash: '0xf1542f44cc02fc2a2aa592bc7e7ea57d1d0d72abb8287ceb5d5b011f4e780158'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getUnsubscribe', async () => {
			const actual = await bv.getUnsubscribe('0xe071a7e76d4b60755770076b4a79a40d')
			console.log(actual)
			expect(actual).toBeDefined()
		})
	})

/* Account Methods */
WHETHER_TEST_ACCOUNT_METHODS &&
	describe('Account Methods', () => {
		test('getAccountNFTPortfolio', async () => {
			const actual = await bv.getAccountNFTPortfolio({
				accountAddress: '0x8Bc47bE1e3ABBaBa182069C89d08a61FA6C2B292'
			})

			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getAccountFTPortfolio', async () => {
			const actual = await bv.getAccountFTPortfolio({
				accountAddress: '0x98ec059dc3adfbdd63429454aeb0c990fba4a128'
			})

			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getAccountDeFiPortfolio', async () => {
			const actual = await bv.getAccountDeFiPortfolio({
				accountAddress: '0xe1bdcd3b70e077d2d66adcbe78be3941f0bf380b'
			})

			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getSuiAccountPortfolio', async () => {
			const actual = await bv.getSuiAccountPortfolio({
				account: '0x8724333d4d540340e57d71e554dff10e4c72c998'
			})

			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getTransactionByAccount', async () => {
			const actual = await bv.getTransactionByAccount({ toAddress: '0xb0bf4a71f730782368ef660fe6d298f432f95450' })

			console.log(actual)
			expect(actual).toBeDefined()
		})
	})

/* NFT Methods */
WHETHER_TEST_NFT_METHODS &&
	describe('NFT Methods', () => {
		test('getNFTTransfers', async () => {
			const actual = await bv.getNFTTransfers({
				fromBlockNumber: 0,
				toBlockNumber: 0,
				fromAddress: '0xd020BF04BbC0eD52B21f5d367770047725c80b54',
				contractAddress: '0xF3114DD5c5b50a573E66596563D15A630ED359b4',
				pageSize: 3,
				pageIndex: 1
			})

			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTApprovals', async () => {
			const actual = await bv.getNFTApprovals({})

			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTApprovalForAll', async () => {
			const actual = await bv.getNFTApprovalForAll({
				fromBlockNumber: 0,
				toBlockNumber: 0,
				fromAddress: '',
				toAddress: '',
				contractAddress: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
				pageSize: 5,
				pageIndex: 1
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTMints', async () => {
			const actual = await bv.getNFTMints({
				contractAddress: '0x86e4dc25259Ee2191cD8ae40e1865b9f0319646c',
				pageSize: 10,
				pageIndex: 1
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTAccountPositions', async () => {
			const actual = await bv.getNFTAccountPositions({
				accountAddress: '0xA0032F20c5806D2e6cD0De2170839EC1EFA65c7a',
				blockNumber: 0,
				pageSize: 20,
				pageIndex: 1
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTAccountTokenIDs', async () => {
			const actual = await bv.getNFTAccountTokenIDs({
				accountAddress: '0x5F35265a7681673dd078616C5eFc9bcFb3a4C9dE',
				contractAddress: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
				blockNumber: 0,
				pageSize: 100,
				pageIndex: 1
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTBalance', async () => {
			const actual = await bv.getNFTBalance({
				contractAddress: '0xad9Fd7cB4fC7A0fBCE08d64068f60CbDE22Ed34C',
				accountAddress: '0xC4B0D0A7717905d342926958453e0654806850bB',
				blockNumber: 0
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTCollectionHolders', async () => {
			const actual = await bv.getNFTCollectionHolders({
				contractAddress: '0xad9Fd7cB4fC7A0fBCE08d64068f60CbDE22Ed34C',
				blockNumber: 0,
				pageSize: 10,
				pageIndex: 1
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTMetadata', async () => {
			const actual = await bv.getNFTMetadata({
				tokenId: '1',
				contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTUri', async () => {
			const actual = await bv.getNFTUri({
				contractAddress: '0x495f947276749Ce646f68AC8c248420045cb7b5e',
				tokenId: '49130440647659772150626580756595337563119039889199175888700692953658833240065',
				blockNumber: 0
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTCirculations', async () => {
			const actual = await bv.getNFTCirculations({
				tokenId: '1',
				contractAddress: '0xA7206d878c5c3871826DfdB42191c49B1D11F466',
				pageSize: 5,
				pageIndex: 0
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTOwners', async () => {
			const actual = await bv.getNFTOwners({
				contractAddress: '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
				tokenId: '5822'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTAccountStats', async () => {
			const actual = await bv.getNFTAccountStats({
				contractAddress: '0xad9Fd7cB4fC7A0fBCE08d64068f60CbDE22Ed34C',
				accountAddress: '0xC4B0D0A7717905d342926958453e0654806850bB',
				blockNumber: 0
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTContractStats', async () => {
			const actual = await bv.getNFTContractStats({
				blockNumber: 0,
				contractAddress: '0xA7206d878c5c3871826DfdB42191c49B1D11F466'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTFloorPrice', async () => {
			const actual = await bv.getNFTFloorPrice({
				contractAddress: '0x1792a96E5668ad7C167ab804a100ce42395Ce54D',
				tokenId: '2208'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTCollectionFloorPrice', async () => {
			const actual = await bv.getNFTCollectionFloorPrice({
				contractAddress: '0xb47e3cd837ddf8e4c57f05d70ab865de6e193BBB'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTCollectionMarketInfo', async () => {
			const actual = await bv.getNFTCollectionMarketInfo({
				contractAddress: '0x6B31a2EF5986d283332E4A3a608aDB3C09fFdD13'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTCollectionOwners', async () => {
			const actual = await bv.getNFTCollectionOwners({
				contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTCollectionNfts', async () => {
			const actual = await bv.getNFTCollectionNfts({
				contractAddress: '0x1e080Dbe40E4F8eD00d810d0688533a1e597c019'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTListings', async () => {
			const actual = await bv.getNFTListings({
				contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
				tokenId: '8830',
				pageIndex: 1,
				pageSize: 1
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTTopAccounts', async () => {
			const actual = await bv.getNFTTopAccounts({})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTTopCollections', async () => {
			const actual = await bv.getNFTTopCollections({})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTTopNfts', async () => {
			const actual = await bv.getNFTTopNfts({})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTCollectionAuctionRecords', async () => {
			const actual = await bv.getNFTCollectionAuctionRecords({
				contractAddress: '0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTAccountAuctionRecords', async () => {
			const actual = await bv.getNFTAccountAuctionRecords({
				accountAddress: '0xEE57a6C7ed5CEB919E6dC6998AF553c21489a353'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTAuctionRecords', async () => {
			const actual = await bv.getNFTAuctionRecords({
				contractAddress: '0x4a8C9D751EEAbc5521A68FB080DD7E72E46462aF',
				tokenId: '7305'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTVolume', async () => {
			const actual = await bv.getNFTVolume({})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTIsSuspicious', async () => {
			const actual = await bv.getNFTIsSuspicious({
				contractAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
				tokenId: '2476'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTTopBuyerAndSeller', async () => {
			const actual = await bv.getNFTTopBuyerAndSeller({
				timeDimension: '3d',
				type: 'buy'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTAccountRentTokenIDs', async () => {
			const actual = await bv.getNFTAccountRentTokenIDs({
				contractAddress: '0x2b41eF782A3064993f8BAA368a8D14d82443fdA9',
				accountAddress: '0xfc06cc834874c6d424b6ebf4a7a48042daa2d267'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})

		test('getNFTAccountOwnedOrRentTokenIDs', async () => {
			const actual = await bv.getNFTAccountOwnedOrRentTokenIDs({
				accountAddress: '0xfc06cc834874c6d424b6ebf4a7a48042daa2d267'
			})
			console.log(actual)
			expect(actual).toBeDefined()
		})
	})

/* ERC20 Methods */
WHETHER_TEST_ERC20_METHODS &&
	describe('ERC20 Methods', () => {
		test('getERC20Transfers', async () => {
			const result = await bv.getERC20Transfers({})
			console.log(result)
			expect(result).toBeDefined()
		})

		test('getEthTransfers', async () => {
			const result = await bv.getEthTransfers({})
			console.log(result)
			expect(result).toBeDefined()
		})

		test('getERC20Approvals', async () => {
			const result = await bv.getERC20Approvals({})
			console.log(result)
			expect(result).toBeDefined()
		})

		test('getERC20MintsBurns', async () => {
			const result = await bv.getERC20MintsBurns({
				contractAddress: '0xCC8Fa225D80b9c7D42F96e9570156c65D6cAAa25'
			})
			console.log(result)
			expect(result).toBeDefined()
		})

		test('getERC20Balance', async () => {
			const result = await bv.getERC20Balance({
				contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
				accountAddress: '0x02D436DC483f445f63Aac45b37db0eE661949842'
			})
			console.log(result)
			expect(result).toBeDefined()
		})

		test('getERC20BalanceChangedList', async () => {
			const result = await bv.getERC20BalanceChangedList({
				contractAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
				accountAddress: '0x02D436DC483f445f63Aac45b37db0eE661949842'
			})
			console.log(result)
			expect(result).toBeDefined()
		})

		test('getERC20TotalSupply', async () => {
			const result = await bv.getERC20TotalSupply({
				contractAddress: '0x8C6bf16C273636523C29Db7DB04396143770F6A0'
			})
			console.log(result)
			expect(result).toBeDefined()
		})

		test('getERC20Metadata', async () => {
			const result = await bv.getERC20Metadata({
				contractAddress: '0x8C6bf16C273636523C29Db7DB04396143770F6A0'
			})
			console.log(result)
			expect(result).toBeDefined()
		})

		test('getERC20TokenHolders', async () => {
			const result = await bv.getERC20TokenHolders({
				contractAddress: '0x8C6bf16C273636523C29Db7DB04396143770F6A0'
			})
			console.log(result)
			expect(result).toBeDefined()
		})

		test('getERC20TokenPrice', async () => {
			const result = await bv.getERC20TokenPrice({
				blockNumber: 0,
				token0: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
				token1: '0xdAC17F958D2ee523a2206206994597C13D831ec7'
			})
			console.log(result)
			expect(result).toBeDefined()
		})
	})

/* Accounts Methods */
WHETHER_TEST_ACCOUNTS_METHODS &&
	describe('Accounts Methods', () => {
		test('getBalance', async () => {
			const [expected, actual] = await Promise.all([
				alchemy.getBalance('0x407d73d8a49eeb85d32cf465507dd71d507100c1'),
				bv.getBalance('0x407d73d8a49eeb85d32cf465507dd71d507100c1')
			])
			console.log(expected)
			expect(actual).toEqual(expected)
		})
		test('getBalance', async () => {
			const [expected, actual] = await Promise.all([alchemy.getBalance('ricmoo.eth'), bv.getBalance('ricmoo.eth')])
			expect(actual).toEqual(expected)
		})
		test('getCode', async () => {
			const expected = await alchemy.getCode('0xdAC17F958D2ee523a2206206994597C13D831ec7', 'latest')
			const actual = await bv.getCode('0xdAC17F958D2ee523a2206206994597C13D831ec7', 'latest')
			expect(actual).toEqual(expected)
		})
		test('getCode', async () => {
			const expected = await alchemy.getCode('registrar.firefly.eth')
			const actual = await bv.getCode('registrar.firefly.eth')
			expect(actual).toEqual(expected)
		})
		test('getStorageAt', async () => {
			const expected = await alchemy.getStorageAt('0x295a70b2de5e3953354a6a8344e616ed314d7251', '0x0', 'latest')
			const actual = await bv.getStorageAt('0x295a70b2de5e3953354a6a8344e616ed314d7251', '0x0', 'latest')
			expect(actual).toEqual(expected)
		})
		test('getStorageAt', async () => {
			const expected = await alchemy.getStorageAt('registrar.firefly.eth', 0)
			const actual = await bv.getStorageAt('registrar.firefly.eth', 0)
			expect(actual).toEqual(expected)
		})
		test('getTransactionCount', async () => {
			const expected = await alchemy.getTransactionCount('0x407d73d8a49eeb85d32cf465507dd71d507100c1', 'latest')
			const actual = await bv.getTransactionCount('0x407d73d8a49eeb85d32cf465507dd71d507100c1', 'latest')
			expect(actual).toEqual(expected)
		})
		test('getTransactionCount', async () => {
			const expected = await alchemy.getTransactionCount('ricmoo.eth')
			const actual = await bv.getTransactionCount('ricmoo.eth')
			expect(actual).toEqual(expected)
		})
	})

/* Transcations Methods */
WHETHER_TEST_TRANSACTIONS_METHODS &&
	describe('Transcations Methods', () => {
		test('call', async () => {
			const [expected, actual] = await Promise.all([
				alchemy.call({
					// ENS public resolver address
					to: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
					// `function addr(namehash("ricmoo.eth")) view returns (address)`
					data: '0x3b3b57debf074faa138b72c65adbdcfb329847e4f2c04bde7f7dd7fcad5a52d2f395a558'
				}),
				bv.call({
					to: '0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41',
					data: '0x3b3b57debf074faa138b72c65adbdcfb329847e4f2c04bde7f7dd7fcad5a52d2f395a558'
				})
			])
			expect(actual).toEqual(expected)
		})
		test('estimateGas', async () => {
			const expected = await alchemy.estimateGas({
				// Wrapped ETH address
				to: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
				// `function deposit() payable`
				data: '0xd0e30db0',
				// 1 ether
				value: parseEther('1.0')
			})
			const actual = await bv.estimateGas({
				to: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
				data: '0xd0e30db0',
				value: parseEther('1.0')
			})
			expect(actual.toNumber()).toEqual(expected.toNumber())
		})
		test('getTransaction', async () => {
			const [expected, actual] = await Promise.all([
				alchemy.getTransaction('0x5b73e239c55d790e3c9c3bbb84092652db01bb8dbf49ccc9e4a318470419d9a0'),
				bv.getTransaction('0x5b73e239c55d790e3c9c3bbb84092652db01bb8dbf49ccc9e4a318470419d9a0')
			])
			expect(actual.blockHash).toEqual(expected.blockHash)
		})
		test('getTransactionReceipt', async () => {
			const [expected, actual] = await Promise.all([
				alchemy.getTransactionReceipt('0x5b73e239c55d790e3c9c3bbb84092652db01bb8dbf49ccc9e4a318470419d9a0'),
				bv.getTransactionReceipt('0x5b73e239c55d790e3c9c3bbb84092652db01bb8dbf49ccc9e4a318470419d9a0')
			])
			expect(actual).toEqual(expected)
		})
		test('getTransactionReceiptsByBlockNumber', async () => {
			const actual = bv.getTransactionReceiptsByBlockNumber('0x1675e2e')
			expect(actual).toBeDefined()
		})
		test('sendTransaction', async () => {
			const [expected, actual] = await Promise.all([
				alchemy
					.sendTransaction(
						'0xf86b01808502540be40094c02aaa39b223fe8d0a0e5c4f27ead9083c756cc28502540be40084d0e30db026a0842cb79da231900fc67956ef9e3ff67b1e92d0341028df7c416848cf29b8b16aa03472844fb28ad3ebd4de8bd625b1a152e7fc75495c6d0feb8c205471f4774c76'
					)
					.catch(e => e.body),
				bv
					.sendTransaction(
						'0xf86b01808502540be40094c02aaa39b223fe8d0a0e5c4f27ead9083c756cc28502540be40084d0e30db026a0842cb79da231900fc67956ef9e3ff67b1e92d0341028df7c416848cf29b8b16aa03472844fb28ad3ebd4de8bd625b1a152e7fc75495c6d0feb8c205471f4774c76'
					)
					.catch(e => e.error.body)
			])
			expect(actual).toBeDefined()
			// console.log('[sendTransaction]', '\n', expected, '\n', actual)
		})
		test('getBlockTransactionCount', async () => {
			const result = await bv.getBlockTransactionCount('latest')
			expect(result).toMatch(/^0x/)
		})
		test('getBlockTransactionCount', async () => {
			const result = await bv.getBlockTransactionCount(
				'0xf2667c842f31e27bf0be3ea23f86d4edb490dd6a2bcc4eae879cbe54f0d8d427'
			)
			expect(result).toMatch(/^0x/)
		})
		test('getBlockTransactionCount', async () => {
			const result = await bv.getBlockTransactionCount('0xe8333')
			expect(result).toMatch(/^0x/)
		})
		test('getBlockTransactionByIndex', async () => {
			const result = await bv.getBlockTransactionByIndex('pending', '0x1')
			expect(result).toBeDefined()
		})
		test('getBlockTransactionByIndex', async () => {
			const result = await bv.getBlockTransactionByIndex(
				'0x785b221ec95c66579d5ae14eebe16284a769e948359615d580f02e646e93f1d5',
				'0x1'
			)
			expect(result).toBeDefined()
		})
		test('getBlockReceipts', async () => {
			const result = await bv.getBlockReceipts('latest')
			expect(result).toBeDefined()
		})
	})

/* Logs Methods */
WHETHER_TEST_LOGS_METHODS &&
	describe('Logs Methods', () => {
		test('getLogs', async () => {
			const [expected, actual] = await Promise.all([alchemy.getLogs({}), bv.getLogs({})])
			console.log('[getLogs]', expected)
			expect(actual).toEqual(expected)
		})
	})

/* Traces Methods */
WHETHER_TEST_TRACES_METHODS &&
	describe('Traces Methods', () => {
		test('traceCall', async () => {
			const result = await bv.traceCall(
				{
					from: '0x407d73d8a49eeb85d32cf465507dd71d507100c1',
					to: '0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b',
					value: '0x186a0'
				},
				['trace'],
				'latest'
			)
			expect(result).toBeDefined()
		})
		test('traceCallMany', async () => {
			const result = await bv.traceCallMany(
				[
					[
						{
							from: '0x407d73d8a49eeb85d32cf465507dd71d507100c1',
							to: '0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b',
							value: '0x186a0'
						},
						['trace']
					],
					[
						{
							from: '0x407d73d8a49eeb85d32cf465507dd71d507100c1',
							to: '0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b',
							value: '0x186a0'
						},
						['trace']
					]
				],
				'latest'
			)
			expect(result).toBeDefined()
		})
		test('traceTransaction', async () => {
			const result = await bv.traceTransaction('0xf8fd8d2f360caf4a760337a44991596db2a3fec788de9c8e85a8ccf36807d6f2')
			expect(result).toBeDefined()
		})
		test('traceGet', async () => {
			const result = await bv.traceGet('0x17104ac9d3312d8c136b7f44d4b8b47852618065ebfa534bd2d3b5ef218ca1f3', ['0x0'])
			expect(result).toBeDefined()
		})
		test('traceBlock', async () => {
			const result = await bv.traceBlock('0x3ef221')
			console.log(result)
			expect(result).toBeDefined()
		})
	})

/* Arbitrum/Optimism Methods */
WHETHER_TEST_ARBITRUM_OPTIMISM_METHODS &&
	describe('Arbitrum/Optimism Methods', () => {
		test('getNewFilter', async () => {
			const result = await bv.getNewFilter([
				{
					fromBlock: '0x1',
					toBlock: '0x2',
					address: '0x8888f1f195afa192cfee860698584c030f4c9db1',
					topics: [
						'0x000000000000000000000000a94f5374fce5edbc8e2a8697c15331677e6ebf0b',
						null,
						[
							'0x000000000000000000000000a94f5374fce5edbc8e2a8697c15331677e6ebf0b',
							'0x0000000000000000000000000aff3454fce5edbc8cca8697c15331677e6ebccc'
						]
					]
				}
			])
			console.log(result)
			expect(result).toBeDefined()
		})
		test('getUninstallFilter', async () => {
			const result = await bv.getUninstallFilter('0xfe704947a3cd3ca12541458a4321c869')
			expect(typeof result).toEqual('boolean')
		})
		test('getNewBlockFilter', async () => {
			const result = await bv.getNewBlockFilter()
			expect(result).toMatch(/^0x/)
		})
		test('getNewPendingTransactionFilter', async () => {
			const result = await bv.getNewPendingTransactionFilter()
			expect(result).toMatch(/^0x/)
		})
		test('getFilterLogs', async () => {
			const result = await bv.getFilterLogs('0xb108cf34bac6d5d54a00d3ecaf0ecba1')
			expect(result).toBeDefined()
		})
		test('getFilterLogs', async () => {
			const result = await bv.getFilterLogs('0x1b3c6642303476de21fb0b7eb52b6185')
			expect(result).toBeDefined()
		})
		test('getFilterChanges', async () => {
			const result = await bv.getFilterChanges('0xb108cf34bac6d5d54a00d3ecaf0ecba1')
			expect(result).toBeDefined()
		})
		test('getFilterChanges', async () => {
			const result = await bv.getFilterChanges('0x3227d2afa3777a7324ec863ea41912c1')
			expect(result).toBeDefined()
		})
	})

/* Blocks Methods */
WHETHER_TEST_BLOCKS_METHODS &&
	describe('Blocks Methods', () => {
		test('getBlock', async () => {
			const expected = await alchemy.getBlock(100004)
			const actual = await bv.getBlock(100004)
			expect(actual).toEqual(expected)
		})
		test('getBlock', async () => {
			const expected = await alchemy.getBlock('0xd5aa53')
			const actual = await bv.getBlock('0xd5aa53')
			expect(actual).toEqual(expected)
		})
		test('getBlock', async () => {
			const expected = await alchemy.getBlock('0xdc0818cf78f21a8e70579cb46a43643f78291264dda342ae31049421c82d21ae')
			const actual = await bv.getBlock('0xdc0818cf78f21a8e70579cb46a43643f78291264dda342ae31049421c82d21ae')
			console.log(actual)
			expect(actual).toEqual(expected)
		})
		test('getBlockWithTransactions', async () => {
			const expected = await alchemy.getBlockWithTransactions(100004)
			const actual = await bv.getBlockWithTransactions(100004)
			expect(actual.number).toEqual(expected.number)
		})
		test('getUncleCount', async () => {
			const result = await bv.getUncleCount('earliest')
			expect(result).toEqual('0x0')
		})
		test('getUncleCount', async () => {
			const result = await bv.getUncleCount('0xa62623c868ed8493cc2bfde4ee04392a54b09c5a5cb722cbe70c8a2830753f2f')
			expect(result).toMatch(/^0x/)
		})
		test('getUncleByIndex', async () => {
			const result = await bv.getUncleByIndex(10467268, '0x0')
			expect(result).toBeDefined()
		})
		test('getUncleByIndex', async () => {
			const result = await bv.getUncleByIndex(
				'0xa62623c868ed8493cc2bfde4ee04392a54b09c5a5cb722cbe70c8a2830753f2f',
				'0x0'
			)
			expect(result).toBeDefined()
		})
		test('getUncleByIndex', async () => {
			const result = await bv.getUncleByIndex('0x29c', '0x0')
			expect(result).toBeDefined()
		})
	})

/* Networks Status Methods */
WHETHER_TEST_NETWORDS_STATUS_METHODS &&
	describe('Networks Status Methods', () => {
		test('getBlockNumber', async () => {
			const [expected, actual] = await Promise.all([alchemy.getBlockNumber(), bv.getBlockNumber()])
			expect(Math.abs(expected - actual)).toBeLessThan(2)
		})
		test('getNetwork', async () => {
			const expected = await alchemy.getNetwork()
			const actual = await bv.getNetwork()
			expect(actual).toEqual(expected)
		})
		test('getGasPrice', async () => {
			const [expected, actual] = await Promise.all([alchemy.getGasPrice(), bv.getGasPrice()])
			expect(Math.abs(expected.toNumber() - actual.toNumber()) / expected.toNumber()).toBeLessThan(0.2)
		})
		test('getMaxPriorityFeePerGas', async () => {
			const result = await bv.getMaxPriorityFeePerGas()
			expect(result).toMatch(/^0x/)
		})
		test('getSyncing', async () => {
			const result = await bv.getSyncing()
			expect(typeof result).toEqual('boolean')
		})
		test('getChainId', async () => {
			const result = await bv.getChainId()
			expect(result).toMatch(/^0x/)
		})
		test('getFeeHistory', async () => {
			const result = await bv.getFeeHistory(4, 'latest', [])
			expect(result).toBeDefined()
		})
		test('getProtocolVersion', async () => {
			const result = await bv.getProtocolVersion()
			expect(result).toMatch(/^0x/)
		})
		test('getSHA3', async () => {
			const result = await bv.getSHA3('0x68656c6c6f20776f726c64')
			expect(result).toEqual('0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad')
		})
		test('getSHA3', async () => {
			const result = await bv.getSHA3('DATA')
			expect(typeof result).toEqual('string')
			expect(result).toMatch(/^0x/)
		})
		test('getClientVersion', async () => {
			const result = await bv.getClientVersion()
			console.log(result)
			expect(typeof result).toEqual('string')
		})
		test('getListening', async () => {
			const result = await bv.getListening()
			expect(typeof result).toEqual('boolean')
		})
	})

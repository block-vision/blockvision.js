import { Network } from '@ethersproject/networks'

export function getDefaultApiKeyPrefix(network: Network) {
	switch (network.name) {
		case 'homestead':
			return 'em_'
		case 'goerli':
			return 'eg_'
		case 'bnb':
			return 'bm_'
		case 'bnbt':
			return 'bt_'
		case 'optimism':
			return 'om_'
		case 'optimism-goerli':
			return 'og_'
		case 'arbitrum':
			return 'am_'
		case 'arbitrum-goerli':
			return 'ag_'
		case 'matic':
			return 'pm_'
		case 'maticmum':
			return 'pt_'
		case 'sui':
			return 'sm_'
		case 'sui-devnet':
			return 'sd_'
		case 'sui-testnet':
			return 'st_'

		default:
			throw new Error('Unsupported network')
	}
}

// Copy from ethers.js
// Show the throttle message only once
let throttleMessage = false
export function showThrottleMessage() {
	if (throttleMessage) {
		return
	}
	throttleMessage = true

	console.log('========= NOTICE =========')
	console.log('Request-Rate Exceeded  (this message will not be repeated)')
	console.log('')
	console.log('The default API keys for each service are provided as a highly-throttled,')
	console.log('community resource for low-traffic projects and early prototyping.')
	console.log('')
	console.log('While your application will continue to function, we highly recommended')
	console.log('signing up for your own API keys to improve performance, increase your')
	console.log('request rate/limit and enable other perks, such as metrics and advanced APIs.')
	console.log('')
	console.log('For more details: https://docs.blockvision.org/blockvision/introduction/how-to-guides/')
	console.log('==========================')
}

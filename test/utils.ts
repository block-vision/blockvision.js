import * as dotenv from 'dotenv'
import path from 'node:path'

export function loadEnv() {
	dotenv.config({ path: path.resolve(process.cwd(), 'api-keys.env') })
}

import { Client } from 'node-zendesk';

declare global {
	namespace Express {
		export interface Request {
			zdClient?: Client;
		}
	}
}

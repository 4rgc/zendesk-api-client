import { Request, Response, NextFunction } from 'express';
import zendesk, { Client } from 'node-zendesk';

let client: Client | undefined;

export const zendeskClient = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!client)
		client = zendesk.createClient({
			remoteUri: process.env.API_BASE_URL || '',
			username: process.env.USERNAME || '',
			token: process.env.TOKEN || '',
		});

	req.zdClient = client;
	return next();
};

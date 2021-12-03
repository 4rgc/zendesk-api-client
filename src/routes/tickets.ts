import { Router } from 'express';
import { error, log } from '../util/logging';
import zendesk from 'node-zendesk';
import hash from 'object-hash';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const clients = require('../util/clientStore');

const ticketsRouter = Router();

ticketsRouter.get('/', (req, res, next) => {
	const limit = req.query.limit ?? '-1';
	const page = req.query.page ?? '0';
	const site = req.query.site || '';

	// check for basic auth header
	if (
		!req.headers.authorization ||
		req.headers.authorization.indexOf('Basic ') === -1
	) {
		return res
			.status(401)
			.json({ message: 'Missing Authorization Header' });
	}

	const base64Credentials = req.headers.authorization.split(' ')[1];
	const credentials = Buffer.from(base64Credentials, 'base64').toString(
		'ascii'
	);
	const [username, password] = credentials.split(':');

	const clientHash = hash(JSON.stringify({ username, password, site }));

	if (!clients[clientHash]) {
		log('Creating a new client object');
		clients[clientHash] = zendesk.createClient({
			remoteUri: `https://${site}.zendesk.com/api/v2`,
			username,
			token: password,
		});
	}

	const client = clients[clientHash] as zendesk.Client;

	const limitNumber = Number.parseInt(limit as string);
	const pageNumber = Number.parseInt(page as string);

	// Validate query params
	if (isNaN(limitNumber)) {
		log("Requesting tickets but couldn't parse the 'limit' param");
		return res.status(400).json({
			error: "Couldn't parse the 'limit' param",
		});
	} else if (isNaN(pageNumber)) {
		log("Requesting tickets but couldn't parse the 'page' param");
		return res.status(400).json({
			error: "Couldn't parse the 'page' param",
		});
	}

	// Validate client object
	if (!client) {
		error(
			'Requesting tickets, but could not initialize Zendesk API Client'
		);
		return res
			.status(500)
			.json({ error: 'Could not initialize Zendesk API Client' });
	}

	log(
		`Requesting ${
			limitNumber === -1 ? 'all' : limitNumber
		} tickets on page ${pageNumber}`
	);

	client.tickets.list((err, clientRes, tickets) => {
		// Handle error coming from the Zendesk API
		if (err) {
			error(
				`Requesting tickets but could not reach the Zendesk API. ${err}`
			);
			const message = 'Could not reach the Zendesk API';
			const { statusCode } = err as Error & { statusCode: number };
			return res
				.status(statusCode ?? 503)
				.json({ error: err.message ?? message });
		}
		// Handle unexpected response type
		if (!Array.isArray(tickets)) {
			error(
				'Requesting tickets, but received unexpected response format from Zendesk API'
			);
			return res
				.status(500)
				.json({ error: 'Unexpected response format from Zendesk API' });
		}

		if (limitNumber === -1) {
			return res.json({ tickets, totalCount: tickets.length });
		}

		const lowerBound = (limitNumber as number) * (pageNumber as number);
		const upperBound =
			(limitNumber as number) * ((pageNumber as number) + 1);
		return res.json({
			tickets: tickets.slice(lowerBound, upperBound),
			totalCount: tickets.length,
		});
	});
});

export default ticketsRouter;

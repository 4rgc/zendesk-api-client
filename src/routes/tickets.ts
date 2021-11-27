import { Router } from 'express';
import { log } from '../util/logging';

const ticketsRouter = Router();

ticketsRouter.get('/', (req, res, next) => {
	let limit = req.query.limit ?? -1;
	let page = req.query.page ?? 0;

	limit = Number.parseInt(limit as string);
	page = Number.parseInt(page as string);

	// Validate query params
	if (isNaN(limit)) {
		log("Requesting tickets but couldn't parse the 'limit' param");
		return res.status(400).json({
			error: "Couldn't parse the 'limit' param",
		});
	} else if (isNaN(page)) {
		log("Requesting tickets but couldn't parse the 'page' param");
		return res.status(400).json({
			error: "Couldn't parse the 'page' param",
		});
	}

	let client = req.zdClient;

	if (!client) {
		return res
			.status(500)
			.json({ error: 'Could not initialize Zendesk API Client' });
	}

	log(`Requesting ${limit} tickets on page ${page}`);

	client.tickets.list((error, clientRes, tickets) => {
		if (error) return res.status(500).json({ error });
		if (!Array.isArray(tickets)) {
			return res
				.status(500)
				.json({ error: 'Unexpected response format from Zendesk API' });
		}

		if (limit === -1) {
			return res.json({ tickets });
		}

		const lowerBound = (limit as number) * (page as number);
		const upperBound = (limit as number) * ((page as number) + 1);
		return res.json({
			tickets: tickets.slice(lowerBound, upperBound),
		});
	});
});

ticketsRouter.get('/count', (req, res, next) => {
	let client = req.zdClient;

	if (!client) {
		return res
			.status(500)
			.json({ error: 'Could not initialize Zendesk API Client' });
	}

	log(`Requesting ticket count`);

	client.tickets.list((error, clientRes, tickets) => {
		if (error) return res.status(500).json({ error });
		if (!Array.isArray(tickets)) {
			return res
				.status(500)
				.json({ error: 'Unexpected response format from Zendesk API' });
		}
		return res.json({ count: tickets.length });
	});
});

export default ticketsRouter;

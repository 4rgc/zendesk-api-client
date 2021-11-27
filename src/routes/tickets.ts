import { Router } from 'express';
import { log } from '../util/logging';

const ticketsRouter = Router();

ticketsRouter.get('/', (req, res, next) => {
	let limit = req.query.limit ?? -1;
	let page = req.query.page ?? 0;

	if (typeof limit === 'string') {
		limit = Number.parseInt(limit);
	}
	if (typeof page === 'string') {
		page = Number.parseInt(page);
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

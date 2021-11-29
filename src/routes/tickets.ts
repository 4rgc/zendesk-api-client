import { Router } from 'express';
import { error, log } from '../util/logging';

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

	const client = req.zdClient;

	// Validate client object
	if (!client) {
		error(
			'Requesting tickets, but could not initialize Zendesk API Client'
		);
		return res
			.status(500)
			.json({ error: 'Could not initialize Zendesk API Client' });
	}

	log(`Requesting ${limit === -1 ? 'all' : limit} tickets on page ${page}`);

	client.tickets.list((err, clientRes, tickets) => {
		// Handle error coming from the Zendesk API
		if (err) {
			error(
				`Requesting tickets but could not reach the Zendesk API. ${err}`
			);
			const message = 'Could not reach the Zendesk API';
			return res.status(503).json({ error: message });
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

		if (limit === -1) {
			return res.json({ tickets, totalCount: tickets.length });
		}

		const lowerBound = (limit as number) * (page as number);
		const upperBound = (limit as number) * ((page as number) + 1);
		return res.json({
			tickets: tickets.slice(lowerBound, upperBound),
			totalCount: tickets.length,
		});
	});
});

export default ticketsRouter;

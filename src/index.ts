import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { zendeskClient } from './middleware/zendeskClient';
dotenv.config();

import ticketsRouter from './routes/tickets';

const app = express();

app.use(cors());
app.use(zendeskClient);

app.get('/', (req, res) => {
	res.send('Hello');
});

app.use('/tickets', ticketsRouter);

app.listen(process.env.PORT, () => {
	console.log(`Listeting on port ${process.env.PORT}`);
});

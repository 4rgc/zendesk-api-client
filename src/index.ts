import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import ticketsRouter from './routes/tickets';

const app = express();
const port = process.env.PORT || 3005;

app.use(cors());

app.get('/', (req, res) => {
	res.send('Hello');
});

app.use('/tickets', ticketsRouter);

app.listen(port, () => {
	console.log(`Listeting on port ${port}`);
});

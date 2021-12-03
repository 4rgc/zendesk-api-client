import { Client } from 'node-zendesk';
const clients: Record<string, Client> = {};

module.exports = clients;

export type ClientStore = Record<string, Client>;

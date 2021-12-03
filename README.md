# Zendesk API Client

This app was created to send requests to the Zendesk API using its Node.js library. The purpose is to workaround the limitations set on the Zendesk API for browser clients. Such a client can only be authorized via OAuth.

Since in the problem for the Zendesk Coding Challenge it was stated that no additional features may be added, I decided to go with this way of authenticating.

## Usage

The app is deployed at `http://ec2-35-183-81-115.ca-central-1.compute.amazonaws.com:8080`. You can either use that, or [start the app on your local machine](#installation).

## Routes

- `/tickets?limit={number}&page={number}&site={string}`

  **Parameters**:
  - `limit`: optional, defaults to -1 (return all tickets).
  Sets the amount of tickets per page.
  - `page`: optional, defaults to 0.
  Allows to paginate through the tickets, with `limit` being the number of tickets per page.
  - `site`: required, sets the specific site, where the tickets will be pulled from.

  **Headers**:
  - `Authorization`: required, uses Basic Authorization to parse your username and api token, and pass it on to the Zendesk API.

## Installation

Here are the steps if you want to run this app on your local machine. You should already have the latest `node` version installed.

1. Clone the repository
2. From the repository folder, run `npm install`.
3. Create a file named `.env` in the project folder
4. Add the following line: `PORT=number`, replacing `number` with the port of your choice. Default value is `3005`
5. Done! To run the development version, run `npm run dev`. This does not have hot restart, so you'll have to rerun the app on any changes to the code.

   For the production version, you need to first compile the app (`npm run compile`), and then run the built code (`npm start`).

const getTimestamp = () => new Date().toISOString();

export const log = (message: string) => {
	console.log(`[${getTimestamp()}]-LOG: ${message}`);
};

export const error = (message: string) => {
	console.error(`[${getTimestamp()}]-ERROR: ${message}`);
};

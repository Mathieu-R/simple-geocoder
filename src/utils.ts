export function createURLSearchParams(qs: Record<string, any> = {}) {
	return new URLSearchParams(JSON.parse(JSON.stringify(qs)));
}

export function getError(httpStatus: number, message = "Error while fetching") {
	return new Error(`${message}: status=${httpStatus}`);
}

export function snakeToCamel(str: string) {
	return str
		.toLowerCase()
		.replace(/([-_][a-z])/g, (group) =>
			group.toUpperCase().replace("-", "").replace("_", "")
		);
}

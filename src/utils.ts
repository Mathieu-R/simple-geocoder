export function createURLSearchParams(qs: Record<string, any> = {}) {
    return new URLSearchParams(JSON.parse(JSON.stringify(qs)))
}

export function getError(httpStatus: number, message = "Error while fetching") {
    return new Error(`${message}: status=${httpStatus}`)
}
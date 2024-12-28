const sock = new WebSocket(`ws://${process.env.RECOM_URL}`);

/**
 * Sends a request to the recommendation server and returns its response
 * in the form of an object: {code, payload}.
 * @param request String to send
 */
exports.sendRequest = async (request) => {
    return new Promise((resolve, reject) => {
        if (sock.CLOSED) {
            reject("Connection is closed");
        }

        sock.send(request);
        sock.onmessage = (event) => {
            resolve(parseResponse(event.data));
        };
    });
}

/**
 * Parse the response that the recommendation server returns as http response.
 * @param res Raw response string.
 * @returns {{status, payload}}
 */
const parseResponse = (res) => {
    // regex pattern to match the status line (like "200 OK")
    const statusRegex = /^(\d{3})\s+(.+)/;
    const statusMatch = res.match(statusRegex);

    let statusCode, payload;

    if (statusMatch) {
        statusCode = Number(statusMatch[1]);  // extract the status code
        // ignore the status text

        // Extract the payload, which is everything after the first empty line
        const payloadMatch = res.split("\n\n");
        if (payloadMatch.length > 1) {
            payload = payloadMatch[1];  // The part after the empty line (the payload)
        }
    }

    return {
        status: statusCode,
        payload: payload
    };
}

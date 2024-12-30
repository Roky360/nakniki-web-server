const {Socket} = require('net');

let sock = null;
let connected = false;

/**
 * Sends a request to the recommendation server and returns its response in the form of an object: {status, payload}.
 * @param request String to send
 * @returns {Promise<{status, payload}>} Server's response.
 */
exports.sendRequest = async (request) => {
    return new Promise(async (resolve, reject) => {
        // if not connected to recommendation server - try to connect (lazy connection)
        if (!connected) {
            await connectToRecomServer()
                .catch((err) => reject("Can't connect to recommendation server: " + err.message));
        }

        // when response arrives, parse it and return
        sock.once('data', (event) => {
            resolve(parseResponse(event.toString()));
        });
        // send the request
        sock.write(request + '\n');

        // set timeout for server response (shouldn't get here if connection is ok)
        setTimeout(() => reject("Request to recommendation server timed out."),
            5000);
    });
}

/**
 * Attempts to initiate a connection with the recommendation server.
 * Sets the `connected` flag to true if connected successfully.
 */
const connectToRecomServer = async () => {
    return new Promise(async (resolve, reject) => {
        const addr = process.env.RECOM_URL;
        const [host, port] = addr.split(':');

        sock = new Socket();
        sock.connect(port, host, () => {
            connected = true;
            resolve();
        });

        sock.on('error', (err) => {
            connected = false;
            reject(err);
        });
        sock.on('close', () => {
            connected = false;
            reject('Connection closed');
        })
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

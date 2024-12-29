// const WebSocket = require('ws');
// let sock = new WebSocket.WebSocket(`ws://${process.env.RECOM_URL}`);
const {Socket} = require('net');
let sock = null;
let connected = false;

/**
 * Sends a request to the recommendation server and returns its response
 * in the form of an object: {code, payload}.
 * @param request String to send
 */
exports.sendRequest = async (request) => {
    return new Promise(async (resolve, reject) => {
        if (!connected) {
            await connectToRecomServer()
                .catch((err) => reject("Can't connect to server: " + err.message));
        }

        sock.once('data', (event) => {
            resolve(parseResponse(event.toString()));
        });
        sock.once('error', (err) => {
            console.error('Socket error:', err);
        });

        sock.write(request + '\n', () => console.log("sent " + request));

        setTimeout(() => reject("Request to recommendation server timed out."),
            3000);
    });
}

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
            reject(err);
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

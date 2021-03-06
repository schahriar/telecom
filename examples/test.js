const Telecom = require('../Telecom');
const telecom = new Telecom();

let response = [
  "HTTP/1.1 200 OK",
  "Server: Slang",
  "Content-Type: application/json; charset=UTF-8",
  "Content-Encoding: UTF-8",
  "Connection: close",
  "",
  ""
].join('\r\n');

function httpHeaderParser(chunk, line, next) {
  if (line.state.hasHeaders) return next({
    headers: state.httpHeaders,
    chunk: chunk.slice(i)
  });

  let hasReturn = false;
  let lastIndex = 0;
  let i = chunk.indexOf(0x0D, lastIndex);
  const length = chunk.length;
  const state = line.state;
  const CRLF = Buffer.from([0x0D, 0x0A]);

  if (!state.httpHeaders) state.httpHeaders = {};

  while (i > 0) {
    i += 2;
    if (chunk[i - 1] !== 0x0A) continue;
    if (lastIndex >= (i - 2)) {
      state.hasHeaders = true;
      return next({
        headers: state.httpHeaders,
        chunk: chunk.slice(i)
      });
    }
    if (!state.headerHadRequestLine) {
      state.httpRequestLine = chunk.toString('utf8', lastIndex, i);
      state.headerHadRequestLine = true;
    } else {
      state.httpHeaders[
        chunk.toString('utf8', lastIndex, chunk.indexOf(':', lastIndex))
      ] = chunk.toString('utf8', chunk.indexOf(':', lastIndex) + 2, chunk.indexOf('\r', lastIndex + 2));
    }
    lastIndex = i;
    i = chunk.indexOf(0x0D, lastIndex);
  }

  if (lastIndex !== (length - 1)) {
    console.log("PUSHING BACK");
    /** @todo: consider copying buffer here */
    line.unshift(chunk.slice(lastIndex));
  }
}

telecom.parallelize(4, () => {
  console.log("@P1");
  // Simple echo server on port 8000
  telecom.pipeline(new Telecom.interfaces.TCP(8080))
    // Connection Timeout
    .pipe((chunk, line, next) => {
      if (chunk === null) return; // Stream has ended
      if (chunk !== line.OPEN) return next(chunk); // Ignore after Connection has been opened
      line.state.timeout = setTimeout(() => {
        if (line.open) line.throw(new Error("Connection timeout"));
      }, 50000);
    })
    .pipe(httpHeaderParser)
    .pipe((http, line, next) => {
      if (http.chunk) console.log("BODY ->" + http.chunk.toString('utf8'));
      //console.log("HEADER LINE ->" + line.state.httpRequestLine);
      next(http);
    })
    .pipe(function (http, line, next) {
      if (http.headers) line.end(response + JSON.stringify(http.headers, null, 2));
      //line.end(response + "HELLO WORLD!");
    }).on('error', (error, line) => {
      line.end("Internal Server Error");
      console.log({ error });
    }).on('debug', (...args) => {
      console.log("DEBUG", ...args);
    });
});

telecom.parallelize(2, () => {
  console.log("@P2");
});
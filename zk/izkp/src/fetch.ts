import { request } from "https";

export async function fetchJson<T>(
  url: string,
  method: string = "GET",
  body?: unknown
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": body ? Buffer.byteLength(JSON.stringify(body)) : 0,
      },
    };

    const req = request(urlObj, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const parsedData = JSON.parse(data);
            resolve(parsedData);
          } catch (error) {
            console.error(error);
            reject(new Error("Error parsing JSON response"));
          }
        } else {
          reject(new Error(`HTTP error! status: ${res.statusCode}`));
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

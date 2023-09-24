import fs from "fs";
import https from "https";
import qs from "querystring";
import { serveLoginPage } from "./routes/login-page.js";
import { serveUserProfile } from "./routes/user-profile.js";
import { serveScripts } from "./routes/scripts.js";
import { serveStyles } from "./routes/styles.js";
import { generateSessionToken, isValidSessionToken, getUserIdFromSessionToken, removeSessionToken } from "./sessions/sessions.js";

const key = fs.readFileSync('../cert/CA/localhost/localhost.decrypted.key');
const cert = fs.readFileSync('../cert/CA/localhost/localhost.crt');

/*

Creating server, add UI and other stuff

*/

const server = https.createServer({ key, cert }, (req, res) => {
  if (req.url === '/' || req.url === '/login') {
    serveLoginPage(res, false)
  } else if (req.url === '/logina') {
    serveLoginPage(res, true)
  } else if (req.method === 'POST' && req.url === '/validate') {
    let requestBody = '';

    // Accumulate the request body
    req.on('data', chunk => {
      requestBody += chunk.toString();
    });

    // Parse the request body and handle the form data
    req.on('end', () => {
      const formData = qs.parse(requestBody);

      // Do something with the form data here...
      // Get the values of the input elements
      const usernameEmail = qs.parse(requestBody).user;
      const encodedCredentials = Buffer.from(`${usernameEmail}:${qs.parse(requestBody).password}`).toString("base64");
      validateCredentials(encodedCredentials).then(result => {
        if (result) {
          console.log("validation success");
          (async () => {
            try {
              const jwt = await getJWT(encodedCredentials)
              const token = generateSessionToken(jwt)
              res.setHeader('Set-Cookie', `myCookie=${token}; Path=/;`)
              res.writeHead(301, { 'Location': 'https://localhost:3000/user' });
              res.end();
            } catch (error) {
              console.log(error);
            }
          })()
        } else {
          console.log("validation fail");
          res.writeHead(301, { 'Location': 'https://localhost:3000/logina' });
          res.end();
        }
      })

    });
  } else if (req.url === '/user') {
    (async () => {
      try {
        const cookieToken = req.headers.cookie?.split(';').find(cookie => cookie.trim().startsWith('myCookie='))?.split('=')[1];
        if (isValidSessionToken(cookieToken)) {
          const jwt = getUserIdFromSessionToken(cookieToken)
          const info = await getProfileData(jwt)
          const userData = `<div id="userInfo">` + info + `</div>`
          serveUserProfile(res, userData)
        } else {
          console.log("invalid session token");
          res.writeHead(301, { 'Location': 'https://localhost:3000/' });
          res.end();
        }
      } catch (error) {
        console.log(error);
      }
    })()
  } else if (req.url == "/logout" && req.method === 'POST') {
    const cookieToken = req.headers.cookie?.split(';').find(cookie => cookie.trim().startsWith('myCookie='))?.split('=')[1];

    if (isValidSessionToken(cookieToken)) {
      removeSessionToken(cookieToken)
      // Set the expiration date to a past date
      res.setHeader('Set-Cookie', 'myCookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;');
      console.log("logout successful");
      res.end();
    } else {
      console.log("invalid session token");
    }

  } else if (req.url == "/scripts/user-page.js") {
    serveScripts(res)
  } else if (req.url.endsWith(".css")) {
    serveStyles(res, req.url)
  } else {
    // Serve a 404 error
    res.writeHead(404);
    res.end();
  }
}
);

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});


/*

CREDENTIALS, JWT, LOGGING IN

*/

async function validateCredentials(encodedCredentials) {
  try {
    const jwt = await getJWT(encodedCredentials)
    if (jwt === `{"error":"User does not exist or password incorrect"}`) {
      return false
    } else {
      return true
    }
  } catch (error) {
    console.log(error);
  }
}

function getJWT(encodedCredentials) {
  const auth = `Basic ${encodedCredentials}`;
  const options = {
    hostname: "learn.01founders.co",
    path: '/api/auth/signin',
    method: 'POST',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    },
    agent: new https.Agent({
      rejectUnauthorized: true // Set to true to reject self-signed certificates
    })
  }

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data)
      });
    });

    req.on('error', (error) => {
      console.error(error);
      reject(error)
    });

    req.end();
  });
}


function getProfileData(JWT) {
  const query = `
  query {
    user {
      firstName
      lastName
      id
      login
      progresses(where: {_and: [
          {path: {_like: "%div-01/%"}},
          {path: {_nlike: "%piscine%"}},
          {path: {_nlike: "%check-points%"}},
          {path: {_nlike: "%weekfour%"}}
      ]}) {
        object {
          name
        }
        path
        grade
      }
      transactions(where: {_and: [
      	{path: {_like: "%div-01/%"}},
      	{path: {_nlike: "%piscine-js/%"}},
      	{path: {_nlike: "%piscine-js-%"}},
      	{path: {_nlike: "%weekfour%"}},
        {type: {_eq: "xp"}}
    ]}) {
			amount
      createdAt
    }
      xps(where: {_and: [
          {path: {_like: "%div-01/%"}},
          {path: {_nlike: "%piscine%"}},
          {path: {_nlike: "%check-points%"}},
          {path: {_nlike: "%weekfour%"}}
      ]}) 
      {
        amount
        path
      }
    }
  }
`;

  const headers = {
    'Authorization': `Bearer ${JWT.replaceAll('\"', '')}`,
    'Content-Type': 'application/json',
  };

  const options = {
    method: 'POST',
    headers: headers,
    hostname: 'learn.01founders.co',
    path: '/api/graphql-engine/v1/graphql',
    agent: new https.Agent({
      rejectUnauthorized: true // Set to true to reject self-signed certificates
    })
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data)
      });
    });

    req.on('error', (err) => {
      reject(err)
    });

    req.write(JSON.stringify({ query: query }));
    req.end();
  });
}
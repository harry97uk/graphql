function renderLoginPage() {
  const loginHTML = `
    <div class="login-form">
        <div id="incorrect-details" style="color: red; visibility: hidden;">Incorrect username or password!</div>
        <form method="post">
            <!-- <label for="user">Username/Email:</label> -->
            <input type="text" id="user" name="user" placeholder="Username or Email" required>
            <br>
            <!-- <label for="password">Password:</label> -->
            <input type="password" id="password" name="password" placeholder="Password" required>
            <br>
            <button type="submit">Submit</button>
          </form>
    </div>
    `;

  document.getElementById("main-container").innerHTML = loginHTML;
}

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = document.getElementById("user").value;
    const password = document.getElementById("password").value;

    // Perform client-side validation here if needed
    const encodedCredentials = Buffer.from(`${user}:${password}`).toString(
      "base64"
    );

    try {
      const result = await validateCredentials(encodedCredentials);
      if (result) {
        console.log("validation success");
        (async () => {
          try {
            const jwt = await getJWT(encodedCredentials);
            const token = generateSessionToken(jwt);
            // Store the token in localStorage
            localStorage.setItem("graphql-token", token);
            navigateTo("/user");
          } catch (error) {
            console.log("could not get jwt: ", error);
          }
        })();
      } else {
        console.log("validation fail");
        //implement failed attempt
        document.getElementById("incorrect-details").style.visibility =
          "visible";
      }
    } catch (error) {
      console.log("error validating credentials: ", error);
    }
  });
});

/*

CREDENTIALS, JWT, LOGGING IN

*/

async function validateCredentials(encodedCredentials) {
  try {
    const jwt = await getJWT(encodedCredentials);
    if (jwt === `{"error":"User does not exist or password incorrect"}`) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log(error);
    throw new Error("error: ", error);
  }
}

function getJWT(encodedCredentials) {
  const auth = `Basic ${encodedCredentials}`;
  const options = {
    hostname: "learn.01founders.co",
    path: "/api/auth/signin",
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
    agent: new https.Agent({
      rejectUnauthorized: true, // Set to true to reject self-signed certificates
    }),
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        resolve(data);
      });
    });

    req.on("error", (error) => {
      console.error(error);
      reject(error);
    });

    req.end();
  });
}

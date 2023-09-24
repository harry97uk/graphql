function renderLoginPage() {
  const loginHTML = `
  GraphQL
    <div id="login-form" class="login-form">
        <div id="incorrect-details" style="color: red; visibility: hidden;">Incorrect username or password!</div>
        <form>
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
    const encodedCredentials = btoa(`${user}:${password}`);

    try {
      const result = await validateCredentials(encodedCredentials);
      if (result) {
        console.log("validation success");
        navigateTo("/user");
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
    console.log(jwt);
    if (
      jwt === `{"error":"User does not exist or password incorrect"}` ||
      !jwt
    ) {
      return false;
    } else {
      localStorage.setItem("graphql-token", jwt);
      return true;
    }
  } catch (error) {
    console.log(error);
    throw new Error("error: ", error);
  }
}

async function getJWT(encodedCredentials) {
  const auth = `Basic ${encodedCredentials}`;
  const options = {
    hostname: "learn.01founders.co",
    path: "/api/auth/signin",
    method: "POST",
    headers: {
      Authorization: auth,
      "Content-Type": "application/json",
    },
  };

  return await makeHttpRequest(options)
    .then((responseData) => {
      console.log(responseData);
      // Handle the response data here
      return responseData;
    })
    .catch((error) => {
      // Handle errors here
      console.log(error);
    });
}

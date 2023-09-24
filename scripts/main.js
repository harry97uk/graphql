// main.js (Client-side JavaScript)
renderLoginPage();

// Define client-side routes and handle navigation
function navigateTo(route) {
  // Handle client-side routing (e.g., change content based on route)
  switch (route) {
    case "/login":
      renderLoginPage();
      break;
    case "/user":
      renderUserProfile();
      break;

    default:
      renderLoginPage();
      break;
  }
}

async function makeHttpRequest(options) {
  options.url = new URL(options.path, "https://" + options.hostname);
  console.log(options.url);
  console.log(options);
  return fetch(options.url, {
    method: options.method,
    headers: options.headers,
    body: options.body,
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.text(); // You can use .json() for JSON responses
    })
    .catch((error) => {
      console.error(error);
      throw error;
    });
}

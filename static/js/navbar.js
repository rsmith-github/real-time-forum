// General routes/navbar handling and login handling

// Nav bar
let registerLink = document.getElementById("registerLink");
let loginLink = document.getElementById("loginLink");

async function Login() {
    let loginBtn = document.getElementById("loginBtn")
    if (!!loginBtn) {
        loginBtn.addEventListener("click", async () => {
            let username = document.getElementById("username-input").value;
            let password = document.getElementById("password-input").value;

            // send data to backend
            sendJsonToBackend("users", username, password);



            localStorage.setItem("username", username.toString())
            // Only show page if user is validated.
            let valid = false;

            let validUser;

            // Keep asking for a session from the backend until user is found.
            let count = 0;
            while (valid === false) {
                count++
                sessions = await fetchData("sessions");
                validUser = sessions.filter((session) => {
                    return session.username === username;
                })
                if (validUser.length === 1) {
                    valid = true;
                }
                // If taking too long, assume that the password or username was incorrect.
                if (count >= 30) {
                    alert("Username or password incorrect.");
                    break;
                }
            }


            if (valid === true) {
                showPage("homepage");
                document.querySelector("#login").innerHTML = "";
                console.log("user validated");
            } else {
                // loginBtn.click();
                console.log("user not validated on client side");
            }


        })
    } else {
        console.log("Error, login button does not exist.")
    }
}

// Update nav bar content each time a link is clicked in login/register page.
function NavbarContent(cb) {
    let endpoint = url[url.length - 1]

    let navbar = document.querySelector("nav")
    if (endpoint === "login" || endpoint === "register") {
        navbar.innerHTML = `
            <div class="container-fluid">
            <a class="navbar-brand" href="/">Real Time Forum</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar">
            <span class="navbar-toggler-icon"></span>
            </button>
            <div class="offcanvas offcanvas-end text-bg" tabindex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
            <div class="offcanvas-header">
                <h5 class="offcanvas-title" id="offcanvasDarkNavbarLabel">Please login</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div class="offcanvas-body">
                <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
                <li class="nav-item" id="loginLink">
                    <a class="nav-link" href="/login" data-name="login">Log In</a>
                </li>
                <li class="nav-item" id="registerLink">
                    <a class="nav-link" href="/register" data-name="register">Register</a>
                </li>
                </ul>
            </div>
            </div>
        </div>
        `
        // Handle login after changing html. Event listener needs to be added each time after innerHTML is used.
        // https://stackoverflow.com/questions/53273768/javascript-onclick-function-only-works-once-very-simple-code
        Login();

    } else {
        navbar.innerHTML = `
        <div class="container-fluid">
        <a class="navbar-brand nav-link" href="/" data-name="homepage">Real Time Forum</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasDarkNavbar" aria-controls="offcanvasDarkNavbar">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="offcanvas offcanvas-end text-bg" tabindex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
          <div class="offcanvas-header">
            <h5 class="offcanvas-title" id="offcanvasDarkNavbarLabel"><strong>Welcome</strong>&nbsp; ${localStorage.getItem("username")}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Close"></button>
          </div>
          <div class="offcanvas-body">
            <ul class="navbar-nav justify-content-end flex-grow-1 pe-3">
              <li class="nav-item">
                <a class="nav-link" aria-current="page" href="/" data-name="homepage">Home</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" id="messenger-link" href="/messenger" data-name="messenger">Messenger</a>
              </li>
              <li class="nav-item">
                <a class="logout-btn" href="/logout">Logout</a>
              </li>
            </ul>
            <form class="d-flex mt-3" role="search">
              <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
              <button class="btn btn-success" type="submit">Search</button>
            </form>
          </div>
        </div>
      </div>
        `
    }

    cb();
}

// Check url endpoint for each link that is clicked.
function handleNav() {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", checkLink)
    });
}


function checkLink(event) {
    // update on each click
    event.preventDefault() // prevent page reload.
    // Handle login by adding event listener to login button.
    if (!!this.dataset.name) {
        showPage(this.dataset.name) // show specific page. I.e. Homepage, login, register. The page name is stored as data attribute in HTML thus this.dataset.name.
    }
}

// Function to hide all pages. Needed when chosing any page.
function hidePages() {
    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
    });
}

// Show specific page based on name.
function showPage(name) {
    hidePages(); // Hide all pages.
    body.style.overflow = "visible"

    // Select page div.
    let page = document.getElementById(name)

    // Display div which will be populated with HTML from /api/content.
    page.style.display = "block";

    // Add to url history
    if (name == "homepage") {
        history.pushState({ name: name }, "", `${"/"}`);
        displayPosts(eventListeners);
    } else {
        //                                        ^
        history.pushState({ name: name }, "", `${name}`);
    }

    // Update url variable globally after updating client url.
    url = window.location.href.split("/");

    if (!!content) {
        content.forEach(object => {
            if (object.Endpoint == name) {
                page.innerHTML = object.Content
            }
        })
    }

    // Change nav bar content
    NavbarContent(eventListeners);
}

//   Function to get cookie based on name.
//   This doesn't seem to work for "session" cookie, but works for CSRF token.
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}



// Add event listeners to elements added by ".innerHTML"
function eventListeners() {

    handleNav()

    let comment_links = document.querySelectorAll(".comment-link")
    comment_links.forEach(element => {
        element.addEventListener("click", OpenCommentSection);
    });

    let logoutBtn = document.querySelector(".logout-btn")

    if (!!logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            sendJsonToBackend("logout")
            document.querySelector("#homepage").innerHTML = ""
            document.querySelector("#messenger").innerHTML = ""
            document.querySelector(".chatWindow").innerHTML = ""

            showPage("login");
        })
    }

}

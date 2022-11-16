// Save scroll position when reloading page.
window.addEventListener(
    "scroll",
    function () {
        localStorage.setItem("scrollPosition", window.scrollY);
    },
    false
);


let body = document.querySelector("body");

// Split URL to access last parameter.
let url = window.location.href.split("/");
// On load event
document.addEventListener(
    "DOMContentLoaded",
    async function () {
        hidePages();
        // Show page based on url parameter.
        let endpoint = url[url.length - 1]
        if (endpoint == "") {
            endpoint = "homepage"
        }
        // Get content from api.
        await fetchData("content");

        // Show page based on endpoint.
        showPage(endpoint);

        // Fix weird sectioning issue
        document.querySelector("html").style.height = window.innerHeight;

        // Handle nav bar.
        handleNav();

        // Particles.js
        Particles.init({
            selector: '.background',
            connectParticles: false,
            maxParticles: 50,
            color: "#FF00FF"
        });

        chatApp();

    }

);

window.onpopstate = function (event) {
    showPage(event.state.name)
}



// ********************************************************************************************
// Api helper functions


// Global variables (arrays) to store api data.
let content = [];
let posts = [];
let comments = [];
let sessions = [];
let chats = [];
async function fetchData(name) {
    // Get api key
    let apiKey = await getApiKey()

    const headers = {
        'Token': apiKey
    };

    switch (name) {
        case "allposts":

            // Fetch postss
            posts = await fetch('/api/allposts', { headers });
            posts = await posts.json();
            break;
        case "comments":
            // Fetch comments.
            comments = await fetch("/api/comments", { headers })
            comments = await comments.json()
            break;
        case "sessions":
            // Fetch sessions.
            sessions = await fetch("/api/sessions", { headers })
            sessions = await sessions.json()
            return sessions
            break;
        case "chats":
            // Fetch chats.
            chats = await fetch("/api/chats", { headers })
            chats = await chats.json()
            break;
        default:
            // Fetch html content for each page in the single page app.
            content = await fetch("/api/content")
            content = await content.json()

    }
}

async function getApiKey() {
    // Get api key
    let JWTheaders = new Headers();
    JWTheaders.append('Content-Type', 'text/plain');
    JWTheaders.append('Access', '1234');

    const JWTrequest = new Request('/jwt', {
        method: 'GET',
        headers: JWTheaders,
        mode: 'cors',
        cache: 'default',
    });

    let file = await fetch(JWTrequest);
    let apiKey = await file.text();
    return apiKey
}


// ***********************************************************************************
// General routes/navbar handling.

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
            <div class="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
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
                <li class="nav-item dropdown" id="registerLink">
                    <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Dropdown
                    </a>
                    <ul class="dropdown-menu dropdown-menu-dark">
                    <li><a class="dropdown-item" href="#">Action</a></li>
                    <li><a class="dropdown-item" href="#">Another action</a></li>
                    <li>
                        <hr class="dropdown-divider">
                    </li>
                    <li><a class="dropdown-item" href="#">Something else here</a></li>
                    </ul>
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
        <div class="offcanvas offcanvas-end text-bg-dark" tabindex="-1" id="offcanvasDarkNavbar" aria-labelledby="offcanvasDarkNavbarLabel">
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
              <li class="nav-item dropdown">
                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Dropdown
                </a>
                <ul class="dropdown-menu dropdown-menu-dark">
                  <li><a class="dropdown-item" href="#">Action</a></li>
                  <li><a class="dropdown-item" href="#">Another action</a></li>
                  <li>
                    <hr class="dropdown-divider">
                  </li>
                  <li><a class="dropdown-item" href="#">Something else here</a></li>
                </ul>
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


// ************************************************************************************************************************************
// Posts and homepage HTML.

let comment_sections = [];
// Get posts from API and put them in the homepage.
let homepage = document.getElementById("homepage");
async function displayPosts(callBack) {
    await fetchData("allposts");
    await fetchData("comments");
    posts = posts.reverse();

    posts.forEach(post => {
        let postDiv = document.createElement('div');
        postDiv.className = "postDiv";
        homepage.appendChild(postDiv);

        let postBody = `
        <div class="card gedf-card" id="post-${post.id}">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="d-flex justify-content-between align-items-center">
                                <div class="mr-2">
                                    <img class="rounded-circle" width="45" src="https://picsum.photos/50/50" alt="">
                                </div>
                                <div class="ml-2">
                                    <div class="h5 m-0">@${post.username}</div>
                                    <div class="h7 text-muted">Insert Bio Here</div>
                                </div>
                            </div>
                            <div>
                                <div class="dropdown">
                                    <button class="btn btn-link dropdown-toggle" type="button" id="gedf-drop1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                        <i class="fa fa-ellipsis-h"></i>
                                    </button>
                                    <div class="dropdown-menu dropdown-menu-right" aria-labelledby="gedf-drop1">
                                        <div class="h6 dropdown-header">Configuration</div>
                                        <a class="dropdown-item" href="#">Save</a>
                                        <a class="dropdown-item" href="#">Hide</a>
                                        <a class="dropdown-item" href="#">Report</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <div class="card-body">
                        <div class="text-muted h7 mb-2"> <i class="fa fa-clock-o"></i>${post.time_posted}</div>
                        <p class="inlinecategory">
                          <span class="bold">Post type: </span>${post.category_2}
                        </p>
                        &nbsp;
                        <p class="inlinecategory">
                          <span class="bold"> Category: </span>${post.category}
                        </p>

                        <p class="card-text">
                            ${removeTags(post.content)}
                        </p>
                    </div>
                    <div class="card-footer">
                        <a href="#" class="card-link"><i class="fa fa-gittip"></i> Like</a>
                        <a href="/" class="comment-link" id="cmnt-lnk-${post.id}"><i class="fa fa-comment"></i> Comments</a>
                        <a href="#" class="card-link"><i class="fa fa-mail-forward"></i> Share</a>
                        <div class="commentbox">
                            <form action="/" method="POST" class="comment-form" id="comment-form-${post.id}">
                                <input type="text" class="commenttxtbox" name="comment" id="comment-${post.id}"/>
                                <button onclick="Comment(event)" class="commentbttn btn btn-outline-secondary" name="submitComment" id="cmnt-btn-${post.id}">Comment</button>
                                <input type="hidden" name="comment-id" value="${post.id}">
                            </form>
                            <div class="comment-section" id="cmnt-sec-${post.id}" style="display: none"></div>
                        </div>
                    </div>
                    </div>

        `

        postDiv.innerHTML = postBody;
    });

    // Login redirect button only shows up on homepage so handle the click event.
    let redirectBtn = document.getElementById("loginredirect")
    if (redirectBtn != null) {
        redirectBtn.addEventListener("click", checkLink)
    }

    // Scroll to position after content has been loaded.
    window.scrollTo(0, localStorage.getItem("scrollPosition"));

    chatApp();

    callBack();

}


// Remove html tags.
function removeTags(str) {
    if ((str === null) || (str === ''))
        return false;
    else
        str = str.toString();

    // Regular expression to identify HTML tags in 
    // the input string. Replacing the identified 
    // HTML tag with a null string.
    return str.replace(/(<([^>]+)>)/ig, '');
}

// **********************************************************************************
// Comment section

function OpenCommentSection(e) {

    // Fech comments
    fetchData("comments")

    // Prevent reload
    e.preventDefault();// This is logging an error when clicking on comment button because event is not passed as argument.

    // Slice the id to get numeric value.
    let slicedId = e.target.id.slice(9, e.target.id.length)

    // Get comment section
    let commentSection = document.getElementById(`cmnt-sec-${slicedId}`);

    // If comment section is open, close it.
    if (commentSection.innerHTML != "" && !e.target.id.includes("btn")) {
        commentSection.innerHTML = "";
        commentSection.style.display = "none";
    } else {
        commentSection.innerHTML = "";

        commentSection.style.display = "block";
        // Put comments into correct section.
        comments.forEach(comment => {
            let newComment = document.createElement("div");
            newComment.append(comment.username, ": ");
            newComment.append(comment.comment);

            // Display comments.
            if (comment.post_ID == slicedId) {
                commentSection.append(newComment);
            }
        })

        // Get text area.
        let textArea = document.getElementById(`comment-${slicedId}`);

        if (textArea.value !== "") {
            // Create new div to put a new comment.
            let commentDiv = document.createElement("div")

            // Get current user.
            let username = localStorage.getItem("username");

            // Append username and comment.
            commentDiv.append(username + ": " + textArea.value)

            commentSection.append(commentDiv)
        }

        textArea.value = "";

    }


}

// Send JSON data to backend "views" in order to save to database.
async function sendJsonToBackend(endpoint, arg1, arg2, arg3) {

    // Get api key
    let apiKey = await getApiKey()

    switch (endpoint) {
        case "comments":
            await fetch(`/api/${endpoint}`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken"),
                    'Token': apiKey,
                },
                body: JSON.stringify({
                    username: arg3,
                    comment: arg2,
                    post_ID: arg1,
                }),
            });
            break;
        case "chats":
            await fetch(`/api/${endpoint}`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken"),
                    'Token': apiKey,
                },
                body: JSON.stringify({
                    user1: arg1,
                    user2: arg2,
                }),
            });
            break;
        case "users":
            await fetch(`/api/${endpoint}`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken"),
                    'Token': apiKey,
                },
                body: JSON.stringify({
                    username: arg1,
                    password: arg2,
                }),
            });
            break;
        case "logout":
            await fetch(`/${endpoint}`, {
                method: "POST",
            });
            break;
        case "new":
            await fetch(`/${endpoint}`, {
                method: "POST",
                body: JSON.stringify({
                    category_1: arg1,
                    category_2: arg2,
                    content: arg3,
                }),
            });
            break;
        default:
            break;
    }
}

// NOTE: This function is called in the HTML.
function Comment(e) {
    let slicedId = e.target.id.slice(9, e.target.id.length);
    let textArea = document.getElementById(`comment-${slicedId}`);

    let username = localStorage.getItem("username")

    // Send the comment to API.
    sendJsonToBackend("comments", slicedId, textArea.value, username)

    // Open comment section
    OpenCommentSection(e)

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



// *************************************************************************
// Chat app front end


// Display chat app on bottom right of the screen
async function chatApp() {
    await fetchData("sessions");
    await fetchData("chats");
    let messengerLink = document.querySelector("#messenger-link");

    body.style.overflow = "visible"

    if (!!messengerLink) {
        messengerLink.addEventListener("click", () => {
            showPage("messenger");
        });
        showUsers();
    }
}



let chatWindow = document.querySelector(".chatWindow");
let messengerPage = document.getElementById("messenger")
let chatForm = document.createElement("form");
let input = document.createElement("input");

// Show online users for chat app.
function showUsers() {
    let messenger = document.querySelector("#messenger");
    messenger.innerHTML = "";
    sessions.forEach(session => {

        // Long bar with username to click on.
        let div = document.createElement("div")
        let currentUser = localStorage.getItem("username")
        // Skip current user. Should not chat with yourself.
        if (session.username === currentUser) {
            return;
        }

        div.className = "chatRoom"
        // Id is user displayed and current user.
        div.id = `${currentUser}<->${session.username}`

        div.innerHTML = `
        <h2>${session.username}</h2>
        <em>Click to chat</em>
        `;
        div.style.border = "1px solid green";
        div.style.marginBottom = "5px";
        messengerPage.append(div);

        // Show chat box on click
        div.addEventListener("click", () => {


            if (chatWindow.querySelector("button") == null) {
                showChatWindow(div.id);

            } else {

                chatWindow.style.display = "block";

                connectToChatserver([currentUser, session.username]);

                // Blur background page.
                messengerPage.style.opacity = "0.5"
                messengerPage.style.pointerEvents = "none";
            }
        });
    });

}

// Show chat window pop up with id of user-user
function showChatWindow(id) {


    // Get users in chat
    let usersInChat = id.split("<->");

    // Create title.
    let title = document.createElement("div");
    title.className = "h5 m-0";
    title.id = "chatwith"
    title.innerText = `Chat with: @${usersInChat[1]}`
    chatWindow.append(title);

    // Style and append components
    chatWindowStyles(id);

    // Set correct id
    chatWindow.id = `window: ${id}`

    connectToChatserver(usersInChat);

    // Auto focus message form.
    input.focus();

    sendJsonToBackend("chats", usersInChat[0], usersInChat[1])

}

function chatWindowStyles(id) {
    // Styling
    chatWindow.style.height = "434.714px";
    chatWindow.style.marginTop = "100px";
    chatWindow.style.display = "block";
    chatWindow.style.padding = "25px 0px 0px 50px"
    chatWindow.style.width = "50%";
    chatWindow.style.position = "absolute";
    chatWindow.style.filter = "drop-shadow(0px 0px 10px #AAAAAA)";

    // Create close chatbox button.
    let close = document.createElement("i");
    close.innerHTML = `<button type="button" class="btn-close" aria-label="Close"></button>`;
    close.style.position = "absolute";
    close.style.left = "95%"
    close.style.top = "2%"
    close.addEventListener("click", () => {
        messengerPage.style.opacity = "1"
        messengerPage.style.pointerEvents = "auto";
        chatWindow.innerHTML = "";
        chatWindow.style.display = "none";
        leaveChat();
        return;
    })

    chatWindow.append(close)

    // Blur background page.
    messengerPage.style.opacity = "0.5"
    messengerPage.style.pointerEvents = "none";


    let chatScreen = document.createElement("div");
    // Chat "screen"/box styles.
    chatScreen.style.width = "70%";
    chatScreen.style.height = "70%";
    chatScreen.style.backgroundColor = "white";
    chatScreen.style.border = "1px solid black";
    chatScreen.style.margin = "10px 10px 10px 0px";
    chatScreen.style.overflow = "auto";
    chatScreen.className = "chatScreen";
    chatScreen.id = "chatScreen:" + id;

    chatForm.id = "chatForm";


    input.style.width = "60%";

    // Append different components to chat window.
    chatWindow.append(chatScreen);
    chatForm.append(input);
    let sendMsgButton = document.createElement("button");
    sendMsgButton.innerText = "Send"


    if (chatForm.childElementCount === 1) {
        chatForm.appendChild(sendMsgButton);
    }
    chatWindow.append(chatForm);

    // Input
    input.type = "text";

}


function leaveChat() {
    wSocket.close();
}



let wSocket;
var ServiceLocation = "ws://" + document.location.host + "/chat/";




function connectToChatserver(usersInChat) {
    console.log("connected: " + usersInChat[0] + " and " + usersInChat[1]);

    fetchData(chats);

    console.log("All chats: ", chats);

    let chatExists = false;

    console.log("array: ", usersInChat);

    if (!!chats) {
        // Check f chat between the two users already exists.

        chats.forEach((chat) => {
            if (chat.user1 === usersInChat[0] && chat.user2 === usersInChat[1]) {
                chatExists = true;
            }
        })
    }

    // console.log(chatExists);

    // If chat between the two users already exists, connect to the one that already exists.
    if (chatExists === true) {
        wSocket = new WebSocket(ServiceLocation + usersInChat[0] + "~" + usersInChat[1]);
    } else {
        // Otherwise create a new one.
        wSocket = new WebSocket(ServiceLocation + usersInChat[1] + "~" + usersInChat[0]);
    }





    wSocket.addEventListener("message", (ev) => {
        OnMessageReceived(ev, usersInChat);
    })

}

chatForm.addEventListener("submit", (ev) => {
    ev.preventDefault()
    SendMessage()
})

function SendMessage() {
    var msg = '{"message":"' + input.value + '", "sender":"'
        + localStorage.getItem("username") + '", "received":""}';
    wSocket.send(msg);
    input.value = ""
}

function OnMessageReceived(evt, usersInChat) {
    var msg = JSON.parse(evt.data); // native API
    console.log(msg);

    let messageCointainer = document.createElement("div");
    let messageHTML = '<p>' + msg.sender + ':' + msg.message + '</p>';
    messageCointainer.innerHTML = messageHTML;


    // Append message to correct chat.
    let chatScreens = document.querySelectorAll(".chatScreen")

    chatScreens.forEach(chatscreen => {
        if (chatscreen.id.includes(usersInChat[0]) && chatscreen.id.includes(usersInChat[1])) {
            chatscreen.append(messageCointainer)
        }
    });

}



// New post without refresh. This function is called in the golang file. functions.LoadContent()
function newPost(event) {
    event.preventDefault()

    // Get the checked radio button.
    let category_1 = document.querySelector('input[name="postType"]:checked');;
    // Get lanugage category
    let category_2 = document.getElementById("select-language");
    // Get content from textarea.
    let content = document.querySelector("#newposttxt");


    console.log(category_1.value);
    console.log(category_2.value);
    console.log(content.value);

    sendJsonToBackend("new", category_1.value.toString(), category_2.value.toString(), content.value.toString())

    let form = document.querySelector('.newpostbody');

    let newPost = `
    <div class="card gedf-card" id="post-${"INSERT_ID"}">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="mr-2">
                                <img class="rounded-circle" width="45" src="https://picsum.photos/50/50" alt="">
                            </div>
                            <div class="ml-2">
                                <div class="h5 m-0">@${localStorage.getItem("username")}</div>
                                <div class="h7 text-muted">Insert Bio Here</div>
                            </div>
                        </div>
                        <div>
                            <div class="dropdown">
                                <button class="btn btn-link dropdown-toggle" type="button" id="gedf-drop1" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <i class="fa fa-ellipsis-h"></i>
                                </button>
                                <div class="dropdown-menu dropdown-menu-right" aria-labelledby="gedf-drop1">
                                    <div class="h6 dropdown-header">Configuration</div>
                                    <a class="dropdown-item" href="#">Save</a>
                                    <a class="dropdown-item" href="#">Hide</a>
                                    <a class="dropdown-item" href="#">Report</a>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="card-body">
                    <div class="text-muted h7 mb-2"> <i class="fa fa-clock-o"></i>${"INSERT_TIME_POSTED"}</div>
                    <p class="inlinecategory">
                      <span class="bold">Post type: </span>${category_1.value}
                    </p>
                    &nbsp;
                    <p class="inlinecategory">
                      <span class="bold"> Category: </span>${category_2.value}
                    </p>

                    <p class="card-text">
                        ${removeTags(content.value)}
                    </p>
                </div>
                <div class="card-footer">
                    <a href="#" class="card-link"><i class="fa fa-gittip"></i> Like</a>
                    <a href="/" class="comment-link" id="cmnt-lnk-${"INSERT_ID"}"><i class="fa fa-comment"></i> Comments</a>
                    <a href="#" class="card-link"><i class="fa fa-mail-forward"></i> Share</a>
                    <div class="commentbox">
                        <form action="/" method="POST" class="comment-form" id="comment-form-${"INSERT_ID"}">
                            <input type="text" class="commenttxtbox" name="comment" id="comment-${"INSERT_ID"}"/>
                            <button onclick="Comment(event)" class="commentbttn btn btn-outline-secondary" name="submitComment" id="cmnt-btn-${"INSERT_ID"}">Comment</button>
                            <input type="hidden" name="comment-id" value="${"INSERT_ID"}">
                        </form>
                        <div class="comment-section" id="cmnt-sec-${"INSERT_ID"}" style="display: none"></div>
                    </div>
                </div>
                </div>

    `

    form.insertAdjacentHTML('afterend', newPost);



}

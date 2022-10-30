// Save scroll position when reloading page.
window.addEventListener(
    "scroll",
    function () {
        localStorage.setItem("scrollPosition", window.scrollY);
    },
    false
);

// On load event
window.addEventListener(
    "load",
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

        // Handle nav bar.
        handleNav();
    }

);

window.onpopstate = function (event) {
    hidePages()
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
let loginBtn = document.getElementById("loginBtn")
let registerBtn = document.getElementById("registerBtn")


// Check url endpoint for each link that is clicked.
function handleNav() {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", checkLink)
    });
}


// Split URL to access last parameter.
let url = window.location.href.split("/");
function checkLink(event) {
    // update on each click
    event.preventDefault() // prevent page reload.
    hidePages(); // Hide all pages.
    showPage(this.dataset.name) // show specific page. I.e. Homepage, login, register. The page name is stored as data attribute in HTML thus this.dataset.name.
}

// Function to hide all pages. Needed when chosing any page.
function hidePages() {
    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
    });
}

// Show specific page based on name.
function showPage(name) {
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
        <div class="posts" id="post-${post.id}">
        <div class="usercat">
        <div>
        <h2><a href="" class="userpost">${post.username}</a></h2>
        </div>
        <div class="joincattop">
        <div class="typestyle">
        <h2 id="typestyle">Type: ${post.category_2}</h2>
        </div>
        <div class="catstyle">
        <h2 id="catstyle">Category: ${post.category}</h2>
        </div>
        </div>
        </div>
        <div class="postcontent">
        <em> ${post.content} </em>

        <div class="commentsContainer">
            <div class="commentbox">
                <form action="/" method="POST" class="comment-form" id="comment-form-${post.id}">
                    <textarea class="commenttxtbox" name="comment" id="comment-${post.id}" cols="30" rows="2"></textarea>
                    <button onclick="Comment(event)" class="commentbttn" name="submitComment" id="cmnt-btn-${post.id}">Comment</button>
                    <input type="hidden" name="comment-id" value="${post.id}">
                </form>
            </div>
            
            <a href="/" class="comment-link" id="cmnt-lnk-${post.id}">Comments</a>
            
            <div class="comment-section" id="cmnt-sec-${post.id}" style="display: none"></div>
        
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


    callBack();
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
        let textArea = document.getElementById(`comment-${slicedId}`)


        if (textArea.value != "") {
            // Create new div to put a new comment.
            let commentDiv = document.createElement("div")

            // Get current user.
            let username = document.getElementById("username")

            // Append username and comment.
            commentDiv.append(username.innerHTML + ": " + textArea.value)

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
        default:
            break;
    }
}

// NOTE: This function is called in the HTML.
function Comment(e) {
    let slicedId = e.target.id.slice(9, e.target.id.length);
    let textArea = document.getElementById(`comment-${slicedId}`);

    let username = document.getElementById("username")
    // Send the comment to API.
    sendJsonToBackend("comments", slicedId, textArea.value, username.innerText)

    // Open comment section
    OpenCommentSection()

}


// Add event listeners to elements added by ".innerHTML"
function eventListeners() {
    // HOW TO MAKE THIS DRY ?????????
    let comment_links = document.querySelectorAll(".comment-link")
    comment_links.forEach(element => {
        element.addEventListener("click", OpenCommentSection);
    });

    let comment_buttons = document.querySelectorAll(".commentbttn")
    comment_buttons.forEach(element => {
        element.addEventListener("click", OpenCommentSection);
    });
}


// Check if user is logged in.
function loggedIn() {
    return document.querySelector("#username") != null
}


// *************************************************************************
// Chat app front end


// Display chat app on bottom right of the screen
async function chatApp() {
    await fetchData("sessions");
    await fetchData("chats");
    let chatParent = document.createElement("div");
    let button = document.createElement("button");
    button.innerText = "Messenger";
    button.style.position = "fixed";
    button.style.bottom = "0px";
    button.style.right = "0px";
    chatParent.appendChild(button);

    button.addEventListener("click", () => {
        hidePages();
        showPage("messenger");
        button.style.display = "none"
    });
    document.querySelector("body").append(chatParent)

    showUsers()
}

chatApp();



let chatWindow = document.querySelector(".chatWindow");
let messengerPage = document.getElementById("messenger")
let chatScreen = document.createElement("div");
let chatForm = document.createElement("form");
let input = document.createElement("textarea");

// Show online users for chat app.
function showUsers() {

    sessions.forEach(session => {

        // Long bar with username to click on.
        let div = document.createElement("div")
        let currentUser = document.getElementById("username").innerText
        // Skip current user. Should not chat with yourself.
        if (session.username == currentUser) {
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

    // Append different components to chat window.

    // Style and append components
    chatWindowStyles();

    // Show other user on front end.
    document.querySelector("#friend").innerText = usersInChat[1]

    // Set correct id
    chatWindow.id = `window: ${id}`


    let sendMsgButton = document.createElement("button");
    sendMsgButton.innerText = "Send"

    chatForm.append(sendMsgButton)

    // sendMsgButton.addEventListener("click", (ev) => {
    //     ev.preventDefault()
    // })

    connectToChatserver(usersInChat);
    let title = document.createElement("h2");
    title.innerText = `Chat between ${usersInChat[0]} and ${usersInChat[1]}`
    chatWindow.append(title);

    // Auto focus message form.
    input.focus();

    sendJsonToBackend("chats", usersInChat[0], usersInChat[1])

}

function chatWindowStyles() {
    // Styling
    chatWindow.style.height = window.innerHeight / 1.4 + "px";
    chatWindow.style.display = "block";
    chatWindow.style.padding = "5px 20px 20px 20px"
    chatWindow.style.width = "50%";
    chatWindow.style.position = "absolute";
    chatWindow.style.filter = "drop-shadow(30px 10px 50px #AAAAAA)";

    // Create close chatbox button.
    let close = document.createElement("span");
    close.innerText = "X";
    close.style.position = "absolute";
    close.style.left = "99%"
    close.style.top = "-4%"
    close.style.cursor = "pointer";
    close.style.fontWeight = "bold";
    close.style.border = "2px solid black"
    close.style.borderRadius = "50%"
    close.addEventListener("click", () => {
        messengerPage.style.opacity = "1"
        messengerPage.style.pointerEvents = "auto";
        chatWindow.style.display = "none";
        leaveChat();
        return;
    })

    chatWindow.append(close)

    // Blur background page.
    messengerPage.style.opacity = "0.5"
    messengerPage.style.pointerEvents = "none";

    // Chat "screen"/box styles.
    chatScreen.style.width = "70%";
    chatScreen.style.height = "70%";
    chatScreen.style.backgroundColor = "white";
    chatScreen.style.border = "1px solid black";
    chatScreen.style.margin = "10px 10px 10px 0px";

    chatForm.id = "chatForm"


    // Append different components to chat window.
    chatWindow.append(chatScreen);
    chatForm.append(input);
    chatWindow.append(chatForm);


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
    chats.forEach((chat) => {
        if (chat.user1 == usersInChat[0]) {
            chatExists = true;
        }
    })

    // If chat between the two users already exists, connect to the one that already exists.
    if (chatExists === true) {
        wSocket = new WebSocket(ServiceLocation + usersInChat[1] + "~" + usersInChat[0]);
    } else {
        // Otherwise create a new one.
        wSocket = new WebSocket(ServiceLocation + usersInChat[0] + "~" + usersInChat[1]);

    }





    wSocket.addEventListener("message", (ev) => {
        OnMessageReceived(ev);
    })

}


chatForm.addEventListener("submit", (ev) => {
    ev.preventDefault()
    SendMessage()
})

function SendMessage() {
    var msg = '{"message":"' + input.value + '", "sender":"'
        + document.querySelector("#username").innerText + '", "received":""}';
    wSocket.send(msg);
    input.value = ""
}


function OnMessageReceived(evt) {
    var msg = JSON.parse(evt.data); // native API
    console.log(msg);

    let messageCointainer = document.createElement("div");
    let messageHTML = '<p>' + msg.sender + ':' + msg.message + '</p>';
    messageCointainer.innerHTML = messageHTML;

    chatScreen.append(messageCointainer);

}
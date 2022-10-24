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

// Global variables (arrays) to store api data.
var content = [];
var posts = [];
var comments = [];
var sessions = [];
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


var comment_sections = []
// Get posts and put them in the homepage.
let homepage = document.getElementById("homepage")
async function displayPosts(callBack) {
    await fetchData("allposts")
    await fetchData("comments")
    posts = posts.reverse();

    posts.forEach(post => {
        let postDiv = document.createElement('div')
        postDiv.className = "postDiv"
        homepage.appendChild(postDiv)

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

function OpenCommentSection(e) {

    e.preventDefault();
    console.log("Comment section with id:", `"${e.target.id}"`, "pressed");


    let slicedId = e.target.id.slice(9, e.target.id.length)

    // Display comment section
    let commentSection = document.getElementById(`cmnt-sec-${slicedId}`);


    if (commentSection.innerHTML != "" && !e.target.id.includes("btn")) {
        commentSection.innerHTML = "";
        commentSection.style.display = "none"
        document.querySelector(`#comment-${slicedId}`).value = "";
    } else if (e.target.id.includes("btn")) {
        document.querySelector(`#comment-${slicedId}`).value = "";
    } else {
        commentSection.style.display = "block";
        // Put comments into correct section.
        comments.forEach(comment => {
            let newComment = document.createElement("div");
            newComment.append(comment.username);
            newComment.append(comment.comment);

            // Display comments
            if (comment.post_ID == slicedId) {
                commentSection.append(newComment)
            }
        })
    }

}

// Send edited comment to views.
async function sendCommentToView(postId, cmnt, usr) {

    // Get api key
    let apiKey = await getApiKey()

    const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
            'Token': apiKey,

        },
        body: JSON.stringify({
            username: usr,
            comment: cmnt,
            post_ID: postId,
        }),
    });
}

// NOTE: This function is called in the HTML.
function Comment(e) {
    let slicedId = e.target.id.slice(9, e.target.id.length)
    let content = document.getElementById(`comment-${slicedId}`).value
    let cmntSect = document.getElementById(`cmnt-sec-${slicedId}`)

    let commentDiv = document.createElement("div")


    cmntSect.append(commentDiv)
    sendCommentToView(slicedId, content, document.querySelector("#username").innerText)
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


// Display chat app on bottom right of the screen
async function chatApp() {
    await fetchData("sessions");
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

// Show online users
function showUsers() {
    let messengerPage = document.getElementById("messenger")


    sessions.forEach(session => {

        let div = document.createElement("div")
        // Skip current user. Should not chat with yourself.
        if (session.username == document.getElementById("username").innerHTML) {
            return;
        }
        div.innerHTML = `
        <h2>${session.username}</h2>
        <em>Click to chat</em>
        `;
        div.style.border = "1px solid green";
        div.style.marginBottom = "5px";
        messengerPage.append(div);
    });

}


// Display comments from API in corresponding section.
function showComments() {

    console.log(comments)
}

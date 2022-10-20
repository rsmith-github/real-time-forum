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



var content = [];
var posts = [];
var comments = [];
var sessions = []
async function fetchData(name) {
    switch (name) {
        case "allposts":
            // Fetch posts
            posts = await fetch("/api/allposts")
            posts = await posts.json()
            break;
        case "comments":
            comments = await fetch("/api/comments")
            comments = await comments.json()
            break;
        case "sessions":
            sessions = await fetch("/api/sessions")
            sessions = await sessions.json()
            break;
        default:
            // Fetch html content for each page in the single page app.
            content = await fetch("/api/content")
            content = await content.json()

    }
}

// Nav bar
let loginBtn = document.getElementById("loginBtn")
let registerBtn = document.getElementById("registerBtn")

function handleNav() {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", checkLink)
    });
}


let url = window.location.href.split("/");
function checkLink(event) {
    // update on each click
    event.preventDefault()
    hidePages();
    showPage(this.dataset.name)
}

function hidePages() {
    document.querySelectorAll(".page").forEach(page => {
        page.style.display = "none";
    });
}

function showPage(name) {
    document.getElementById(name).style.display = "block";

    // Add to url history
    if (name == "homepage") {
        history.pushState({ name: name }, "", `${"/"}`);
        displayPosts(eventListeners);
    } else {
        //                                        ^
        history.pushState({ name: name }, "", `${name}`);
    }

    // Update url variable after updating client url.
    url = window.location.href.split("/");

    let page = document.getElementById(name)

    // Bool to avoid nested if statements
    let ok = false;
    if (content) ok = true;

    if (ok) {
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
        <h2><a href="#" class="userpost">${post.username}</a></h2>
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
            
            <div class="comment-section" id="cmnt-sec-${post.id}" style="display: none">-----------</div>
        
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
    document.getElementById(`cmnt-sec-${slicedId}`).style.display = "block"
}

// Send edited comment to views.
async function sendCommentToView(postId, cmnt, usr) {
    const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({
            username: usr,
            comment: cmnt,
            post_ID: postId,
        }),
    });
}

function Comment(e) {
    let slicedId = e.target.id.slice(9, e.target.id.length)
    let content = document.getElementById(`comment-${slicedId}`).value
    let cmntSect = document.getElementById(`cmnt-sec-${slicedId}`)

    let commentDiv = document.createElement("div")
    commentDiv.innerText = content

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


// // If user is logged in, display the chat box.
// function chatBox() {
//     let chatParent = document.createElement("div");
//     chatParent.style.border = "1px solid salmon"
//     chatParent.style.width = "35%"
//     chatParent.style.height = "100% !important"
//     chatParent.style.marginTop = "82px"

//     document.querySelector("main").append(chatParent)
// }

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

function showUsers() {
    let messengerPage = document.getElementById("messenger")

    sessions.forEach(session => {
        let div = document.createElement("div")
        div.innerHTML = `
        <h2>${session.username}</h2>
        <em>Click to chat</em>
        `
        div.style.border = "1px solid green"
        div.style.marginBottom = "5px"
        messengerPage.append(div)
    });
}
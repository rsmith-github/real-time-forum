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
            // return sessions
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


// Send JSON data to backend "views" in order to save to database.
async function sendJsonToBackend(endpoint, arg1, arg2, arg3, arg4) {

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
        case "register":
            await fetch(`/${endpoint}`, {
                method: "POST",
                headers: {
                    "X-CSRFToken": getCookie("csrftoken"),
                    'Token': apiKey,
                },
                body: JSON.stringify({
                    username: arg1,
                    email: arg2,
                    nickname: arg3,
                    password: arg4[0],
                    confirmation: arg4[1],
                }),
            });
            break;
        case "login":
            await fetch(`/${endpoint}`, {
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


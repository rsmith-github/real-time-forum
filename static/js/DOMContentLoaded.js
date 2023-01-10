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


// Keeping track of registered users.
let usersLength;


// On load event
document.addEventListener(
    "DOMContentLoaded",
    async function () {

        checkUnread();

        hidePages();
        // Show page based on url parameter.
        let endpoint = url[url.length - 1]
        if (endpoint == "") {
            endpoint = "homepage"
        }
        // Get content from api.
        await fetchData("content");
        await fetchData("sessions");
        await fetchData("allposts");


        console.log(endpoint);
        // Show page based on endpoint.
        showPage(endpoint);

        // Fix weird sectioning issue
        document.querySelector("html").style.height = window.innerHeight;

        // Handle nav bar.
        handleNav();

        // Particles.js
        Particles.init({
            selector: '.background',
            connectParticles: true,
            maxParticles: 60,
            color: "#FFFFFF"
        });

        // Animation end listener
        document.addEventListener("animationend", postSlideIn);

        // console.log("textarea: ", document.querySelector("textarea"));

        if (endpoint !== "login" && endpoint !== "register") await showUsers();



        if (endpoint !== "login" && endpoint !== "register") await showUsers();
    }

);


setInterval(async function () {
    //code goes here
    await fetchData("users")
    await fetchData("sessions")
    if (users.length > localStorage.getItem("lenRegisteredUsers")) {
        refreshChats.click()
        let newUser = users[users.length - 1]
        let currentusr = localStorage.getItem("username")
        if (currentusr !== newUser.username) {
            await sendJsonToBackend("chats", currentusr.toString(), newUser.username)
        }
        await connectForNotifications()
        localStorage.setItem("lenRegisteredUsers", users.length)
    }
    if (sessions.length !== Number(localStorage.getItem("lenSessions"))) {
        refreshChats.click()
        await connectForNotifications()
        localStorage.setItem("lenSessions", sessions.length)
    }
}, 2000); //Time before execution

window.onpopstate = function (event) {
    showPage(event.state.name)
}


// Check all messages 
function checkUnread() {
    messages.reverse()

    messages.forEach((message) => {
        if (message.reciever === localStorage.getItem("username")) {
            let chatToChangeColor = document.getElementById(`${message.receiver} + "<->" + ${message.sender}`);
            console.log("chatToChangeColor: ", chatToChangeColor);
            chatToChangeColor.style.backgroundColor = "green"
        }
    });

}
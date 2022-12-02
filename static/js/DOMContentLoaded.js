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
        await fetchData("sessions");

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
        await showUsers()


    }

);

window.onpopstate = function (event) {
    showPage(event.state.name)
}
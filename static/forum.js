// Save scroll position when reloading page.
window.addEventListener(
    "scroll",
    function () {
        localStorage.setItem("scrollPosition", window.scrollY);
    },
    false
);

window.addEventListener(
    "load",
    async function () {
        if (localStorage.getItem("scrollPosition") !== null) window.scrollTo(0, localStorage.getItem("scrollPosition"));
        // Show page based on url if reload. This should be the last line of code in most cases.
        let endpoint = url[url.length - 1]
        if (endpoint == "") {
            endpoint = "homepage"
        }
        await fetchContent();
        showPage(endpoint);
    }, false
);

window.onpopstate = function (event) {
    hidePages()
    showPage(event.state.name)
}



let content = [];
async function fetchContent() {
    content = await fetch("/api/content")
    content = await content.json()
}

// Nav bar
let loginBtn = document.getElementById("loginBtn")
let registerBtn = document.getElementById("registerBtn")

function handleNav() {
    document.querySelectorAll(".nav-link").forEach(link => {
        link.addEventListener("click", checkLink)
    });

}
handleNav();

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
    } else {
        //                                        ^
        history.pushState({ name: name }, "", `${name}`);
    }

    // Update url variable after updating client url.
    url = window.location.href.split("/");

    let page = document.getElementById(name)
    if (content) {
        content.forEach(object => {
            if (object.Endpoint == name) {
                page.innerHTML = object.Content
            }
        })
    }
}
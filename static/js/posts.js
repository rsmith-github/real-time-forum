

// New post without refresh. This function is called in the golang file. functions.LoadContent()
function newPost(event) {
    event.preventDefault()

    let content = document.querySelector("#newposttxt");
    if (content.value !== "") {
        // Make animation.
        let allPostsContainer = document.getElementById("posts-container");
        allPostsContainer.style.animation = "movedown 1s ease";
    } else {
        alert("This form cannot be empty. Type your post and try again!")
    }

}


// Function is called in DOMContentLoaded.js via: document.addEventListener("animationend", postSlideIn); event listener.
const postSlideIn = (e) => {

    let category_1 = document.querySelector('input[name="postType"]:checked');;
    // Get lanugage category
    let category_2 = document.getElementById("select-language");
    // Get content from textarea.
    let content = document.querySelector("#newposttxt");

    let allPostsContainer = document.getElementById("posts-container");
    if (e.target.id === allPostsContainer.id) {
        // Get latest id number and increment it.
        let id = Number(document.querySelector(".card").id.split("-")[1]) + 1

        // Create new parent element.
        let card = document.createElement("div");

        // Parent element attributes.
        card.classList.add("card");
        card.classList.add("gedf-card");
        card.style.marginTop = "20px";
        card.style.width = "32em"
        card.id = `post-${id}`


        // Save data to sqlite db.
        sendJsonToBackend("new", category_1.value.toString(), category_2.value.toString(), content.value.toString())


        // All the HTML for a new post.
        let newPost = `

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
                </div>

            </div>
            <div class="card-body">
                <p class="card-text">
                    ${removeTags(content.value)}
                </p>
                <p class="inlinecategory">
                <span class="bold">Post type: </span>${category_1.value}
                </p>
                &nbsp;
                <p class="inlinecategory">
                <span class="bold"> Category: </span>${category_2.value}
                </p>
                <div class="text-muted h7 mb-2"> <i class="fa fa-clock-o"></i>${"INSERT_TIME_POSTED"}</div>
            </div>
            <div class="card-footer">
                <a href="/" class="comment-link" id="cmnt-lnk-${id}"><i class="fa fa-comment"></i> Comments</a>
                <div class="commentbox">
                    <form action="/" method="POST" class="comment-form" id="comment-form-${id}">
                        <input type="text" class="commenttxtbox" name="comment" id="comment-${id}"/>
                        <button onclick="Comment(event)" class="commentbttn btn btn-outline-secondary" name="submitComment" id="cmnt-btn-${id}">Comment</button>
                        <input type="hidden" name="comment-id" value="${id}">
                    </form>
                    <div class="comment-section" id="cmnt-sec-${id}" style="display: none"></div>
                </div>
            </div>

        `

        // Insert HTML to parent div.
        card.innerHTML = newPost;


        // Add the new post to UI.
        allPostsContainer.prepend(card)

        // Empty textarea.
        content.value = ""

        // Animate adding the card.
        card.classList.add("movein")
    }

    // Reset animation for next event.
    allPostsContainer.style.animation = "none"
}
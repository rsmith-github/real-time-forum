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


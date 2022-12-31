
// Show posts on profile page.
function showMyPosts(cb) {
    let username = localStorage.getItem('username')

    if (posts.length === 0) {
        console.log("posts empty");
        return
    }
    posts.forEach(post => {
        if (post.username !== username) return;

        let postDiv = document.createElement('div');
        postDiv.className = "postDiv";
        let allPostsContainer = document.getElementById("profile-allposts");

        if (!!allPostsContainer) {
            allPostsContainer.appendChild(postDiv);
        }

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

    cb()

}
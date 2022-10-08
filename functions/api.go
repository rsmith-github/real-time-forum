package functions

import (
	"encoding/json"
	"log"
	"net/http"
)

func LoadContent(w http.ResponseWriter, r *http.Request) {

	loginContent := DOMcontent{
		Endpoint: "login",
		Content: `
		<h2 class="logintxt">Login</h2>
		<form action="/login" method="post" class="formall">
			<div class="form-group" id="user">
				<input autofocus class="user" type="text" name="username" placeholder="Username">
			</div>
			<div class="form-group" id="pass">
				<input class="pass" type="password" name="password" placeholder="Password">
			</div>
			<div class="form-group" id="submit">
				<input class="submit" type="submit" value="Login">
			</div>
			<div class="lowbanner">
				Don't have an account? <a class="reghere" href="/register"
					style="color: rgb(6, 86, 235); text-decoration:underline;">Register here.</a>
			</div>
		</form>
		</div> `,
	}
	registerContent := DOMcontent{
		Endpoint: "register",
		Content: `
		<div class="regform" id="form2">
		<h2 class="logintxt">Register</h2>
		<form action="/register" method="post" class="regall">
			<div class="formgroup" id="user">
				<input class="user" autofocus type="text" name="username" placeholder="Username">
			</div>
			<div class="formgroup" id="email">
				<input class="email" type="email" name="email" placeholder="Email Address">
			</div>
			<div class="formgroup" id="pass">
				<input class="pass" type="password" name="password" placeholder="Password">
			</div>
			<div class="formgroup" id="passconfirm">
				<input class="passconfirm" type="password" name="confirmation" placeholder="Confirm Password">
			</div>
			<div class="formgroup" id="register">
				<input class="register" type="submit" value="Register">
			</div>
			<div class="lowbanner">Already have an account? <a href="/login" style="color: rgb(6, 86, 235); text-decoration:underline;">Log In here.</a></div>
		</form>
		</div>`,
	}
	homePage := DOMcontent{
		Endpoint: "homepage",
		Content: `
		<div class="newpostbody">
        <form enctype="multipart/form-data" action="/new" method="POST" class="newpostall">
            <div class="newpost" id="newpost">
                <div class="radiospacing">
                    <label for="category_2">Question</label>
                    <input id="radios" type="radio" name="postType" id="category_2" value="Question" checked>
                    <label for="category_2">Resource</label>
                    <input id="radios" type="radio" name="postType" id="category_2" value="Resource">
                </div>
                <textarea class="newposttxt" id="newposttxt" name="new-post" contenteditable></textarea>
                <div class="catandpost">
                    <select class="categorydd" name="category" id="">
                        <option value="Golang">Golang</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Rust">Rust</option>
                    </select>
                    <input style="width: 172px;" type="file" name="file-upload"/>
                    <input id="postbttn" class="postbttn" type="submit" value="Post"/>
                </div>
            </div>
        </form>
    </div>
		`,
	}

	// Get user's cookie.
	_, er := r.Cookie("session")
	if er != nil {
		homePage.Content = "<h1>Please <a href='/login'>login</a></h1>"

	}

	var jsnList = []DOMcontent{loginContent, registerContent, homePage}
	var new, err = json.Marshal(jsnList)
	if err != nil {
		log.Fatal("Could not marshal:", err.Error())
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/text")
	w.Write(new)
}

func PostsApi(writer http.ResponseWriter, request *http.Request) {
	createApi("posts", writer, request)
}

// Use for client side user authentication.
func SessionsApi(writer http.ResponseWriter, request *http.Request) {
	createApi("sessions", writer, request)
}

func createApi(table string, writer http.ResponseWriter, request *http.Request) {
	if request.Method == "GET" {
		var listOfPosts map[string][]Post
		// Built query string.
		str := "SELECT * FROM " + table + ";"
		jsn := executeSQL(str)
		json.Unmarshal(jsn, &listOfPosts)
		writer.Write(jsn)
	}
}

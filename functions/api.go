package functions

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
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
                    <label for="category_1">Question</label>
                    <input type="radio" name="postType" id="category_1" value="Question" checked>
                    <label for="category_2">Resource</label>
                    <input type="radio" name="postType" id="category_2" value="Resource">
                </div>
                <textarea class="newposttxt" id="newposttxt" name="new-post" contenteditable></textarea>
                <div class="catandpost">
                    <select class="categorydd" name="category" id="">
                        <option value="Golang">Golang</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Rust">Rust</option>
                    </select>
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
		homePage.Content = `<h1>Please <a id="loginredirect" href="/login" data-name="login">login</a></h1>`
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

	if request.Method == "POST" {

	} else {

		createApi("posts", writer, request)
	}
}

// Use for client side user authentication.
func SessionsApi(writer http.ResponseWriter, request *http.Request) {
	createApi("sessions", writer, request)
}
func CommentsApi(writer http.ResponseWriter, request *http.Request) {

	if request.Method == "POST" {
		db := OpenDB()
		defer db.Close()
		var comment Comment
		decoder := json.NewDecoder(request.Body)
		err := decoder.Decode(&comment)
		if err != nil {
			fmt.Println(err)
		}

		// Prevent empty comments.
		blank := strings.TrimSpace(comment.Comment) == ""
		if blank == false {
			// Convert post ID to integer. It was initially string from javascript.
			var conv, err = strconv.Atoi(comment.Post_ID)
			if err != nil {
				fmt.Println("Could not convert Post_ID to integer")
			}
			var _, commentError = db.Exec(`INSERT INTO comments(username, comment, post_ID) values(?,?,?)`, comment.Username, comment.Comment, conv)
			if commentError != nil {
				fmt.Println(commentError.Error())
				CheckErr(commentError)
				// ReturnCode500(writer, request)
				return
			}
		}

	} else {
		createApi("comments", writer, request)
	}

}

func createApi(table string, writer http.ResponseWriter, request *http.Request) {
	if request.Method == "GET" {
		// var listOfApiData []interface{}
		// Built query string.
		str := "SELECT * FROM " + table + ";"
		jsn := ExecuteSQL(str)

		// // This is redundant.
		// er := json.Unmarshal(jsn, &listOfApiData)
		// if er != nil {
		// 	fmt.Println(er)
		// }
		// fmt.Println(listOfApiData)

		// Secure endpoint
		writer.Write(jsn)
	}
}

func ChatsApi(w http.ResponseWriter, r *http.Request) {
	if r.Method == "POST" {
		db := OpenDB()
		defer db.Close()
		var chat Chat
		decoder := json.NewDecoder(r.Body)
		err := decoder.Decode(&chat)
		if err != nil {
			fmt.Println("Around line 181 in api.go: ", err)
		}

		var _, delErr = db.Exec(`DELETE FROM chats WHERE user1=? AND user2=?`, chat.User1, chat.User2)

		if delErr != nil {
			fmt.Println(delErr.Error())
		}

		var _, chatError = db.Exec(`INSERT INTO chats(user1, user2) values(?,?)`, chat.User1, chat.User2)
		if chatError != nil {
			fmt.Println(chatError.Error())
			CheckErr(chatError)
			// ReturnCode500(writer, request)
			return
		}

		// Delete existing chats
		var _, chatError1 = db.Exec(`DELETE FROM chats WHERE user1=? AND user2=?`, chat.User2, chat.User1)
		if chatError1 != nil {
			fmt.Println(chatError1.Error())
			CheckErr(chatError1)
			// ReturnCode500(writer, request)
			return
		}
	} else {
		createApi("chats", w, r)
	}

}

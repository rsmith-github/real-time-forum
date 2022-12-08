package functions

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
)

func LoadContent(w http.ResponseWriter, r *http.Request) {

	loginContent := DOMcontent{
		Endpoint: "login",
		Content: `
		<div class="container">
		<div class="row vertical-offset-100">
			<div class="form-style col-md-4 col-md-offset-4">
				<div class="panel panel-default">
					<div class="panel-welcome">
						<h2 class="panel-welcome-title">Welcome to RTF</h2>
					</div>
					  <div class="panel-heading">
						<h3 class="panel-title">Log in</h3>
					 </div>
					  <div class="panel-body">
						<form accept-charset="UTF-8" action="/login" method="post" class="formall">
						<fieldset>
							  <div class="form-group" id="user">
							  <i class="login-icon fas fa-user"></i>
								<input autofocus class="form-control" id="username-input" placeholder="Username / Nickname" name="username" type="text">
							</div>
							<div class="form-group" id="pass">
							<i class="login-icon fas fa-lock"></i>
								<input class="form-control" id="password-input" placeholder="Password" name="password" type="password" value="">
							</div>
							<input id="loginBtn" class="btn btn-lg btn-success btn-block" type="button" value="Login">
							<div class="signup-div">
								<div class="signup-cta">Don't have an account?</div>
								<div class="signup-link"><a class="nav-link" data-name="register" id="signup-link" href="localhost:8080/register">Register here.</a></div>
							</div
						</fieldset>
						  </form>
					</div>
				</div>
			</div>
		</div>
	</div> 
	`,
	}
	registerContent := DOMcontent{
		Endpoint: "register",
		Content: `
		<div class="regform" id="form2">
		<div class="row vertical-offset-100">
			<div class="form-style col-md-4 col-md-offset-4">
				<div class="panel panel-default">
					<div class="panel-welcome">
						<h2 class="logintxt">Register</h2>
					</div>
					<div class="panel-heading">
						<h3 class="panel-title">Create your account</h3>
					</div>
					<div class="panel-body">
						<form action="/register" method="post" class="regall">
						<fieldset>
							<div class="formgroup" id="user">
								<i class="login-icon fas fa-user"></i>
								<input class="user form-control" autofocus type="text" name="username" placeholder="Username">
							</div>
							<div class="formgroup" id="email">
							<i class="login-icon fas fa-at"></i>
							<input class="email form-control" type="email" name="email" placeholder="Email Address">
							</div>
							<div class="formgroup secndpass" id="pass">
								<i class="login-icon fas fa-lock"></i>
								<input class="pass form-control" type="password" name="password" placeholder="Password">
							</div>
							<div class="formgroup" id="passconfirm">
								<i class="login-icon fas fa-check-double"></i>
								<input class="passconfirm form-control" type="password" name="confirmation" placeholder="Confirm Password">
							</div>
							<div class="formgroup" id="register">
								<input onclick="Register(event)" id="registerBtn" class="register btn" type="button" value="Register">
							</div>
							<div class="signup-div">
								<div class="signup-cta">Already have an account? <a class="nav-link" href="/login" id="signup-link">Log In here.</a></div>
							</div>
						</fieldset>
						</form>
					</div>
				</div>
			</div>
		</div>
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
                    <select class="categorydd btn btn-secondary dropdown-toggle" name="category" id="select-language">
                        <option value="Golang">Golang</option>
                        <option value="JavaScript">JavaScript</option>
                        <option value="Rust">Rust</option>
                    </select>
                    <input onclick="newPost(event)" id="postbttn" class="postbttn btn btn-primary" type="submit" value="Post"/>
                </div>
            </div>
        </form>
    </div>
	<div id="posts-container"></div>
		`,
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

		// var _, delErr = db.Exec(`DELETE FROM chats WHERE user1=? AND user2=?`, chat.User1, chat.User2)

		// if delErr != nil {
		// 	fmt.Println(delErr.Error())
		// }

		// Only insert if chat doesn't already exist.

		// Get all chats from database. They would have been updated through fetch API with http POST.
		var chatsBytes []byte
		chatsBytes = ExecuteSQL("SELECT * FROM chats;")

		// Unmarshal data from database.
		var readable []map[string]string
		json.Unmarshal(chatsBytes, &readable)

		var listOfStrings []string
		// Loop through list of objects and return a new list with format user1~user2 for each element.
		for _, obj := range readable {
			listOfStrings = append(listOfStrings, obj["user1"]+"~"+obj["user2"])
		}

		// Check if room already exists.
		flag := 0
		for _, el := range listOfStrings {
			if strings.Index(el, chat.User1) != -1 && strings.Index(el, chat.User2) != -1 {
				flag = 1
			}
		}

		// If room does not exist, create it.
		if flag == 0 {
			var _, chatError = db.Exec(`INSERT INTO chats(user1, user2) values(?,?)`, chat.User1, chat.User2)
			if chatError != nil {
				fmt.Println(chatError.Error())
				CheckErr(chatError)
				// ReturnCode500(writer, request)
				return
			}
		}

	} else {
		createApi("chats", w, r)
	}

}

// Handle logins.
func UsersApi(w http.ResponseWriter, r *http.Request) {

	if r.Method == "POST" {

		db := OpenDB()
		defer db.Close()
		var userToValidate User
		decoder := json.NewDecoder(r.Body)
		err := decoder.Decode(&userToValidate)
		if err != nil {
			fmt.Println(err)
		}

		// If user exists, log them in.
		// Keep track of what was found from the above query (The JSON received once user clicks login button).
		foundId := 0
		foundUser := ""
		foundHash := ""
		// Get all the data from one user.
		rows, err := db.Query("SELECT * FROM users WHERE username=?", userToValidate.Username)
		CheckErr(err)

		usr := QueryUser(rows, err)
		foundId = usr.id
		foundUser = usr.Username
		foundHash = usr.Password
		// foundUser = usr.Username

		// Delete expired cookie based on valid username posted from form.
		// Only relevant if user has been automatically logged out.
		db.Exec("DELETE FROM sessions WHERE userID=?", foundId)

		// Compare password hash to password input by user.
		pwCompareError := bcrypt.CompareHashAndPassword([]byte(foundHash), []byte(userToValidate.Password))

		// If user details exist, give user a session.
		if userToValidate.Username == foundUser && pwCompareError == nil {

			// Check if session cookie exists. If not, create one, and give the user a session.
			cookie, err := r.Cookie("session")
			if err != nil {
				id := uuid.NewV4()
				cookie = &http.Cookie{
					Name:     "session",
					Value:    id.String(),
					HttpOnly: true,
					Path:     "/",
					MaxAge:   60 * 60,
				}
				http.SetCookie(w, cookie)
			}

			db := OpenDB()
			_, err2 := db.Exec("INSERT INTO sessions(sessionUUID, userID, username) values(?,?,?)", cookie.Value, foundId, foundUser)

			createApi("users", w, r)

			CheckErr(err2)
			defer db.Close()
		}

	} /* else {

		createApi("users", w, r)
	}*/
}

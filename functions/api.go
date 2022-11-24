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
		<div class="container">
		<div class="row vertical-offset-100">
			<div class="col-md-4 col-md-offset-4">
				<div class="panel panel-default">
					  <div class="panel-heading">
						<h3 class="panel-title">Please sign in</h3>
					 </div>
					  <div class="panel-body">
						<form id="login-form" accept-charset="UTF-8" action="/login" method="post" class="formall">
						<fieldset>
							  <div class="form-group" id="user">
								<input autofocus class="form-control" id="username-input" placeholder="Username / Nickname" name="username" type="text">
							</div>
							<div class="form-group" id="pass">
								<input class="form-control" id="password-input" placeholder="Password" name="password" type="password" value="">
							</div>
							<input id="loginBtn" class="btn btn-lg btn-success btn-block" type="button" onclick="Login(event)" value="Login">
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
		<h2 class="logintxt">Register</h2>
		<form action="/register" method="post" class="regall">
			<div class="formgroup" id="user">
				<input id="reg-username" class="form-control" autofocus type="text" name="username" placeholder="Username">
			</div>
			<div class="formgroup" id="email">
				<input id="reg-email" class="form-control" type="email" name="email" placeholder="Email Address">
			</div>
			<div class="formgroup" id="nick">
				<input id="reg-nickname" class="form-control" type="text" name="nickname" placeholder="Nickname">
			</div>
			<div class="formgroup" id="pass">
				<input id="reg-password" class="form-control" type="password" name="password" placeholder="Password">
			</div>
			<div class="formgroup" id="passconfirm">
				<input id="reg-confirmation" class="form-control" type="password" name="confirmation" placeholder="Confirm Password">
			</div>
			<div class="formgroup" id="register">
				<input  onclick="Register(event)" id="registerBtn" class="btn btn-lg btn-success btn-block" type="button" value="Register">
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
				CheckErr(commentError, "-------Line 148 api.go")
				// ReturnCode500(writer, request)
				return
			}
		}

	} else {
		createApi("comments", writer, request)
	}

}

func createApi(table string, writer http.ResponseWriter, request *http.Request) {
	// if request.Method == "GET" {
	// var listOfApiData []interface{}
	// Built query string.
	str := "SELECT * FROM " + table + ";"
	jsn := ExecuteSQL(str)

	// Secure endpoint
	writer.Write(jsn)
	// }
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
			users := strings.Split(el, "~")
			if users[0] == chat.User1 && users[1] == chat.User2 || users[0] == chat.User2 && users[1] == chat.User1 {
				flag = 1
			}
		}
		fmt.Printf("\n")

		fmt.Println("flag: ", flag)

		// If room does not exist, create it.
		if flag == 0 {
			var _, chatError = db.Exec(`INSERT INTO chats(user1, user2) values(?,?)`, chat.User1, chat.User2)
			if chatError != nil {
				fmt.Println(chatError.Error())
				CheckErr(chatError, "-------Line 218 api.go")
				// ReturnCode500(writer, request)
				return
			}
		}

	} else {
		createApi("chats", w, r)
	}

}

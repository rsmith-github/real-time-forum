package functions

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
)

func IndexHandler(w http.ResponseWriter, r *http.Request) {
	CreateSqlTables()

	c, er := r.Cookie("session")
	if er != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	} else {
		// Multiple browser login issue.
		db := OpenDB()

		// Try to find old session from database.
		rows, _ := db.Query("SELECT * FROM sessions WHERE sessionUUID=?", c.Value)
		var id int
		var sessionUUID, userID, usernm string

		// Scan the row.
		for rows.Next() {
			rows.Scan(&id, &sessionUUID, &userID, &usernm)
		}
		// If session was not found in the database, log the user out from the browser.
		if len(sessionUUID) < 1 {
			http.Redirect(w, r, "/logout", http.StatusSeeOther)
		}
	}
	usr := GetCurrentUser(w, r, c)
	RenderTemplate(w, r, GetTemplates(), "index", usr)
	return
}

// Register page
func RegisterHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/register" {
		http.NotFound(w, r)
		return
	}

	// Set initialize message.
	message := ""
	// If post request, get the users details and save it to the database.
	if r.Method == "POST" {

		// Get the user based off of the users input.
		newUser := GetUser(r)
		// Check if password form value matches confirmation form value.
		if newUser.Password == "" || newUser.Username == "" || newUser.Email == "" {
			message = "Please fill in all forms."
		} else if newUser.Password == r.FormValue("confirmation") && message != "Please fill in all forms." {

			// Create new user, checkking for error.
			err := CreateUser(newUser)

			// If theres an error, display it.
			if err != nil {
				// http.Error(w, err.Error(), http.StatusInternalServerError)
				message = "This username or email already exists."
			} else {
				message = "Registered successfully!"
			}
		} else {
			message = "These passwords do not match."
		}

	}
	// Slice containing all template names.
	RenderTemplate(w, r, GetTemplates(), "index", nil)
}

// Login page
func LoginHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/login" {
		http.NotFound(w, r)
		return
	}

	// Slice with all template files

	// message := ""

	if r.Method == "POST" {
		userToValidate := GetUser(r)
		// If user exists, save the session ID and their user ID in the sessions table.
		db := OpenDB()
		defer db.Close()

		// Keep track of what was found from the above query.
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
		foundUser = usr.Username

		// Delete expired cookie based on valid username posted from form.
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
					MaxAge:   60 * 20,
				}
				http.SetCookie(w, cookie)
			}

			db := OpenDB()
			_, err2 := db.Exec("INSERT INTO sessions(sessionUUID, userID, username) values(?,?,?)", cookie.Value, foundId, foundUser)
			CheckErr(err2)
			defer db.Close()
			// r.SetBasicAuth(foundUser, foundHash)
			// http.Redirect(w, r, "/", http.StatusSeeOther)
		} else {
			// message = "User details invalid."
		}

	}

	// If user's cookie expires, delete the cookie from the database.
	// Del_C_If_Exp(cookie)
	// Render template if get request.

	RenderTemplate(w, r, GetTemplates(), "index", nil)

}

func LogoutHandler(w http.ResponseWriter, r *http.Request) {

	// Prevent logout function to be called on other urls.
	// if r.URL.Path != "/logout" {
	// 	http.NotFound(w, r)
	// 	return
	// }

	c, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return
	}

	// Open database.
	db := OpenDB()

	// delete session from sessions table.
	db.Exec("DELETE FROM sessions WHERE sessionUUID=?;", c.Value)

	defer db.Close()
	// delete cookie from browser.
	c.MaxAge = -1
	http.SetCookie(w, c)

	// redirect to login page.
	http.Redirect(w, r, "/login", http.StatusSeeOther)
}

// Handle new posts.
func NewPost(w http.ResponseWriter, r *http.Request) {

	// If new post submitted,
	if r.Method == "POST" {
		// Get user's cookie.
		c, err := r.Cookie("session")
		if err != nil {
			http.Redirect(w, r, "/login", http.StatusSeeOther)
			return
		}

		// Check current user based off sessionUUID.
		currentUser := GetCurrentUser(w, r, c)

		// Get data from fetch api post request and store it in post struct.
		postFromJson := Post{}
		decoder := json.NewDecoder(r.Body)
		postErr := decoder.Decode(&postFromJson)
		if postErr != nil {
			fmt.Println(err)
		}

		fmt.Println(postFromJson.Content)

		if postErr != nil {
			fmt.Println("error: ", postErr.Error())
		}

		// Get all of the post's info.
		userId := currentUser.id
		userName := currentUser.Username

		// Prevent empty posts.
		blank := strings.TrimSpace(postFromJson.Content) == ""
		if blank == false {
			db := OpenDB()
			db.Exec("INSERT INTO posts(user_ID, username, content, time_posted, category, category_2) values(?,?,?,datetime('now','localtime'),?,?)", userId, userName, postFromJson.Content, postFromJson.Category_1, postFromJson.Category_2)
			db.Close()

		}
	}

	// Redirect to index.
	http.Redirect(w, r, "/", http.StatusSeeOther)
}

package functions

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"net/http"

	"golang.org/x/crypto/bcrypt"
)

// Custom function to save space and not have to copy paste code multiple times.
// Accepts w, r, and a list of the templates, the name of the required template, and specific data.
func RenderTemplate(w http.ResponseWriter, r *http.Request, files []string, templateName string, data interface{}) {

	// Read the files and store the templates in a template set.
	tmpltSet, err := template.ParseFiles(files...)
	if err != nil {
		log.Println(err.Error())
		http.Error(w, "Internal Server Error", 500)
		return
	}
	// Use the ExecuteTemplate() method to write the content of the "base"
	// template as the response body.
	err = tmpltSet.ExecuteTemplate(w, templateName, data)
	if err != nil {
		log.Println(err.Error())
		http.Error(w, "Internal Server Error", 500)
	}

}

func GetTemplates() []string {

	// Slice containing all template names.
	files := []string{}
	folder, _ := ioutil.ReadDir("templates")
	for _, subitem := range folder {
		files = append(files, "./templates/"+subitem.Name())
	}
	return files
}

// Get user info from forms.
func GetUser(r *http.Request) User {

	db := OpenDB()
	defer db.Close()
	var userToRegister User
	decoder := json.NewDecoder(r.Body)
	err := decoder.Decode(&userToRegister)
	if err != nil {
		fmt.Println(err)
	}

	return userToRegister
}

// Gets the current user based off of session UUID.
func GetCurrentUser(w http.ResponseWriter, r *http.Request, c *http.Cookie) User {
	db := OpenDB()
	defer db.Close()

	// Query sessions table for specific UUID
	rows, err := db.Query("SELECT * FROM sessions WHERE sessionUUID=?;", c.Value)
	sess := QuerySession(rows, err)
	rows.Close() //good habit to close

	// If the sessionUUID is not the same, redirect. Return value could be null, or other.
	// Could be an error here.
	// if sess.sessionUUID != c.Value {

	// 	fmt.Println("error: helper.go line 72. Honestly not even an error.")
	// http.Redirect(w, r, "/", http.StatusSeeOther)
	// }

	// Get current user username.
	rows2, err2 := db.Query("SELECT * FROM users WHERE id=?;", sess.userID)
	currentUserData := QueryUser(rows2, err2)

	rows.Close() //good habit to close
	return currentUserData
}

func CreateUser(newUser User) error {

	// Get password hash.
	passwordHash, err := getPasswordHash(newUser.Password)
	if err != nil {
		return err
	}
	CheckErr(err, "-------LINE 95")

	// Create the authenticated user with password hash.
	newAuthUser := authUser{
		username:     newUser.Username,
		email:        newUser.Email,
		nickname:     newUser.Nickname,
		age:          newUser.Age,
		passwordHash: passwordHash,
	}
	db := OpenDB()

	// Try to insert user into database.
	_, err2 := db.Exec("INSERT INTO users(username, email, nickname, age, password, superuser) values(?,?,?,?,?,?)", newAuthUser.username, newAuthUser.email, newAuthUser.nickname, newAuthUser.age, newAuthUser.passwordHash, 0)
	CheckErr(err2, "-------LINE 108")
	if err2 != nil {
		return err2
	}
	defer db.Close()

	return nil
}

func getPasswordHash(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 0)

	return string(hash), err
}

func CheckErr(err error, line string) {
	if err != nil {
		fmt.Print(line)
		fmt.Println(err.Error())
		log.SetFlags(log.LstdFlags | log.Lshortfile)
	}
}

func QuerySession(rows *sql.Rows, err error) Session {
	// Variables for line after for rows.Next()
	var id int
	var sessionID, userID, username string

	var sess Session
	// Scan all the data from that row.
	for rows.Next() {
		err = rows.Scan(&id, &sessionID, &userID, &username)
		temp := Session{
			sessionUUID: *&sessionID,
			userID:      *&userID,
			username:    *&username,
		}
		// currentUser = &username
		CheckErr(err, "-------LINE 146")
		sess = temp
	}
	rows.Close() //good habit to close
	return sess
}

func QueryUser(rows *sql.Rows, err error) User {
	// Variables for line after for rows.Next() (8 lines from this line.)
	var id int
	var username string
	var email string
	var nickname string
	var password string
	var superuser int
	var age int

	var usr User
	// Scan all the data from that row.
	for rows.Next() {
		err = rows.Scan(&id, &username, &email, &nickname, &age, &password, &superuser)
		temp := User{
			id:        id,
			Username:  username,
			Email:     email,
			Nickname:  nickname,
			Age:       age,
			Password:  password,
			Superuser: superuser,
		}
		// currentUser = &username
		CheckErr(err, "-------LINE 175")
		usr = temp
	}
	rows.Close() //good habit to close
	return usr
}

// Check session and query posts. Return current user and data to render in template.
func CheckSessionQueryPosts(w http.ResponseWriter, r *http.Request) (map[string]interface{}, []string) {
	// Get user's cookie.
	c, err := r.Cookie("session")
	if err != nil {
		http.Redirect(w, r, "/login", http.StatusSeeOther)
		return nil, nil
	}

	// Check current user based off sessionUUID.
	currentUser := GetCurrentUser(w, r, c)

	db := OpenDB()
	defer db.Close()

	// Slice containing all template names.
	files := GetTemplates()

	// Declare variables to use below.
	var rows *sql.Rows

	data := make(map[string]interface{})
	var posts []map[string]interface{}

	// If index page, get all posts from all users.
	if r.URL.Path == "/" {
		rows, err = db.Query(`SELECT * FROM posts ORDER BY id DESC;`)
		CheckErr(err, "-------LINE 209")
		// Get all posts.
		posts = GetAllPosts(rows, err)
	}

	// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
	// This code could be stored in an api.

	// If Categories page, get all posts from selected category.
	if r.URL.Path == "/categories" && r.Method == "POST" {

		// Loop over choices.
		choices := []string{"Go", "JavaScript", "Rust"}
		var selectedCat string
		for _, category := range choices {
			selectedCat = r.FormValue(category)
			if selectedCat != "" {
				break
			}
		}
		if r.FormValue("category-1") != "" {
			selectedCat = r.FormValue("category-1")
		}

		rows, err = db.Query(`SELECT * FROM posts where category=? ORDER BY id DESC;`, selectedCat)
		CheckErr(err, "-------LINE 234")
		// Get all posts.
		posts = GetAllPosts(rows, err)
	}
	// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

	// Return current user and posts data.
	data = map[string]interface{}{
		"Username": currentUser.Username,
		"Posts":    posts,
	}
	return data, files
}

func CheckAdmin(writer http.ResponseWriter, request *http.Request) bool {
	c, err := request.Cookie("session")
	if err != nil {
		http.Redirect(writer, request, "/login", http.StatusSeeOther)
		return false
	}
	// Get current user. If user is not admin, i.e. superuser, return access denied.
	var user User = GetCurrentUser(writer, request, c)

	// If user is not admin, return access denied.
	return user.Superuser == 1
}

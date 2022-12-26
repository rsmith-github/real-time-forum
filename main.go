package main

import (
	"fmt"
	"log"
	"net/http"
	"real-time-forum/chat"
	"real-time-forum/functions"
	"time"

	"github.com/dgrijalva/jwt-go"
)

// Should be env variable not hard coded.
var SECRET = []byte("super-secret-auth-key")
var api_key = "1234"

func CreateJWT() (string, error) {

	token := jwt.New(jwt.SigningMethodHS256)

	claims := token.Claims.(jwt.MapClaims)

	claims["exp"] = time.Now().Add(time.Hour).Unix()

	tokenStr, err := token.SignedString(SECRET)

	if err != nil {
		fmt.Println(err.Error())
		return "", err
	}

	return tokenStr, nil
}

func ValidateJWT(next func(w http.ResponseWriter, r *http.Request)) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		if r.Header["Token"] != nil {
			token, err := jwt.Parse(r.Header["Token"][0], func(t *jwt.Token) (interface{}, error) {
				_, ok := t.Method.(*jwt.SigningMethodHMAC)
				if !ok {
					w.WriteHeader(http.StatusUnauthorized)
					w.Write([]byte("not authorized"))
				}
				return SECRET, nil
			})

			if err != nil {
				w.WriteHeader(http.StatusUnauthorized)
				w.Write([]byte("not authorized: " + err.Error()))
			}

			if token.Valid {
				next(w, r)
			}
		} else {
			w.WriteHeader(http.StatusUnauthorized)
			w.Write([]byte("not authorized"))
		}
	})
}

func GetJwt(w http.ResponseWriter, r *http.Request) {
	if r.Header["Access"] != nil {
		if r.Header["Access"][0] != api_key {
			return
		} else {
			token, err := CreateJWT()
			if err != nil {
				return
			}
			fmt.Fprint(w, token)
		}
	}
}

func main() {
	// Create tabless
	functions.CreateSqlTables()

	// Endpoint handlers
	http.HandleFunc("/", functions.IndexHandler)
	http.HandleFunc("/login", functions.LoginHandler)
	http.HandleFunc("/logout", functions.LogoutHandler)
	http.HandleFunc("/register", functions.RegisterHandler)
	http.HandleFunc("/new", functions.NewPost)
	http.HandleFunc("/api/users", functions.UsersApi)
	http.HandleFunc("/api/chats", functions.ChatsApi)
	http.Handle("/api/allposts", ValidateJWT(functions.PostsApi))
	http.HandleFunc("/api/sessions", functions.SessionsApi)
	http.Handle("/api/comments", ValidateJWT(functions.CommentsApi))
	http.HandleFunc("/jwt", GetJwt)

	// Api endpoints
	http.HandleFunc("/api/content", functions.LoadContent)
	http.HandleFunc("/api/messages", functions.MessagesApi)

	// Serve files within static and images.
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir("images"))))

	// run chat app
	go chat.RunRoutine()

	fmt.Printf("Starting server at http://localhost:8080\n")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

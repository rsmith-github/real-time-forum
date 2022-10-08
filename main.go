package main

import (
	"fmt"
	"log"
	"net/http"
	"real-time-forum/functions"
)

func main() {

	// Endpoint handlers
	http.HandleFunc("/", functions.IndexHandler)
	http.HandleFunc("/login", functions.LoginHandler)
	http.HandleFunc("/logout", functions.LogoutHandler)
	http.HandleFunc("/register", functions.RegisterHandler)
	http.HandleFunc("/new", functions.NewPost)
	http.HandleFunc("/api/allposts", functions.PostsApi)
	http.HandleFunc("/api/sessions", functions.SessionsApi)

	// Api endpoints
	http.HandleFunc("/api/content", functions.LoadContent)

	// Serve files within static and images.
	http.Handle("/static/", http.StripPrefix("/static/", http.FileServer(http.Dir("static"))))
	http.Handle("/images/", http.StripPrefix("/images/", http.FileServer(http.Dir("images"))))

	fmt.Printf("Starting server at http://localhost:8080\n")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatal(err)
	}
}

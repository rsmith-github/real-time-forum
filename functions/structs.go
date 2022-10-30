package functions

import "database/sql"

type User struct {
	id        int
	Username  string
	Email     string
	Password  string
	Superuser int
}

type authUser struct {
	username     string
	email        string
	passwordHash string
}

type Session struct {
	sessionUUID string
	userID      string
	username    string
}

type Post struct {
	id          int
	userID      string
	username    string
	content     string
	time_posted string
	likes_count int
}

type Comment struct {
	// Id       int    `json:"id"`
	Username string `json:"username"`
	Comment  string `json:"comment"`
	Post_ID  string `json:"post_ID"`
}

type DOMcontent struct {
	Endpoint string
	Content  string
}

type Database struct {
	db *sql.DB
}

type Chat struct {
	User1 string `json:"user1"`
	User2 string `json:"user2"`
}

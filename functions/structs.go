package functions

import "database/sql"

type User struct {
	id        int    `json:"id"`
	Username  string `json:"username"`
	Email     string `json:"email"`
	Nickname  string `json:"nickname"`
	Age       int    `json:"age"`
	Password  string `json:"password"`
	Superuser int    `json:"superuser"`
}

type authUser struct {
	username     string
	email        string
	nickname     string
	age          int
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
	Content     string `json:"content"`
	Category_1  string `json:"category_1"`
	Category_2  string `json:"category_2"`
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

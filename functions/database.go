package functions

import (
	"database/sql"
	"encoding/json"
	"log"

	_ "github.com/mattn/go-sqlite3"
)

func OpenDB() *sql.DB {
	db, err := sql.Open("sqlite3", "forum.db")
	if err != nil {
		log.Fatal(err)
	}
	// defer db.Close()
	return db

}

func CreateSqlTables() {
	// Initialize database.
	db := OpenDB()
	// Create user table if it doen't exist.
	var _, usrTblErr = db.Exec("CREATE TABLE IF NOT EXISTS `users` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `username` VARCHAR(64) NULL UNIQUE, `email` VARCHAR(64) NOT NULL UNIQUE, `nickname` VARCHAR(64) NOT NULL UNIQUE, `password` VARCHAR(255) NOT NULL, `superuser` INTEGER NOT NULL)")
	CheckErr(usrTblErr, "-------Error creating table")

	// Create sessions table if doesn't exist.
	var _, sessTblErr = db.Exec("CREATE TABLE IF NOT EXISTS `sessions` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `sessionUUID` VARCHAR(255) NOT NULL UNIQUE, `userID` VARCHAR(64) NOT NULL UNIQUE, `username` VARCHAR(255) NOT NULL UNIQUE)")
	CheckErr(sessTblErr, "-------Error creating table")

	// Create sessions table if doesn't exist.
	var _, chatsTblErr = db.Exec("CREATE TABLE IF NOT EXISTS `chats` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `user1` VARCHAR(255) NOT NULL, `user2` VARCHAR(255) NOT NULL)")
	CheckErr(chatsTblErr, "-------Error creating table")

	// Create posts table if doesn't exist.
	var _, postTblErr = db.Exec("CREATE TABLE IF NOT EXISTS `posts` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `user_ID` VARCHAR(64) NOT NULL, `username` VARCHAR(64) NOT NULL, `content` TEXT NOT NULL, `time_posted` TEXT NOT NULL, `category` VARCHAR(64), `category_2` VARCHAR(64))")
	CheckErr(postTblErr, "-------Error creating table")

	// Create comments table if not exists
	var _, commentError = db.Exec("CREATE TABLE IF NOT EXISTS `comments` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `username` VARCHAR(64), `comment` TEXT NOT NULL, `post_ID` INTEGER NOT NULL )")
	CheckErr(commentError, "-------Error creating table")

	db.Close()
}

func GetAllPosts(rows *sql.Rows, err error) []map[string]interface{} {
	// Variables for line after for rows.Next(), based on 'posts' table column names.
	var id int
	var user_ID, username, content, time_posted string
	var category, category_2 interface{}

	var posts []map[string]interface{}
	// Scan all the data from that row.
	for rows.Next() {
		err = rows.Scan(&id, &user_ID, &username, &content, &time_posted, &category, &category_2)
		posts = append(posts, map[string]interface{}{
			// Words in double quote are the keys.
			"postID":      id,
			"userID":      user_ID,
			"username":    username,
			"content":     content,
			"time_posted": time_posted,
			"category":    category,
			"category_2":  category_2,
		})
		// currentUser = &username
		CheckErr(err, "-------Line 68 database.go")
	}
	rows.Close() //good habit to close

	return posts
}

// Function that queryies database and returns list of bytes to unmarshal.
func ExecuteSQL(queryStr string) []byte {
	db := OpenDB()
	defer db.Close()

	rows, err := db.Query(queryStr)
	if err != nil {
		log.Fatal("Query failed:", err.Error())
	}
	defer rows.Close()

	columns, _ := rows.Columns()
	count := len(columns)

	var v struct {
		Data []interface{} // `json:"data"`
	}

	for rows.Next() {
		values := make([]interface{}, count)
		valuePtrs := make([]interface{}, count)
		for i := range columns {
			valuePtrs[i] = &values[i]
		}
		if err := rows.Scan(valuePtrs...); err != nil {
			log.Fatal(err)
		}

		//Created a map to handle the issue
		var m map[string]interface{}
		m = make(map[string]interface{})
		for i := range columns {
			m[columns[i]] = values[i]
		}
		v.Data = append(v.Data, m)
	}

	// Put into list.
	data := v.Data
	jsonMsg, err := json.Marshal(data)
	return jsonMsg
}

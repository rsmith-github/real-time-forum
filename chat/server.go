package chat

import (
	"encoding/json"
	"net/http"
	"real-time-forum/functions"
)

// Get all possible rooms in from database.
func RunRoutine() {

	// Open database.
	db := functions.OpenDB()
	defer db.Close()

	// Solving error "panic: http: multiple registrations for /chat/123~kanye-west"
	registered := map[string]string{}

	// Get all chats from database. They would have been updated through fetch API with http POST.
	var listOfBytes []byte

	// Concurrently check for rooms that exist in database.
	for {

		listOfBytes = functions.ExecuteSQL("SELECT * FROM chats;")

		// Unmarshal data from database.
		var readableList []map[string]string
		json.Unmarshal(listOfBytes, &readableList)

		var listOfStrings []string
		// Loop through list of objects and return a new list with format user1~user2 for each element.
		for _, obj := range readableList {
			listOfStrings = append(listOfStrings, obj["user1"]+"~"+obj["user2"])
		}

		// Don't need to be calling so many times
		// time.Sleep(1 * time.Second)

		// fmt.Println(listOfStrings)
		for _, name := range listOfStrings {

			room := NewRoom(name)

			// Checking reverse order.

			// for k, v := range registered {
			// 	fmt.Println(k, v)
			// }

			// If not registered, append to map and register.
			if _, ok := registered[name]; !ok {
				registered[name] = room.topic
				http.Handle("/chat/"+name, room)
				go room.Run()
			}

		}
	}

}

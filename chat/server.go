package chat

import (
	"encoding/json"
	"net/http"
	"real-time-forum/functions"
	"time"
)

// Run starts a new chat server with 4 chat rooms, listening on port 8080
func Run() {
	// nums := make(chan int) // Declare a unbuffered channel
	// wg.Add(1)
	// go responseSize("https://www.golangprograms.com", nums)
	// fmt.Println(<-nums) // Read the value from unbuffered channel
	// wg.Wait()
	// close(nums) // Closes the channel
	// rooms := make(chan []string)
	// for _, name := range <-rooms {

	// 	room := NewRoom(name)

	// 	http.Handle("/chat/"+name, room)

	// 	go room.Run()
	// }
}

// Get all possible rooms in from database.
func RunRoutine() {

	// Open database.
	db := functions.OpenDB()
	defer db.Close()

	// Solving error "panic: http: multiple registrations for /chat/123~kanye-west"
	registered := map[string]string{}
	for {

		// Get all chats from database. They would have been updated through fetch API with http POST.
		var listOfBytes []byte
		listOfBytes = functions.ExecuteSQL("SELECT * FROM chats;")

		// Unmarshal data from database.
		var readableList []map[string]string
		json.Unmarshal(listOfBytes, &readableList)

		var listOfStrings []string
		// Loop through list of objects and return a new list with format user1~user2 for each element.
		for _, obj := range readableList {
			listOfStrings = append(listOfStrings, obj["user1"]+"~"+obj["user2"])
		}

		// Don't need to be calling so many times.
		time.Sleep(1 * time.Second)
		// fmt.Println(listOfStrings)
		for _, name := range listOfStrings {

			room := NewRoom(name)

			// If not registered, append to map and register.
			_, ok := registered[name]

			if !ok {
				registered[name] = room.topic
				http.Handle("/chat/"+name, room)
				go room.Run()
			}

		}
	}

}

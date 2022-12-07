package chat

import (
	"fmt"
	"log"
	"net/http"
	"real-time-forum/functions"

	"github.com/gorilla/websocket"
)

const (
	socketBufferSize  = 1024
	messageBufferSize = 256
)

// Room represents a single chat room
type Room struct {
	// forward is a channel that holds incoming messages
	// that should be forwarded to the other clients.
	// forward channel is used to send incoming messages to all (other) clients.
	forward chan []byte
	// join is a channel for clients wishing to join the room.
	join chan *Client
	// leave is a channel for clients wishing to leave the room.
	leave chan *Client
	// clients holds all current clients in this room.
	clients map[*Client]bool
	// Topic defines the topic
	topic string
}

// Note 2:
// The join and leave channels exist simply to allow us to safely add and remove clients from the clients map.
// If we were to access the map directly, it is possible that two goroutines running concurrently might try to
// modify the map at the same time, resulting in corrupt memory or unpredictable state.

// Convert connection from http request to one that can be used for websocket communication.
var upgrader = &websocket.Upgrader{
	ReadBufferSize:  socketBufferSize,
	WriteBufferSize: socketBufferSize,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Socket handler
func (r *Room) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	// Convert the connection.
	socket, err := upgrader.Upgrade(w, req, nil)
	if err != nil {
		// If failed log the error.
		log.Fatal("serving http failed ", err)
		return
	}

	client := &Client{
		socket: socket,
		send:   make(chan []byte, messageBufferSize),
		room:   r,
	}

	r.join <- client
	defer func() {
		r.leave <- client
	}()

	// Send message back to client.
	go client.write()

	// Keep waitng for messages and read them.
	client.read()
}

// NewRoom creates a new chat room
func NewRoom(topic string) *Room {
	return &Room{
		forward: make(chan []byte),
		join:    make(chan *Client),
		leave:   make(chan *Client),
		clients: make(map[*Client]bool),
		topic:   topic,
	}
}

// Note 1 (from "Go: Design Patterns for Real-World Projects):
// You can think of channels as an in-memory thread-safe message queue where
// senders pass data and receivers read data in a non-blocking, thread- safe way.

// Run initializes a chat room
// (page 740)
// Keeps watching the three channels inside our room: join, leave, and forward.
// If a message is received on any of those channels,
// the select statement will run the code for that particular case

func (r *Room) Run() {
	log.Printf("running chat room %v", r.topic)
	for {
		// See Note 3.
		select {
		case client := <-r.join:
			log.Printf("new client in room %v", r.topic)
			r.clients[client] = true
		case client := <-r.leave:
			log.Printf("client leaving room %v", r.topic)
			delete(r.clients, client)
			close(client.send)
		case msg := <-r.forward:
			data := FromJSON(msg)
			log.Printf("client '%v' writing message to room %v, message: %v", data.Sender, r.topic, data.Message)
			db := functions.OpenDB()
			defer db.Close()

			// Insert message to database.
			var _, chatError = db.Exec(`INSERT INTO messages(sender, receiver, message, time) values(?,?,?, datetime('now','localtime'))`, data.Sender, data.Receiver, data.Message)
			if chatError != nil {
				fmt.Println(chatError.Error())
				functions.CheckErr(chatError, "-------Line 116 room.go")
				return
			}

			// Loop over all the clients in room
			for client := range r.clients {
				// if strings.Contains(client.room.topic, data.Sender) && strings.Contains(client.room.topic, data.Receiver) {
				select {
				case client.send <- msg:
					fmt.Println(client)
				default:
					delete(r.clients, client)
					close(client.send)
				}
				// }
			}
		}
	}
}

// Note 3:
// We can use select statements whenever we need to synchronize or
// modify shared memory, or take different actions depending on the various activities within our channels.

// Note 4:
// If we receive a message on the join channel, we simply update the r.clients map to
// keep a reference of the client that has joined the room. Notice that we are setting the value to true.
// We are using the map more like a slice, but do not have to worry about shrinking the slice as clients come
// and go through time setting the value to true is just a handy, low- memory way of storing the reference.

// If we receive a message on the leave channel, we simply delete the client
// type from the map, and close its send channel. If we receive a message on the forward channel,
// we iterate over all the clients and add the message to each client's send channel. Then,
// the write method of our client type will pick it up and send it down the socket to the browser.

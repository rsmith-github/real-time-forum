package chat

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

const (
	socketBufferSize  = 1024
	messageBufferSize = 256
)

// Room represents a single chat room
type Room struct {
	forward chan []byte

	join chan *Chatter

	leave chan *Chatter

	chatters map[*Chatter]bool

	topic string
}

var upgrader = &websocket.Upgrader{
	ReadBufferSize:  socketBufferSize,
	WriteBufferSize: socketBufferSize,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func (r *Room) ServeHTTP(w http.ResponseWriter, req *http.Request) {
	socket, err := upgrader.Upgrade(w, req, nil)
	if err != nil {
		log.Fatal("serving http failed ", err)
		return
	}

	chatter := &Chatter{
		socket: socket,
		send:   make(chan []byte, messageBufferSize),
		room:   r,
	}

	r.join <- chatter
	defer func() {
		r.leave <- chatter
	}()
	go chatter.write()
	chatter.read()
}

// NewRoom creates a new chat room
func NewRoom(topic string) *Room {
	return &Room{
		forward:  make(chan []byte),
		join:     make(chan *Chatter),
		leave:    make(chan *Chatter),
		chatters: make(map[*Chatter]bool),
		topic:    topic,
	}
}

// Run initializes a chat room
func (r *Room) Run() {
	log.Printf("running chat room %v", r.topic)
	for {
		select {
		case chatter := <-r.join:
			log.Printf("new chatter in room %v", r.topic)
			r.chatters[chatter] = true
		case chatter := <-r.leave:
			log.Printf("chatter leaving room %v", r.topic)
			delete(r.chatters, chatter)
			close(chatter.send)
		case msg := <-r.forward:
			data := FromJSON(msg)
			log.Printf("chatter '%v' writing message to room %v, message: %v", data.Sender, r.topic, data.Message)
			for chatter := range r.chatters {
				select {
				case chatter.send <- msg:
				default:
					delete(r.chatters, chatter)
					close(chatter.send)
				}
			}
		}
	}
}

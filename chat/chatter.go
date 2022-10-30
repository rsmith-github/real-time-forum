package chat

import "github.com/gorilla/websocket"

// Chatter represents a single Chatter
type Chatter struct {
	socket *websocket.Conn
	send   chan []byte
	room   *Room
}

func (c *Chatter) read() {
	for {
		if _, msg, err := c.socket.ReadMessage(); err == nil {
			c.room.forward <- msg
		} else {
			break
		}
	}
	c.socket.Close()
}

func (c *Chatter) write() {
	for msg := range c.send {
		if err := c.socket.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
	c.socket.Close()
}

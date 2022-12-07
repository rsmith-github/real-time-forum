package chat

import "github.com/gorilla/websocket"

// Client represents a single client/user in the chat
type Client struct {
	// socket is the web socket for this client.
	// it holds a reference to the web socket that will allow us to communicate with the client
	socket *websocket.Conn
	// send is a channel on which messages are sent.
	// this field is a buffered channel through which received messages are queued ready to
	// be forwarded to the user's browser (via the socket)
	send chan []byte
	// room is the room this client is chatting in.
	// The room field will keep a reference to the room that the client is chatting in
	// this is required so that we can forward messages to everyone else in the room.
	room *Room
}

// The read method allows our client to read from the socket via the ReadMessage method,
// continually sending any received messages to the forward
// channel on the room type. If it encounters an error (such as 'the socket has died'),
// the loop will break and the socket will be closed
func (c *Client) read() {
	for {
		if _, msg, err := c.socket.ReadMessage(); err == nil {
			c.room.forward <- msg
		} else {
			break
		}
	}
	c.socket.Close()
}

// Similarly, the write method continually accepts messages from the send channel writing
// everything out of the socket via the WriteMessage method.
// If writing to the socket fails, the for loop is broken and the socket is closed
func (c *Client) write() {
	for msg := range c.send {
		if err := c.socket.WriteMessage(websocket.TextMessage, msg); err != nil {
			break
		}
	}
	c.socket.Close()
}

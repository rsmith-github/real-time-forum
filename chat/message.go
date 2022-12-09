package chat

import (
	"encoding/json"
)

// Message represents a chat message
type Message struct {
	Message  string `json:"message"`
	Sender   string `json:"sender"`
	Receiver string `json:"receiver"`
	Created  string `json:"created"`
	Status   string `json:"status"`
}

// FromJSON created a new Message struct from given JSON
func FromJSON(jsonInput []byte) (message *Message) {
	json.Unmarshal(jsonInput, &message)
	return
}

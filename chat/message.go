package chat

import (
	"encoding/json"
)

// Message represents a chat message
type Message struct {
	Message string `json:"message"`
	Sender  string `json:"sender"`
	Created string `json:"created"`
}

// FromJSON created a new Message struct from given JSON
func FromJSON(jsonInput []byte) (message *Message) {
	json.Unmarshal(jsonInput, &message)
	return
}

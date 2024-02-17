package main

import (
	"context"
	"encoding/json"
	"github.com/im7mortal/unrpa/pkg/rpaDecoder"
	"syscall/js"
)

func receiveBytes(this js.Value, inputs []js.Value) interface{} {

	// Convert js.Value to Go byte slice
	uint8Array := js.Global().Get("Uint8Array").New(inputs[0])
	length := uint8Array.Get("length").Int()
	goBytes := make([]byte, length)
	js.CopyBytesToGo(goBytes, uint8Array)

	v := rpaDecoder.NewV3(goBytes, int64(inputs[1].Int()))

	b, err := v.List(context.TODO())

	var s string
	if err != nil {
		s = err.Error()
	} else {
		ss, _ := json.Marshal(b)
		s = string(ss)
	}

	js.Global().Get("myApp").Call("notifyCompletion", s)

	// Now, goBytes contains the data from JavaScript
	// Process goBytes as needed...

	return nil
}

func main() {
	c := make(chan struct{}, 0)

	// Expose the receiveBytes function to JavaScript
	js.Global().Set("receiveBytes", js.FuncOf(receiveBytes))

	<-c
}

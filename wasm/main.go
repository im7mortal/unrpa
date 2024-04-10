package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/im7mortal/unrpa/pkg/rpaDecoder"
	"syscall/js"
)

type Response struct {
	Error       string
	FileHeaders []rpaDecoder.FileHeader
}

func receiveBytes(this js.Value, inputs []js.Value) any {

	// Convert js.Value to Go byte slice
	uint8Array := js.Global().Get("Uint8Array").New(inputs[0])
	length := uint8Array.Get("length").Int()
	goBytes := make([]byte, length)
	js.CopyBytesToGo(goBytes, uint8Array)
	js.Global().Get("glog").Call("error", fmt.Sprintf("from wasm %d\n", length))
	v := rpaDecoder.NewWasm(rpaDecoder.V3, goBytes, int64(inputs[1].Int()))

	b, err := v.List(context.TODO())

	response := Response{
		FileHeaders: b,
	}
	if err != nil {
		response.Error = err.Error()
	}
	bs, err := json.Marshal(b)
	if err != nil {
		panic(err) // let's panic. I am not sure how to handle it in the WASM
	}
	//js.Global().Get("glog").Call("error", fmt.Sprintf("from wasm %d\n", string(bs)))
	return js.ValueOf(string(bs))
}

func main() {
	c := make(chan struct{}, 0)

	// Expose the receiveBytes function to JavaScript
	js.Global().Set("receiveBytes", js.FuncOf(receiveBytes))

	<-c
}

package main

import (
	"context"
	"fmt"
	"github.com/golang/glog"
	"github.com/im7mortal/unrpa/pkg/rpaDecoder"
	flags "github.com/jessevdk/go-flags"
	"os"
)

const defaultExtractionPath = "./extract"

func main() {
	if isGui() {
		gui()
		return
	}
	var opts struct {
		Help bool   `short:"h" long:"help" description:"Show the help message"`
		Path string `short:"p" long:"path" description:"The archive will be extracted at this path"`
	}
	args, err := flags.Parse(&opts)
	if err != nil {
		glog.Error(err)
		return
	}
	if opts.Help || len(args) != 1 {
		fmt.Print(helpMessage)
		return
	}
	archivePath := args[0]

	extractPath := defaultExtractionPath
	if opts.Path != "" {
		extractPath = opts.Path
	}

	err = os.MkdirAll(extractPath, os.ModePerm)
	if err != nil {
		glog.Error(err)
		return
	}

	run(archivePath, extractPath)
}

var helpMessage = `

| Positional Argument | Description              |
|---------------------|--------------------------|
| FILENAME            | the RPA file to extract. |

| Optional Argument            | Description                                                |
|------------------------------|------------------------------------------------------------|
|  -h, --help                  | show this help message and exit                          |
|  -p PATH, --path PATH        | will extract to the given path.  

Examples

 - On most unix systems, open a terminal, then:
   'unrpa -p "path/to/output/dir" "path/to/archive.rpa"'
 - On most Windows systems, open a Command Prompt, then:
   'unrpa -p "path\\to\\output\\dir" "path\\to\\archive.rpa"'
`

func run(archivePath, extractPath string) {
	dcdr, err := rpaDecoder.DetectVersion(archivePath, extractPath)
	if err != nil {
		glog.Error(err)
		return
	}
	ctx := context.TODO()
	/*	list, err := dcdr.List(ctx)
		if err != nil {
			glog.Error(err)
			return
		}

		for i := range list {
			glog.Info(list[i].Name)
		}*/
	err = dcdr.Decode(ctx)
	if err != nil {
		glog.Error(err)
		return
	}
}

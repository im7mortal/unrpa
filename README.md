# Hassle free RPA extractor. In-Browser, no code, no EXEs. 

# MY CURRENT HOME PROJECT; it's under active development;

# [:point_right: TLDR; Go to the UNRPA WEB PAGE](https://im7mortal.github.io/unrpa/)


Hassle-free in browser RPA extractor.

#### Support Chromium based browsers.

- FileSystemAccessApi - choose file, choose directory, give permissions , extract
- Unpickle written in Golang and compiled to WASM. (I didn't find good JS web Pickle library [ ... and I wanted to try WASM])
- Can scan a directory for RPA files

#### Support to Firefox and Safari,

Firefox and Safari don't want to implement FileSystemAccessApi

- Parallel extraction (2-4 web workers) to in-memory zip. 250 Mb zip limit.
- Zip downloaded to the default download directory
- Can handle all sizes archives [<sup>of course it's slower in the browser</sup>]

##### I hope you will find it's useful. In situations when :

- Somebody ask to extract content of a game and doesn't have any idea of python neither terminal. ~~Neither what are RPA themselves~~
- It was hard day, and you don't want to use neither python, neither terminal, neither download any .exe. Pick file and extract it in a moment

## Roadmap

- [x] WASM golang
- [x] first implementation Chromium
- [x] first implementation FileApi
- [x] web-workers for FileApi implementation
- [x] GitHub Actions pipeline
- [x] minimal design
- [x] vanilla js refactoring
- [x] scan function + drag&drop logic
- [x] convert to typescript
- [x] clean typescript
- [x] react
- [ ] browser optimizations
- [ ] maybe replace WASM unpickle with ts one
- [ ] maybe replace JSZIP with something better







## [older description] About - Golang 

unrpa is a program to extract files from the RPA archive format created
for [the Ren'Py Visual Novel Engine](http://www.renpy.org/). It was inspired by [Python unrpa](https://github.com/Lattyware/unrpa). 
It doesn't require any dependencies and setup. 

## Download
* [Linux](https://github.com/im7mortal/unrpa/releases/download/v1.0.0/unrpa_linux_amd64.tar.gz)
* [Windows](https://github.com/im7mortal/unrpa/releases/download/v1.0.0/unrpa_windows_amd64.zip)
* [macOS](https://github.com/im7mortal/unrpa/releases/download/v1.0.0/unrpa_darwin_amd64.zip)

## Command Line Usage

```
usage: unrpa [-h] [-p PATH]
             FILENAME
```

### Options

| Positional Argument | Description              |
|---------------------|--------------------------|
| FILENAME            | the RPA file to extract. |

| Optional Argument            | Description                                                |
|------------------------------|------------------------------------------------------------|
|  -h, --help                  | show this help message and exit                          |
|  -p PATH, --path PATH        | will extract to the given path.                            |

### Examples

 - On most unix systems, open a terminal, then:
   `unrpa -p "path/to/output/dir" "path/to/archive.rpa"`
 - On most Windows systems, open a Command Prompt, then:
   `unrpa -p "path\to\output\dir" "path\to\archive.rpa"`

### gocx

Released via goxc.

### Timing

extract: 1019018ms - timer ended  ; 7958be5b
extract: 571323ms - timer ended   ; 94241652


EXTRACT1: 9782.45703125 ms
EXTRACT1: 7865.830810546875 ms
EXTRACT1: 7681.796875 ms
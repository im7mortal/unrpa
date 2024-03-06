# unrpa - Extract files from the RPA archive format.

## About

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
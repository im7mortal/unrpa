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
- [x] drag&drop
- [x] maybe replace WASM unpickle with ts one
- [x] maybe replace JSZIP with something better
- [x] service worker download hack for FileAPI browsers
- [x] migrate from CRA to vite
- [x] i18n localization
- [ ] preview of content probably with Chonky


## Development

The project will work from the box if you use docker. Just run.sh.

It requires execution permissions for [onlyForDockerEnv.sh](onlyForDockerEnv.sh) set on host.

```shell
 sudo chmod +x onlyForDockerEnv.sh 
```

Kill the container with **Ctrl+Z**


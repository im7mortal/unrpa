package rpaDecoder

func NewWasm(version string, src []byte, key int64) Decoder {
	switch version {
	case V3:
		return &v3Decoder{
			silent: true, // WASM implementation can't print to stdout and stderr
			raw:    src,
			key:    key,
		}
	}
	return nil
}

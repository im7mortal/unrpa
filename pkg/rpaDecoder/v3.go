package rpaDecoder

import (
	"compress/zlib"
	"context"
	"fmt"
	"github.com/golang/glog"
	"github.com/nlpodyssey/gopickle/pickle"
	"github.com/nlpodyssey/gopickle/types"
	"io"
	"os"
	"path/filepath"
)

type v3Decoder struct {
	path, extractPath string
	offset, key       int64
	fhs               []FileHeader

	continueOnError bool
	errors          []error
}

const (
	canNotSkip = false
	canSkip    = true
)

func (v3d *v3Decoder) canContinueOnError(err error, critical bool) (error, bool) {
	if err == nil {
		return nil, false
	}
	if critical {
		glog.ErrorDepthf(1, "[CRITICAL ERROR CAN'T CONTINUE] %s", err)
		return err, canNotSkip
	}
	if v3d.continueOnError {
		glog.ErrorDepthf(1, "[SKIP ERROR] %s", err)
		v3d.errors = append(v3d.errors, err)
		return nil, canSkip
	}
	return err, canNotSkip
}

func (v3d *v3Decoder) Decode(ctx context.Context) (err error) {

	if v3d.fhs == nil {
		v3d.fhs, err = v3d.List(ctx)
		if err, _ = v3d.canContinueOnError(err, canNotSkip); err != nil {
			return err
		}
	}

	file, err := os.Open(v3d.path)
	if err, _ = v3d.canContinueOnError(err, canNotSkip); err != nil {
		return err
	}

	defer file.Close()

	for i := range v3d.fhs {
		var skipError bool
		fileP := filepath.Join(v3d.extractPath, v3d.fhs[i].Name)
		dir, _ := filepath.Split(fileP)
		err = os.MkdirAll(dir, os.ModePerm)
		if err, skipError = v3d.canContinueOnError(err, canSkip); err != nil {
			if skipError {
				continue
			}
			return err
		}

		_, err = file.Seek(v3d.fhs[i].Offset, io.SeekStart)
		if err, skipError = v3d.canContinueOnError(err, canSkip); err != nil {
			if skipError {
				continue
			}
			return err
		}

		var outFile *os.File
		outFile, err = os.OpenFile(fileP, os.O_CREATE|os.O_WRONLY, os.ModePerm)
		if err, skipError = v3d.canContinueOnError(err, canSkip); err != nil {
			if skipError {
				continue
			}
			return err
		}

		_, err = io.CopyN(outFile, file, v3d.fhs[i].Len)
		if err, skipError = v3d.canContinueOnError(err, canSkip); err != nil {
			if skipError {
				continue
			}
			return err
		}

		// we close it explicitly; becasue `defer` will wait for the end of the loop
		err = outFile.Close()
		if err, skipError = v3d.canContinueOnError(err, canSkip); err != nil {
			if skipError {
				continue
			}
			return err
		}

	}
	return nil
}

func (v3d *v3Decoder) List(_ context.Context) (fhs []FileHeader, err error) {

	file, err := os.Open(v3d.path)
	if err != nil {
		glog.Error(err)
		return
	}

	defer file.Close()

	_, err = file.Seek(v3d.offset, io.SeekStart)
	if err != nil {
		glog.Error(err)
		return
	}

	zReader, err := zlib.NewReader(file)
	if err != nil {
		glog.Error(err)
		return
	}

	defer zReader.Close()

	unpick := pickle.NewUnpickler(zReader)

	d, err := unpick.Load()
	if err != nil {
		glog.Error(err)
		return
	}

	// following implementation pretty bad looking; for now we will stick with  it
	if di, ok := d.(*types.Dict); ok {
		for _, k := range di.Keys() {

			fh := FileHeader{Name: fmt.Sprintf("%s", k)}
			var v interface{}
			if v, ok = di.Get(k); ok {

				var vi *types.List
				if vi, ok = v.(*types.List); ok {

					var t *types.Tuple
					if t, ok = vi.Get(0).(*types.Tuple); ok {

						fh.Offset, err = getInt64(t.Get(0))
						if err != nil {
							glog.Error(err)
							return
						}

						fh.Len, err = getInt64(t.Get(1))
						if err != nil {
							glog.Error(err)
							return
						}

						// "decryption"
						if v3d.key != 0 {
							fh.Offset = fh.Offset ^ v3d.key
							fh.Len = fh.Len ^ v3d.key
						}

						fhs = append(fhs, fh)
					}
				}
			}
		}
	}

	v3d.fhs = fhs
	return
}

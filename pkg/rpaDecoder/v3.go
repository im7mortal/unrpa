package rpaDecoder

import (
	"bytes"
	"compress/zlib"
	"context"
	"fmt"
	"github.com/golang/glog"
	"github.com/nlpodyssey/gopickle/pickle"
	"github.com/nlpodyssey/gopickle/types"
	"io"
	"math/big"
	"os"
	"path/filepath"
)

type v3Decoder struct {
	path, extractPath string
	offset, key       int64
	fhs               []FileHeader
}

func (v3d *v3Decoder) Decode(ctx context.Context) (err error) {
	if v3d.fhs == nil {
		v3d.fhs, err = v3d.List(ctx)
		if err != nil {
			glog.Error(err)
			return
		}
	}
	file, err := os.Open(v3d.path)
	if err != nil {
		glog.Error(err)
		return
	}
	buff, err := io.ReadAll(file)
	if err != nil {
		glog.Error(err)
		return
	}
	defer file.Close()
	for i := range v3d.fhs {
		fileP := filepath.Join(v3d.extractPath, v3d.fhs[i].Name)
		dir, _ := filepath.Split(fileP)
		err = os.MkdirAll(dir, os.ModePerm)
		if err != nil {
			glog.Error(err)
			return
		}
		//glog.Info(filepath.Join(v3d.extractPath, v3d.fhs[i].Name), v3d.fhs[i].Offset, v3d.fhs[i].Len)
		err = os.WriteFile(
			fileP,
			buff[v3d.fhs[i].Offset:v3d.fhs[i].Offset+v3d.fhs[i].Len],
			os.ModePerm,
		)
		if err != nil {
			glog.Error(err)
			return
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
	_, err = file.Seek(v3d.offset, 0)
	if err != nil {
		glog.Error(err)
		return
	}
	buffMetadata, err := io.ReadAll(file)
	if err != nil {
		glog.Error(err)
		return
	}
	zReader, err := zlib.NewReader(bytes.NewReader(buffMetadata))
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

						if v3d.key != 0 {
							fh.Offset = (&big.Int{}).Xor(big.NewInt(fh.Offset), big.NewInt(v3d.key)).Int64()
							fh.Len = (&big.Int{}).Xor(big.NewInt(fh.Len), big.NewInt(v3d.key)).Int64()
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

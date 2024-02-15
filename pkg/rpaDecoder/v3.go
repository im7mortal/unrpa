package rpaDecoder

import (
	"bytes"
	"compress/zlib"
	"context"
	"errors"
	"github.com/golang/glog"
	"github.com/hydrogen18/stalecucumber"
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
	buffMetadata1, err := io.ReadAll(zReader)
	if err != nil {
		glog.Error(err)
		return
	}
	load, err := stalecucumber.Unpickle(bytes.NewReader(buffMetadata1))
	if err != nil {
		glog.Error(err)
		return
	}
	metadata, err := stalecucumber.DictString(load, err)
	if err != nil {
		glog.Error(err)
		return
	}
	for key, value := range metadata {
		v, ok := value.([]interface{})
		if !ok {
			err = errors.New("not valid interface conversion")
			glog.Error(err)
			return
		}
		if len(v) != 1 {
			err = errors.New("not expected length 1")
			glog.Error(err)
			return
		}
		v, ok = v[0].([]interface{})
		if !ok {
			err = errors.New("not valid interface conversion")
			glog.Error(err)
			return
		}
		if len(v) != 3 {
			err = errors.New("not expected length 3")
			glog.Error(err)
			return
		}
		fh := FileHeader{Name: key}
		fh.Offset, err = getInt64(v[0])
		if err != nil {
			glog.Error(err)
			return
		}

		fh.Len, err = getInt64(v[1])
		if err != nil {
			glog.Error(err)
			return
		}
		// this field is never needed
		//fh.Field, ok = v[2].(string)
		//if !ok {
		//	glog.Fatal("no ok")
		//}

		if v3d.key != 0 {
			fh.Offset = (&big.Int{}).Xor(big.NewInt(fh.Offset), big.NewInt(v3d.key)).Int64()
			fh.Len = (&big.Int{}).Xor(big.NewInt(fh.Len), big.NewInt(v3d.key)).Int64()
		}

		fhs = append(fhs, fh)
	}
	v3d.fhs = fhs
	return
}

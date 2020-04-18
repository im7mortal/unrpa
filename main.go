package main

import (
	"bufio"
	"bytes"
	"compress/zlib"
	"context"
	"encoding/binary"
	"encoding/hex"
	"errors"
	"github.com/golang/glog"
	"github.com/hydrogen18/stalecucumber"
	"io/ioutil"
	"math/big"
	"os"
	"path/filepath"
	"strings"
)

const (
	v1 = "RPA-1.0"
	v2 = "RPA-2.0"
	v3 = "RPA-3.0"
)

type FileHeader struct {
	Name string

	Offset, Len int64

	// I don't know what is it
	Field string
}
type decoder interface {
	Decode(context.Context) error
	List(context.Context) ([]FileHeader, error)
}

type v1Decoder struct {
}

func (v1d *v1Decoder) Decode(context.Context) error {
	return errors.New(v1 + " not implemented")
}
func (v1d *v1Decoder) List(context.Context) ([]FileHeader, error) {
	return nil, errors.New(v1 + " not implemented")
}

type v2Decoder struct {
}

func (v2d *v2Decoder) Decode(context.Context) error {
	return errors.New(v2 + " not implemented")
}
func (v2d *v2Decoder) List(context.Context) ([]FileHeader, error) {
	return nil, errors.New(v2 + " not implemented")
}

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
	buff, err := ioutil.ReadAll(file)
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
		err = ioutil.WriteFile(
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

func (v3d *v3Decoder) List(ctx context.Context) (fhs []FileHeader, err error) {
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
	buffMetadata, err := ioutil.ReadAll(file)
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
	buffMetadata1, err := ioutil.ReadAll(zReader)
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

func getInt64(i interface{}) (v int64, err error) {
	vv, ok := i.(*big.Int)
	if !ok {
		if v, ok = i.(int64); ok {
			return
		}
		return 0, errors.New("expected *big.Int")
	}
	if !vv.IsInt64() {
		if !ok {
			return 0, errors.New("expected int64")
		}
	}
	return vv.Int64(), nil
}

func detectVersion(archivePath, extractPath string) (d decoder, err error) {
	ext := filepath.Ext(archivePath)
	if ext == ".rpi" {
		return &v1Decoder{}, nil
	}
	file, err := os.Open(archivePath)
	if err != nil {
		glog.Error(err)
		return
	}
	defer file.Close()
	scanner := bufio.NewScanner(file)
	header := ""
	for scanner.Scan() {
		header = scanner.Text()
		break
	}

	if err = scanner.Err(); err != nil {
		glog.Error(err)
		return
	}

	parts := strings.Split(header, " ")
	if len(parts) < 2 || len(parts) > 4 {
		err = errors.New(" expected length not valid")
		glog.Error(err)
		return
	}
	if len(parts) == 2 {
		return &v2Decoder{}, nil
	}
	v3d := v3Decoder{
		extractPath: extractPath,
		path:        archivePath,
	}

	//v3d.key, err = strconv.ParseInt(, 10, 64)
	//if err != nil {
	//	glog.Error(err)
	//	return
	//}
	v3d.offset, err = stringToInt64(parts[1])
	if err != nil {
		glog.Error(err)
		return
	}
	v3d.key, err = stringToInt64(parts[2])
	if err != nil {
		glog.Error(err)
		return
	}
	return &v3d, err
}

func stringToInt64(s string) (i int64, err error) {
	var offset []byte
	offset, err = hex.DecodeString(s)
	if err != nil {
		glog.Error(err)
		return
	}
	switch len(offset) {
	case 8:
		return int64(binary.BigEndian.Uint64(offset)), err
	case 4:
		return int64(binary.BigEndian.Uint32(offset)), err
	}
	return 0, errors.New("wrong size of hex string")
}

func main() {
	extractPath := "./extract"
	archivePath := os.Args[1]
	err := os.MkdirAll(extractPath, os.ModePerm)
	if err != nil {
		glog.Error(err)
		return
	}

	dcdr, err := detectVersion(archivePath, extractPath)
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

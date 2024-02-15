package rpaDecoder

import (
	"bufio"
	"context"
	"encoding/binary"
	"encoding/hex"
	"errors"
	"github.com/golang/glog"
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

type Decoder interface {
	Decode(context.Context) error
	List(context.Context) ([]FileHeader, error)
}

type notImplemented struct {
	v string
}

func (ni *notImplemented) Decode(context.Context) error {
	return errors.New(ni.v + " is not implemented")
}

func (ni *notImplemented) List(context.Context) ([]FileHeader, error) {
	return nil, errors.New(ni.v + " is not implemented")
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

func DetectVersion(archivePath, extractPath string) (d Decoder, err error) {
	ext := filepath.Ext(archivePath)
	if ext == ".rpi" {
		return &notImplemented{v: v1}, nil
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
		return &notImplemented{v: v2}, nil
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

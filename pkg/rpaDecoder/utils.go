package rpaDecoder

import (
	"encoding/binary"
	"encoding/hex"
	"errors"
	"github.com/golang/glog"
	"math/big"
)

func getInt64(i interface{}) (int64, error) {

	if vi, ok := i.(int); ok {
		return int64(vi), nil
	}

	if vi64, ok := i.(int64); ok {
		return vi64, nil
	}

	if vv, ok := i.(*big.Int); ok {
		if vv.IsInt64() {
			return vv.Int64(), nil
		}
	}

	return 0, errors.New("expected int, int64, or *big.Int(int64)")
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

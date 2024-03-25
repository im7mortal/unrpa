package rpaDecoder_test

import (
	"context"
	"github.com/golang/glog"
	"github.com/im7mortal/unrpa/pkg/rpaDecoder"
	"testing"
)

const (
	//archivePath = "../../assets/tests/valid.rpa"
	archivePath = "/home/user/QubesIncoming/basura/archive.rpa"
	extractPath = "~/out_rpa"
)

func TestExtracting(t *testing.T) {

	dcdr, err := rpaDecoder.DetectVersion(archivePath, extractPath)
	if err != nil {
		t.Error(err)
		return
	}

	ctx := context.TODO()

	list, err := dcdr.List(ctx)
	if err != nil {
		glog.Error(err)
		return
	}

	for i := range list {
		glog.Info(list[i].Name)
	}

	err = dcdr.Decode(ctx)
	if err != nil {
		t.Error(err)
		return
	}
}

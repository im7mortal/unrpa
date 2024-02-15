package rpaDecoder

import (
	"context"
	"errors"
)

type v2Decoder struct {
}

func (v2d *v2Decoder) Decode(context.Context) error {
	return errors.New(v2 + " not implemented")
}

func (v2d *v2Decoder) List(context.Context) ([]FileHeader, error) {
	return nil, errors.New(v2 + " not implemented")
}

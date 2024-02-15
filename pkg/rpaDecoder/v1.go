package rpaDecoder

import (
	"context"
	"errors"
)

type v1Decoder struct {
}

func (v1d *v1Decoder) Decode(context.Context) error {
	return errors.New(v1 + " is not implemented")
}

func (v1d *v1Decoder) List(context.Context) ([]FileHeader, error) {
	return nil, errors.New(v1 + " is not implemented")
}

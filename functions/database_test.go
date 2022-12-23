package functions

import (
	"reflect"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

func TestExecuteSQL(t *testing.T) {
	type args struct {
		queryStr string
	}
	tests := []struct {
		name string
		args args
		want []byte
	}{
		// TODO: Add test cases.

		// {name: ""}

	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := ExecuteSQL(tt.args.queryStr); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("ExecuteSQL() = %v, want %v", got, tt.want)
			}
		})
	}
}

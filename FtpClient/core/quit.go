package core

import (
	"os"
)

func (cs *FtpSession) QUIT(args string) (string, error) {
	defer os.Exit(0)
	return writeAndreadOnMemory(cs, "QUIT ")
}
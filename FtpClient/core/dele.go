package core

func (cs *FtpSession) DELE(input string) (string, error) {
	return writeAndreadOnMemory(cs, "DELE "+ input)
}

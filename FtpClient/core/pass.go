package core

func (cs *FtpSession) PASS(args string) (string, error)  {
	return writeAndreadOnMemory(cs, "PASS " + args )
}
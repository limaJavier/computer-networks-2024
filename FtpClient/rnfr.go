package main

func (cs *CommandsStruct) RNFR(oldName string) (string, error) {
	return writeAndreadOnMemory(cs.connectionConfig, "RNFR " + oldName)
}
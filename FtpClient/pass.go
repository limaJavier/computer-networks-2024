package main

func (cs *CommandsStruct) PASS(args string) (string, error)  {
	return writeAndreadOnMemory(cs, "PASS " + args )
}
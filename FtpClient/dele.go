package main

func (cs *CommandsStruct) DELE(input string) (string, error) {
	return writeAndreadOnMemory(cs, "DELE "+ input)
}

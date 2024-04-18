package console

import (
	"FTPClient/core"
	"bufio"
	"fmt"
	"os"
	"reflect"
	"strings"
	"sync"
)

var wg sync.WaitGroup

func execute_command(command string, X *core.FtpSession) {
	command = strings.Split(command, "\n")[0]
	parts := strings.Split(command, " ")
	if len(parts) == 0 {
		fmt.Println("no command written")
		return
	}
	command_name := parts[0]
	method := reflect.ValueOf(X).MethodByName(strings.ToUpper(command_name))

	if !method.IsValid() {
		fmt.Println("command not implemented by the client")
		return
	}
	resultCommand := method.Call([]reflect.Value{reflect.ValueOf(strings.TrimSpace(command[len(command_name):]))})

	result, _ := resultCommand[0].Interface().(string)

	fmt.Println("Command Says : " + result)
	if !resultCommand[1].IsNil() {
		resultError, _ := resultCommand[1].Interface().(error)
		fmt.Println("Also : " + resultError.Error())
	}
}

func readPart(commandCh chan string) {
	defer wg.Done()
	for {
		reader := bufio.NewReader(os.Stdin)
		command, _ := reader.ReadString('\n')
		commandCh <- command
		fmt.Println("Command sent")
	}
}

func writePart(commandCh chan string, X *core.FtpSession) {
	defer wg.Done()
	for {
		command := <-commandCh
		go execute_command(command, X)
	}
}

func StartConsole() {
	ftptouse := core.Local

	session, err := core.SessionBuilder(ftptouse)
	if err != nil {
		return 
	}
	commandCh := make(chan string)

	wg.Add(2)
	go readPart(commandCh)
	go writePart(commandCh, session)
	// Wait for the goroutines to finish
	wg.Wait()
}
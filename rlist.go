package main

import (
	"errors"
	"strings"
)

func (cs *CommandsStruct) RNLS(path string) (string, error) {
	split := strings.Split(path, " ")
	if len(split) >= 2 || len(split) == 0 {
		return "", errors.New("wrong Argument Format: rnls (path)*")
	}
	return recLS(cs, split[0], 0, "")	
}

func recLS(cs *CommandsStruct, path string, i int, prev string) (string, error) {

	spacing := ""
	j := 0
	for {
		if j == i {
			break
		}
		spacing += "   "
		j++
	}

	response, err := cs.LS(path)
	if err != nil {
		return "", errors.New("something is wrong with LS")
	}
	archives := strings.Split(response, "\n")

	archivesFIltered := []string{}
	for _, arch := range archives {
		if len(arch) > 0 {
			archivesFIltered = append(archivesFIltered, arch)
		}
	}
	archives = archivesFIltered
	if len(archives) > 0 {
		for index, arch := range archives {
			arch = arch[:len(arch)-1]
			arch = strings.TrimSpace(arch)
			parts := strings.Split(arch, " ")
			filename := parts[len(parts)-1]
			var marker string = ""
			if index == len(archives)-1 {
				marker = "└──"
			} else {
				marker = "├──"
			}
			if arch[0] == 'd' {
				prev += spacing + marker + filename + "\n"
				prev, err = recLS(cs, path+"/"+filename, i+1, prev)
				if err != nil {
					return "", errors.New("something wrong with recursion")
				}
			} else {
				prev += spacing + marker + filename + "\n"
			}
		}
	}
	return prev, nil
}

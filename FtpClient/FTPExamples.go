package main

type FTPExample struct{
	ip string
	port string
	user string
	password string
}

var DLP FTPExample = FTPExample{
	ip: "44.241.66.173",
	port: "21",
	user: "dlpuser",
	password: "rNrKYTX9g7z3RgJRmxWuGHbeu",
}

var Local FTPExample = FTPExample{
	ip : "127.0.0.1",
	port : "21",
	user : "brito",
	password : "password",
}

var Phone FTPExample = FTPExample{
	ip : "192.168.43.252",
	port : "2020",
	user : "android",
	password : "android",
}

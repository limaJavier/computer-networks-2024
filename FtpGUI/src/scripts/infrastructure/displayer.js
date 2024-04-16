import { selected } from "../globals.js";
import { DirectoryTree } from "./directory.js";
import { Requester } from "./requester.js";
import { CreateConnectionRequest, ListServerRequest, UploadRequest } from "./requests.js";

export class Displayer {
    #apiUrl;
    #requester;
    #serverDirectoryTree;
    #localDirectoryTree;
    #statusList;

    constructor(apiUrl) {
        this.#apiUrl = apiUrl;
        this.#requester = new Requester();
        this.#serverDirectoryTree = new DirectoryTree("root");
        this.#localDirectoryTree = new DirectoryTree("root");
        this.#statusList = [];
    }

    async connect(ipAddress, userName, password) {
        const connectionRequest = new CreateConnectionRequest(
            ipAddress,
            userName,
            password
        );
        const connectionResponse = await this.#requester.post(this.#apiUrl + "connect", connectionRequest);

        this.#displayStatus(connectionResponse.status);

        if (!connectionResponse.successful)
            return;

        this.displayServerDirectory()
    }

    async close() {
        const response = await this.#requester.get(this.#apiUrl + "close");

        this.#displayStatus(response.status);

        const serverDirectory = document.querySelector("#server-directory");

        // Reset server directory tree
        this.#serverDirectoryTree = new DirectoryTree("root");
        // Reset server directory html
        serverDirectory.innerHTML = "";

        // Reset selected items
        selected.localFile = undefined;
        selected.localDirectory = undefined;
        selected.serverFile = undefined;
        selected.serverDirectory = undefined;
    }

    async update() {
        const response = await this.#requester.get(this.#apiUrl + "status");

        if (response.status == "")
            return;

        this.#displayStatus(response.status);
    }

    async displayServerDirectory(directoryId = undefined) {
        if (directoryId == undefined)
            directoryId = this.#serverDirectoryTree.root.id;

        const path = this.#serverDirectoryTree.findDirectory(directoryId).path;

        // Wait until server is functioning
        // const listRequest = new ListServerRequest(path);
        // const listResponse = await this.#requester.post(this.#apiUrl+"list/server", listRequest);
        // if(!listResponse.successful) {
        //     this.#displayStatus("Error while listing directory");
        //     return;
        // }

        // Mock response
        const directories = ["Pictures", "Music", "Videos", "Books"];
        const files = ["main.c", "lib.c", "script.py"];

        const rootId = this.#serverDirectoryTree.root.id;

        // Insert directories into directory tree
        directories.forEach(dir => {
            this.#serverDirectoryTree.insertDirectory(rootId, dir);
        });

        // Insert files into directory tree
        files.forEach(f => {
            this.#serverDirectoryTree.insertFile(rootId, f);
        });

        const serverDirectory = document.querySelector("#server-directory");

        // Display html
        serverDirectory.innerHTML = this.#serverDirectoryTree.toHtml();

        this.#setServerDirectoryEvents(false);
    }

    async displayLocalDirectory(directoryId = undefined) {
        if (directoryId == undefined)
            directoryId = this.#localDirectoryTree.root.id;

        const path = this.#localDirectoryTree.findDirectory(directoryId).path;

        // Wait until server is functioning
        // const listRequest = new ListServerRequest(path);
        // const listResponse = await this.#requester.post(this.#apiUrl+"list/local", listRequest);

        // if(!listResponse.successful) {
        //     this.#displayStatus("Error while listing directory");
        //     return;
        // }

        // Mock response
        const directories = ["Movies", "Lectures", "Projects"];
        const files = ["pic.jpeg", "music.mp3"];

        const rootId = this.#localDirectoryTree.root.id;

        // Insert directories into directory tree
        directories.forEach(dir => {
            this.#localDirectoryTree.insertDirectory(rootId, dir);
        });

        // Insert files into directory tree
        files.forEach(f => {
            this.#localDirectoryTree.insertFile(rootId, f);
        });

        const localDirectory = document.querySelector("#local-directory");

        // Display html
        localDirectory.innerHTML = this.#localDirectoryTree.toHtml();

        this.#setLocalDirectoryEvents();
    }

    async uploadFile() {
        if (selected.localFile == undefined || selected.serverDirectory == undefined) {
            this.#displayStatus("Error while uploading file. Must select a file and a destination directory in order to upload.");
            return;
        }

        const source = this.#localDirectoryTree.findFile(selected.localFile.substr(1)).path();
        const destination = this.#serverDirectoryTree.findDirectory(selected.serverDirectory.substr(1)).path;

        const request = new UploadRequest(source, destination);
        const response = await this.#requester.post(this.#apiUrl + "uploads/file", request);

        this.#displayStatus(response.status);
    }

    async uploadDirectory() {
        if (selected.localDirectory == undefined || selected.serverDirectory == undefined) {
            this.#displayStatus("Error while uploading file. Must select a source and destination directory in order to upload.");
            return;
        }

        const source = this.#localDirectoryTree.findDirectory(selected.localDirectory.substr(1)).path;
        const destination = this.#serverDirectoryTree.findDirectory(selected.serverDirectory.substr(1)).path;

        const request = new UploadRequest(source, destination);
        const response = await this.#requester.post(this.#apiUrl + "uploads/directory", request);

        this.#displayStatus(response.status);
    }

    #displayStatus(status) {
        const statusContainer = document.querySelector("#status");

        this.#statusList.push(status);
        let data = "";
        this.#statusList.forEach(s => {
            data += `<li>${s}</li>`
        });
        statusContainer.innerHTML = data;
    }

    #setLocalDirectoryEvents() {
        const fileItems = document.querySelectorAll(`#local-directory .file-item`);
        const directoryItems = document.querySelectorAll("#local-directory .directory-item");
        fileItems.forEach(item => {
            item.addEventListener("click", () => {

                // Remove select-file class from previously selected file
                if (selected.localFile != undefined) {
                    const previouslySelected = document.querySelector(`#${selected.localFile}`);
                    previouslySelected.className = `file-item`;
                }

                selected.localFile = item.id;
                item.className += " selected-file";
            });
        });

        directoryItems.forEach(item => {
            item.addEventListener("click", () => {

                // Remove select-directory class from previously selected directory
                if (selected.localDirectory != undefined) {
                    const previouslySelected = document.querySelector(`#${selected.localDirectory}`);
                    previouslySelected.className = "directory-item";
                }

                selected.localDirectory = item.id;
                item.className += " selected-directory";
            });
        });
    }

    #setServerDirectoryEvents() {
        const fileItems = document.querySelectorAll(`#server-directory .file-item`);
        const directoryItems = document.querySelectorAll("#server-directory .directory-item");
        fileItems.forEach(item => {
            item.addEventListener("click", () => {

                // Remove select-file class from previously selected file
                if (selected.serverFile != undefined) {
                    const previouslySelected = document.querySelector(`#${selected.serverFile}`);
                    previouslySelected.className = `file-item`;
                }

                selected.serverFile = item.id;
                item.className += " selected-file";
            });
        });

        directoryItems.forEach(item => {
            item.addEventListener("click", () => {

                // Remove select-directory class from previously selected directory
                if (selected.serverDirectory != undefined) {
                    const previouslySelected = document.querySelector(`#${selected.serverDirectory}`);
                    previouslySelected.className = "directory-item";
                }

                selected.serverDirectory = item.id;
                item.className += " selected-directory";
            });
        });
    }
}
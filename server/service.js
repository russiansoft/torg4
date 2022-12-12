
const http = require("http");
const fs = require("fs");
const path = require("path");

let location = path.dirname(path.dirname(process.argv[1]));
let output = fs.createWriteStream(location + "\\logs\\node.log");
let timer = Date.now();

let service = new class
{
	constructor()
	{
		this.arguments = { };
		for (let i = 2; i < process.argv.length; i++)
		{
			let values = process.argv[i].split("=");
			arguments[values[0]] = values[1];
		}

		process.on('uncaughtException', exception =>
		{
			console.log(exception);
			this.log(exception);
		} );

	}

	log(text)
	{
		let now = Date.now();
		let time = "" + (now - timer);
		timer = now;
		while (time.length < 6)
			time = " " + time;
		let line = "" + time + ":\t" + text;
		output.write(line + "\r\n");
		console.log(line);
	}

	async Call(result)
	{
		let uri = "http://127.0.0.1:2020/work";
		let content = JSON.stringify(result);
		return new Promise((resolve, reject) =>
		{
			let request = http.request(uri);
			request.setHeader("gateway", "nodejs");
			request.setHeader("Connection", "keep-alive");
			request.setHeader("Content-Type", "text/plain;charset=UTF-8");
			request.setHeader("Content-Length", Buffer.byteLength(content));
			request.on("response", response =>
			{
				let data = "";
				response.on("data", chunk => { data += chunk; } );
				response.on("end", () =>
				{
					this.log("Запрос: " + data);
					let json = JSON.parse(data);
					resolve(json);
				} );
			} );
			this.log("Ответ: " + content);
			request.end(content);
		} );
	}

	async Run()
	{
		let result = { };
		while (true)
		{
			let work = await this.Call(result);
			result = { };
			if (this.Do)
				result = await this.Do(work);
			if (work.task == "exit")
				process.exit();
		}
	}
};

module.exports = service;


const http = require("http");
const { mainModule } = require("process");
const service = require("./service");
let TelegramBot = require("./telegram");
const fs = require("fs");
const path = require("path");
const crypto = require('crypto');

async function RunBot()
{
	let bot = new TelegramBot("5779081236:AAENm863O-uQi7HuDntUDkMf1EbZitaW5G4");
	await bot.Write("1598562255", "Служба запущена");
	//await bot.List();
	bot.Answer = async function(message)
	{
		if (message.text.startsWith("/start"))
		{
			await bot.Write(message.chat.id, "Привет, " + message.chat.first_name);
			await server.Call("auth", "telegram", {"user_id": "" + message.from.id,
			                                       "first_name": message.from.first_name,
			                                       "device": message.text.split(" ")[1]});
			await bot.Write(message.chat.id, "Вы успешно авторизовались. Возвращайтесь на сайт.");
			//await bot.Write(message.chat.id, 'Напиши любую формулу с "x"');
			//await bot.Write(message.chat.id, "Например, x * x + 2 * x + 5");
		}
		else
		{
			await bot.Write(message.chat.id, "?");
			// let f = message.text;
			// let text = "";
			// let good = false;
			// for (let x = -10; x <= 10; x++)
			// {
			// 	let х = x; // Кириллица
			// 	let X = x; // Большая
			// 	let Х = x; // Большая кириллица
			// 	let y = "?";
			// 	try
			// 	{
			// 		y = eval(f);
			// 		good = true;
			// 	}
			// 	catch (exception)
			// 	{
			// 		console.log("Ошибка вычисления выражения: " + exception);
			// 	}
			// 	text += (text ? ", " : "") + "(" + x + "; " + y + ")";
			// }
			// if (good)
			// 	await bot.Write(message.chat.id, "Координаты точек на графике: " + text);
			// else
			// 	await bot.Write(message.chat.id, "Не могу вычислить выражение " + f);
		}
	};
	console.log("Начало работы");
	await bot.Listen();
	console.log("Работа завершена");
	//await new Promise(resolve => { setTimeout(resolve, 2000); } );
}

let server = new class
{
	async Call(gateway, method, list = { }, log = true)
	{
		let uri = "http://127.0.0.1:2020/" + method;
		let content = JSON.stringify(list);
		return new Promise((resolve, reject) =>
		{
			let request = http.request(uri);
			request.setHeader("gateway", gateway);
			request.setHeader("Content-Type", "text/plain;charset=UTF-8");
			request.setHeader("Content-Length", Buffer.byteLength(content));
			request.on("response", response =>
			{
				let data = "";
				response.on("data", chunk => {data += chunk;} );
				response.on("end", () =>
				{
					let json = JSON.parse(data);
					if (json && json.error)
					{
						if (log)
							service.log("" + gateway + "." + method +
									    "(" + content +
									    ") 🟥 " + data);
						reject(new Error("ОШИБКА СЕРВЕРА: " + json.error));
					}
					if (log)
						service.log("" + gateway + "." + method +
								    "(" + content +
								    ") 🟩 " + data);
					resolve(json);
				} );
			} );
			request.end(content);
		} );
	}
};

async function RunServer()
{
	service.Do = async function(work)
	{
		if (work.task == "version")
		{
			await server.Call("auth", "identify", {"device": "123"});
			return { "task": work.id,
					 "version": process.version };
		}
	};
	await service.Run();
}

RunBot();
RunServer();

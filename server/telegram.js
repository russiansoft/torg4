
const https = require("https");
const service = require("./service");

class TelegramBot
{
	constructor(token)
	{
		if (!token)
			throw "Отсутствует токен";
		this.token = token;
	}

	log(text)
	{
		if (!this.timer)
			this.timer = Date.now();
		let now = Date.now();
		let time = "" + (now - this.timer);
		this.timer = now;
		while (time.length < 6)
			time = " " + time;
		console.log("" + time + ":\t" + text);
	}

	query(method, parameters, handler)
	{
		if (!this.token)
			throw "Отсутствует токен";
		let content = JSON.stringify(parameters);
		let request = https.request("https://api.telegram.org/bot" + this.token + 
		                            "/" + method);
		request.setHeader("Content-Type", "application/json");
		request.setHeader("Content-Length", Buffer.byteLength(content));
		request.on("response", response =>
		{
			response.on("data", data =>
			{
				//this.log("Ответ:" + data.toString("utf8"));
				handler(data);
			} );
		} );
		request.end(content);
	}

	async Query(method, parameters = { } )
	{
		if (!this.token)
			throw new Error("Отсутствует токен");
		let uri = "https://api.telegram.org/bot" + this.token + "/" + method;
		let content = JSON.stringify(parameters);
		return new Promise((resolve, reject) =>
		{
			let request = https.request(uri);
			request.setHeader("Content-Type", "application/json");
			request.setHeader("Content-Length", Buffer.byteLength(content));
			request.on("response", response =>
			{
				let data = "";
				response.on("data", chunk => { data += chunk; } );
				response.on("end", () =>
				{
					service.log("Ответ Telegram:" + data);
					let json = JSON.parse(data);
					if (json.ok)
						resolve(json.result);
					else
						reject(new Error("(Telegram error) " + json.description));
				} );
			} );
			request.end(content);
		} );
	}

	async Write(chat, text)
	{
		console.log("Ответ для " + chat + ": " + text);
		await this.Query("sendMessage", { "chat_id": chat, "text": text } );
	}

	send(query)
	{
		// let button = { "text": "Нажми меня",
		//                "login_url": { "url": "https://xn--h1acbsggadkcs.xn--p1ai" } };
		// let markup = { "inline_keyboard": [ [ button ] ] };
		// this.query("sendMessage", { "chat_id": "1598562255", 
		//                             "text": "hi",
		// 							"reply_markup": markup }, answer => { } );
	}

	async Listen()
	{
		let last = null;
		let updates = await this.Query("getUpdates");
		if (updates.length)
		{
			last = updates[updates.length - 1].update_id;
			//this.log("Последнее обновление " + last);
		}
		while (true)
		{
			//this.log("Получение обновлений...");
			let parameters = { "timeout": 60 };
			if (last)
				parameters.offset = last + 1;
			let updates = await this.Query("getUpdates", parameters);
			if (updates.length)
			{
				last = updates[updates.length - 1].update_id;
				//this.log("Последнее обновление " + last);
			}
			for (let update of updates)
			{
				try
				{
					console.log("Сообщение от " + update.message.chat.id +
								" (" + update.message.chat.first_name + ") " +
								": " + update.message.text);
					if (!this.Answer)
						continue;
					await this.Answer(update.message);
				}
				catch (exception)
				{
					console.log("Ошибка обработки сообщения: " + exception);
					console.log(JSON.stringify(update));
				}
			}
		}
	}
};

module.exports = TelegramBot;


import {server, binding, database, review, auth, hive} from "./manuscript.js";

document.classes["telegram"] = class
{
	async Create()
	{
		await database.Begin();
		this.layout = await server.Layout("telegram.html");
		let values = {"ref": "tg://resolve?domain=svarka40_bot&start=" +
		                     auth.device};
		await this.layout.template().fill(values).Join(this);

		let qrcode = new QRCode(document.querySelector("#qrcode"));
		qrcode.makeCode(values.ref);

		let img = document.querySelector("#qrcode img");
		img.classList.add("img");
		img.classList.add("img-fluid");

		setInterval(this.Check, 1000);
	}

	async Check()
	{
		let result = await auth.call("identify", { "device": auth.device } );
		if (result.user)
		{
			//alert("Вы успешно вошли как " + result.title);
			location = "/";
		}
	}
};

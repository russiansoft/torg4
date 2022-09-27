
import { auth } from "./server.js";
import { database } from "./database.js";
import { server } from "./server.js";
import { Template } from "./template.js";
import { binding } from "./reactive.js";

document.classes["sot-footer"] = class SotFooter
{
	async Create()
	{
		let layout = await server.LoadHTML("подвал.html");
		await layout.template().Join(this);
	}
};

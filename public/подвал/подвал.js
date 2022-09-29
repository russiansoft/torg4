
import { auth } from "./server.js";
import { database } from "./database.js";
import { server } from "./server.js";
import { Template } from "./template.js";
import { binding } from "./reactive.js";

document.classes["footer-class"] = class
{
	async Create()
	{
		let layout = await server.LoadHTML("подвал.html");
		await layout.template().Join(this);
	}
};


import { auth } from "./server.js";
import { database } from "./database.js";
import { server } from "./server.js";
import { Template } from "./template.js";
import { binding } from "./reactive.js";

document.classes["sot-footer"] = class SotFooter
{
	async View()
	{
		let layout = await server.LoadHTML("подвал.html");
		let template = new Template(layout.querySelector("template"));
		await template.InsertInto(this);
	}
};

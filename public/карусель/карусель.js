
import { server } from "./server.js";
import { Template } from "./template.js";

document.classes["sot-carousel"] = class SotCarousel
{
	async View(parent)
	{
		let layout = await server.LoadHTML("карусель.html");
		let template = new Template(layout.querySelector("template"));
		await template.InsertInto(this);
	}
};

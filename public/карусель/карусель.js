
import { server } from "./server.js";
import { Template } from "./template.js";

document.classes["sot-carousel"] = class SotCarousel
{
	async View(parent)
	{
		let layout = await server.LoadHTML("карусель.html");
		await layout.template().Join(this);
	}
};

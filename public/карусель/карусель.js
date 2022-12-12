
import {server} from "./server.js";
import {Template} from "./template.js";

document.classes["carousel-class"] = class
{
	async Create()
	{
		let layout = await server.Layout("карусель.html");
		await layout.template().Join(this);
	}
};

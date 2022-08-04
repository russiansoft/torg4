
import { model } from "./model.js";
import { Layout } from "./template.js";

model.classes.Карусель = class Карусель
{
	async view(parent)
	{
		let layout = await new Layout().load("карусель.html");
		layout.template("#form").out(parent);
	}
};

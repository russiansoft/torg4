
import { model } from "./model.js";
import { binding } from "./reactive.js";
import { Layout } from "./template.js";

model.classes.Main = class
{
	async view(element)
	{
		// Переход по QR-коду
		let url = new URL(location);
		let type = url.searchParams.get("type");
		let id = url.searchParams.get("id");
		if (!type && id)
			location.replace("?type=Товар&Номенклатура=" + id);
		let layout = await new Layout().load("main.html");
		await layout.template("#form").fill(this).out(element);
		binding(element);
	}
};

model.classes.Подвал = class
{
	async view(element)
	{
		let layout = await new Layout().load("main.html");
		await layout.template("#footer").fill(this).out(element);
		binding(element);
	}
}
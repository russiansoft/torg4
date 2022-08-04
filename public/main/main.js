
import { model } from "./model.js";
import { binding } from "./reactive.js";
import { Layout } from "./template.js";

model.classes.Main = class Main
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
		await layout.template().fill(this).out(element);
		binding(element);
	}
};

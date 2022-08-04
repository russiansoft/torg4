
import { Database, database } from "./database.js";
import { model } from "./model.js";
import { Layout, Template } from "./template.js";
import { binding } from "./reactive.js";

model.classes.Администрирование = class Администрирование
{
	async view(element)
	{
		let layout = await new Layout().load("администрирование.html");
		await layout.template().fill(this).out(element);
		await binding(element);
	}

	async restart()
	{
		if (!confirm("Выполнить перезапуск приложения?"))
			return;
		await database.restart();
		alert("Приложение перезапущено. Страница будет обновлена.");
		location.replace(location);
	}
};

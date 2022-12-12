
import {server, auth, hive} from "./server.js";
import {Database, database} from "./database.js";
import {model} from "./model.js";
import "./template.js";
import {binding} from "./reactive.js";

document.classes["form-class"] = class
{
	async Create()
	{
		await auth.load();
		await layout.template().fill(this).Join(this);
		//await binding(element);
	}

	async Перезапуск()
	{
		if (!confirm("Выполнить перезапуск приложения?"))
			return;
		await database.restart();
		alert("Приложение перезапущено. Страница будет обновлена.");
		location.replace(location);
	}
};

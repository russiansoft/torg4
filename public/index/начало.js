
import {server, binding, database, review, auth, hive} from "./manuscript.js";
import "./client.js";

document.classes["начало"] = class
{
	async Create()
	{
		// Переход по QR-коду
		let url = new URL(location);
		let id = url.searchParams.get("id");
		if (id)
			location.replace("товар?Номенклатура=" + id);

		// Аутентификация
		await auth.load();

		// Начало транзакции
		await database.Begin();

		let html = await server.Layout("начало.html");
		await html.template().Join(this);
		// binding(element);
	}
};

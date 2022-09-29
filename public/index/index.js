
import { server, auth, hive } from "./server.js";
import { Database, database } from "./database.js";
import "./client.js";

document.classes["form-class"] = class
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
		await database.transaction();

		await document.template().Join(this);
		// binding(element);
	}
};

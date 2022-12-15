import {server, database, hive, auth} from "./manuscript.js";
import {cart} from "./cart.js";

document.classes["управление-корзиной"] = class
{
	async Create()
	{
		await database.Begin();
		this.layout = await server.Layout("управление-корзиной.html");
		await this.layout.template("#form").fill(this).Join(this);
		this.user = document.get("#user");
	}

	async Заполнить()
	{
		await database.Rebase();
		document.get("main").innerHTML = "";
		let query = {"from": "ПокупкаПорядок",
					 "where": {"Пользователь": this.user.value},
					 "filter": {"deleted": ""}};
		let records = await database.select(query);
		for (let id of records)
		{
			let entry = await database.find(id);
			let record = await database.find(entry.Номенклатура);
			await this.layout.template("#card").fill(entry).fill(record).Join("main");
		}
	}

	async УстановитьПользователя()
	{
		let changes = [];
		for (let child of document.get("main").children)
			changes.push({"id": child.dataset.id, "Пользователь": this.user.value});
		await database.save(changes);
		await database.commit();
	}
}
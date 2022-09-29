
import { Database, database } from "./database.js";
import { server, auth, hive } from "./server.js";
import { Template } from "./template.js";
import { cart } from "./cart.js";
import "./покупка.js";
import "./pagination.js";
import "./client.js";

document.classes["form-class"] = class
{
	async Create()
	{
		// Аутентификация
		await auth.load();

		// Начало транзакции
		await database.transaction();

		await document.template("#form").fill(this).Join(this);
		//await binding(element);
		this.Заполнить();
		document.get("input#search").focus();
	}

	async Заполнить(очистить = true)
	{
		let pagination = document.querySelector(".pagination-class");
		let button = document.querySelector("button#fill");
		button.classList.add("disabled");
		if (очистить)
		{
			document.querySelector("#cards").innerHTML = "";
			pagination.reset();
		}
		let db = null;
		try
		{
			db = await new Database().transaction();
		}
		catch
		{
			await document.template("#restricted").Join("main");
			return;
		}
		let query =  { "from": "Номенклатура" };
		let search = document.querySelector("#search").value;
		if (search)
			query.search = search;
		pagination.split(query);
		let records = await db.select(query);
		for (let id of records)
		{
			await database.find(id); // Для команды "В корзину"

			let record = await db.find(id);
			record.Артикул = ("" + record.Артикул).trim();
			if (!record.Артикул)
				record.Артикул = "(нет)";
			let template = document.template("#card");
			template.fill(record);

			let file = record.Изображение;
			if (file)
			{
				let attributes = { };
				for (let part of file.split("|"))
				{
					if (!part)
						continue;
					let pair = part.split(":");
					attributes[pair[0]] = pair[1];
				}
				attributes.address = attributes.address.replace(/\\/g, "/");
				//let base64 = await hive.get(attributes.address);
				let base64 = await hive.image(attributes.address, 300, 300);
				let image = "data:image/png;base64," + base64.content;
				template.fill( { "image": image } );
			}
			else
				template.fill( { "image": "nophoto.png" } );
			await template.Join(document.querySelector("#cards"));

			await this.ОбновитьЭлемент(db, id);
			pagination.add();
		}
		await pagination.Request(db);
		button.classList.remove("disabled");
	}

	async More()
	{
		await this.Заполнить(false);
	}

	async ОбновитьЭлемент(db, id)
	{
		let покупка = await db.find( { "from": "Покупка",
									   "where": { "Пользователь": auth.account },
									   "filter": { "Номенклатура": id, "deleted": "" } } );
		document.querySelector("#buying-" + id).show(покупка == null);
		document.querySelector("#buyed-" + id).show(покупка != null);
		if (покупка != null)
		{
			let template = document.template("#buyed");
			template.fill(покупка);
			let item = await db.find(id);
			template.fill(item);
			await template.Join("#buyed-" + id);
		}
	}
};

document.classes["item-class"] = class
{
	async ВКорзину()
	{
		let id = this.dataset.id;
		console.log("item-class.ВКорзину id " + id);
		if (!await cart.find(id))
			await cart.add(id);
		let db = await new Database().transaction();
		document.body.ОбновитьЭлемент(db, id);
	}
}

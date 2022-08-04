
import { Database, database } from "./database.js";
import { auth, hive } from "./server.js";
import { model } from "./model.js";
import { binding } from "./reactive.js";
import { Layout, Template } from "./template.js";
import { cart } from "./cart.js";
import { form } from "./form.js";
import "./покупка.js";
import "./номенклатура.js";
import "./paginator.js";

model.classes.Товары = class Товары
{
	async view(element)
	{
		let layout = await new Layout().load("товары.html");
		let template = layout.template("#form");
		template.fill(this);
		await template.out(element);
		await binding(element);
		this.Заполнить();
		let search = document.find("input#search");
		let button = document.find("button#fill");
		search.addEventListener("keydown", (event) =>
		{
			if (event.key == "Enter")
				button.click();
		} );
		search.focus();
	}

	async Заполнить(очистить = true)
	{
		let layout = await new Layout().load("товары.html");
		let paginator = await database.get(this.id + ".Paginator");
		let button = document.find("button#fill");
		button.classList.add("disabled");
		if (очистить)
			paginator.clear();
		let db = null;
		try
		{
			db = await new Database().transaction();
		}
		catch
		{
			new Template("#restricted").out("main");
			return;
		}
		let query =  { "from": "Номенклатура" };
		let search = document.find("#search").value;
		if (search)
			query.search = search;
		paginator.split(query);
		let records = await db.select(query);
		for (let id of records)
		{
			await database.find(id); // Для команды "В корзину"

			let record = await db.find(id);
			record.Артикул = ("" + record.Артикул).trim();
			if (!record.Артикул)
				record.Артикул = "(нет)";
			let template = layout.template("#card").fill(record);

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
				let base64 = await hive.get(attributes.address);
				let image = "data:image/jpeg;base64," + base64.content;
				template.fill( { "image": image } );
			}
			else
				template.fill( { "image": "nophoto.png" } );
			template.out("main");

			await this.ОбновитьЭлемент(db, id);
			paginator.add();
		}
		await paginator.request(db);
		button.classList.remove("disabled");
	}

	async more()
	{
		await this.Заполнить(false);
	}

	async ОбновитьЭлемент(db, id)
	{
		let покупка = await db.find( { "from": "Покупка",
									   "where": { "Пользователь": auth.account },
									   "filter": { "Номенклатура": id, "deleted": "" } } );
		document.find("#buying-" + id).show(покупка == null);
		document.find("#buyed-" + id).show(покупка != null);
		if (покупка != null)
		{
			let layout = await new Layout().load("товары.html");
			let template = layout.template("#buyed");
			template.fill(покупка);
			let item = await db.find(id);
			template.fill(item);
			template.out("#buyed-" + id);
		}
	}
};

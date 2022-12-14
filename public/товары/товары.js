
import {server, database, hive, auth} from "./manuscript.js";
import {cart} from "./cart.js";

document.classes["товары"] = class
{
	async Create()
	{
		await database.Begin();
		this.layout = await server.Layout("товары.html");
		await this.layout.template("#form").fill(this).Join(this);
		this.Заполнить();
		document.get("input#search").focus();
	}

	async Заполнить(очистить = true)
	{
		let pagination = document.get("[data-class='pagination']");
		let button = document.querySelector("button#fill");
		button.classList.add("disabled");
		if (очистить)
			pagination.reset("#cards");
		try
		{
			database.Rebase();
		}
		catch
		{
			await this.layout.template("#restricted").Join("main");
			return;
		}
		let query = {"from": "Номенклатура"};
		let search = document.querySelector("#search").value;
		if (search)
			query.search = search;
		pagination.split(query);
		let records = await database.select(query);
		for (let id of records)
		{
			await database.find(id); // Для команды "В корзину"

			let record = await database.find(id);
			record.Артикул = ("" + record.Артикул).trim();
			if (!record.Артикул)
				record.Артикул = "(нет)";
			let template = this.layout.template("#card");
			template.fill(record);

			let file = record.Изображение;
			if (file)
			{
				let attributes = {};
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
				template.fill({"image": image});
			}
			else
				template.fill({"image": "nophoto.png"});
			await template.Join(document.querySelector("#cards"));

			await this.ОбновитьЭлемент(id);
			pagination.add();
		}
		await pagination.Request(database);
		button.classList.remove("disabled");
	}

	async More()
	{
		await this.Заполнить(false);
	}

	async ОбновитьЭлемент(id)
	{
		let покупка = await database.find({"from": "Покупка",
									       "where": {"Пользователь": auth.user},
									       "filter": {"Номенклатура": id, "deleted": ""}});
		document.querySelector("#buying-" + id).show(покупка == null);
		document.querySelector("#buyed-" + id).show(покупка != null);
		if (покупка != null)
		{
			let template = this.layout.template("#buyed");
			template.fill(покупка);
			let item = await database.find(id);
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
		if (!await cart.find(id))
			await cart.add(id);
		database.Rebase();
		document.body.ОбновитьЭлемент(id);
	}
}


import {server, binding, database, review, auth, hive} from "./manuscript.js";
import {cart} from "./cart.js";
import "./client.js";
import "./покупка.js";

document.classes["корзина"] = class
{
	async Create()
	{
		await database.Begin();

		this.layout = await server.Layout("корзина.html");
		await this.layout.template("#form").fill(this).Join(this);
		//await binding(element);
		this.Заполнить();
	}

	async Заполнить()
	{
		await database.Rebase();
		document.querySelector("main").innerHTML = "";
		let query = {"from": "ПокупкаПорядок",
					 "where": {"Пользователь": auth.account},
					 "filter": {"deleted": ""}};
		let records = await database.select(query);
		for (let id of records)
		{
			await database.find(id); // Для команд

			let entry = await database.find(id);
			let template = this.layout.template("#card").fill(entry);

			if (entry.Номенклатура)
			{
				let record = await database.find(entry.Номенклатура);
				if (!record)
					continue;
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
					let base64 = await hive.get(attributes.address);
					let image = "data:image/jpeg;base64," + base64.content;
					template.fill({"image": image});
				}
				else
					template.fill({"image": "nophoto.png"});
			}
			await template.Join("main");
		}
		let has = records.length > 0;
		document.get("a[href='этикетки']").enable(has);
		document.get("button[data-cmd='Инвентаризация']").enable(has);
		document.get("button[data-cmd='Очистить']").enable(has);
	}

	async Инвентаризация()
	{
		if (!confirm("Создать инвентаризацию по выбранным товарам?"))
			return;
		await database.Begin();
		let doc = await database.create("Инвентаризация");
		// await database.save( [ {"id": doc.id, "ИнвентаризацияОформлен": "1"} ] );
		let query = {"from": "ПокупкаПорядок",
					  "where" : {"Пользователь" : auth.account},
					  "filter" : {"deleted": ""}};
		let records = await database.select(query);
		for (let id of records)
		{
			let entry = await database.find(id);
			let values = {"Номенклатура": entry.Номенклатура,
						   "Количество": "" + entry.Количество};
			let line = await database.add(doc.id, "Строки", values);
		}
		await database.commit();
		alert("Создан документ Инвентаризация");
	}

	async Очистить()
	{
		if (!confirm("Очистить корзину?"))
			return;
		await cart.clear();
		this.Заполнить();
	}

	async Удалить()
	{
		this.Заполнить();
	}
};


import { Database, database } from "./database.js";
import { server, auth, hive } from "./server.js";
import { model } from "./model.js";
import { binding } from "./reactive.js";
import "./template.js";
import { cart } from "./cart.js";

document.classes.form = class Form
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
	}

	async Заполнить()
	{
		let db = await new Database().transaction();
		let layout = await server.LoadHTML("корзина.html");
		document.querySelector("main").innerHTML = "";
		let query =  { "from": "ПокупкаПорядок",
					   "where" : { "Пользователь" : auth.account },
					   "filter" : { "deleted": "" }	};
		let records = await db.select(query);
		for (let id of records)
		{
			await database.find(id); // Для команд

			let entry = await db.find(id);
			let template = layout.template("#card").fill(entry);

			if (entry.Номенклатура)
			{
				let record = await db.find(entry.Номенклатура);
				if (!record)
					continue;
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
					let base64 = await hive.get(attributes.address);
					let image = "data:image/jpeg;base64," + base64.content;
					template.fill( { "image": image } );
				}
				else
					template.fill( { "image": "nophoto.png" } );
			}
			await template.Join("main");
		}
	}

	async Инвентаризация()
	{
		if (!confirm("Создать инвентаризацию по выбранным товарам?"))
			return;
		await database.transaction();
		let doc = await database.create("Инвентаризация");
		// await database.save( [ { "id": doc.id, "ИнвентаризацияОформлен": "1" } ] );
		let query = { "from": "ПокупкаПорядок",
					  "where" : { "Пользователь" : auth.account },
					  "filter" : { "deleted": "" } };
		let records = await database.select(query);
		for (let id of records)
		{
			let entry = await database.find(id);
			let values =
			{
				"Номенклатура": entry.Номенклатура,
				"Количество": "" + entry.Количество
			};
			let line = await database.add(doc.id, "Строки", values);
		}
		await database.commit();
		alert("Создан документ Инвентаризация");
	}

	async Очистить()
	{
		await cart.clear();
		this.Заполнить();
	}

	async Удалить()
	{
		this.Заполнить();
	}

	async Загрузка()
	{
		Заполнить();
	}
};

model.classes.Инвентаризация = class Инвентаризация
{
}

model.classes["Инвентаризация-Строка"] = class Инвентаризация_Строка
{
}

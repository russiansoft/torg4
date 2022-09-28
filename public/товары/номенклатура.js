
import { FileDialog } from "./client.js";
import { Database, database } from "./database.js";
import { Template } from "./template.js";
import { auth, hive } from "./server.js";
import { model } from "./model.js";
//import { form } from "./form.js";
import { review } from "./reactive.js";
import { cart } from "./cart.js";

document.classes["form-class"] = class
{
	async Create()
	{
		// Аутентификация
		await auth.load();

		// Начало транзакции
		await database.transaction();

		// Получение идентификатора
		let url = new URL(location);
		this.dataset.id = url.searchParams.get("id");

		// Получение экземпляра объекта
		let object = await database.find(this.dataset.id);

		await document.template("template#form").fill(object).Join(this);
		await review(this);
		await this.ВывестиГлавноеИзображение();
		await this.ВывестиДополнительныеИзображения();
	}

	async ПолучитьДанныеИзображения(value)
	{
		if (!value)
			return "";
		let attributes = { };
		for (let part of value.split("|"))
		{
			if (!part)
				continue;
			let pair = part.split(":");
			attributes[pair[0]] = pair[1];
		}
		attributes.address = attributes.address.replace(/\\/g, "/");
		let base64 = await hive.get(attributes.address);
		let data = "data:image/jpeg;base64," + base64.content;
		return data;
	}

	async СохранитьДанныеИзображения(name, type, data)
	{
		let extension = "";
		let point = name.lastIndexOf(".");
		if (point != -1)
			extension = name.slice(point + 1);
		let result = await hive.put(data, extension);
		let value = "name:" + name;
		if (type)
			value += "|type:" + type;
		value += "|address:" + result.address + "|";
		return value;
	}

	async Записать()
	{
		await database.commit();
		close();
	}

	async ВывестиГлавноеИзображение()
	{
		let object = await database.find(this.dataset.id);
		let data = await this.ПолучитьДанныеИзображения(object.Изображение);
		if (data)
		{
			let template = document.template("template#image");
			template.fill( { "src": data } );
			await template.Spawn("section#primary");
		}
		else
		{
			let template = document.template("template#no-image");
			await template.Spawn("section#primary");
		}
		document.get("button[data-cmd='ВыбратьГлавноеИзображение']").show(!data);
		document.get("button[data-cmd='УдалитьГлавноеИзображение']").show(data);
	}

	async ВыбратьГлавноеИзображение()
	{
		new FileDialog().show(async (file) =>
		{
			let value = await this.СохранитьДанныеИзображения(file.name, file.type, file.data);
			await database.save( [ { "id": this.dataset.id, "Изображение": value } ] );
			await this.ВывестиГлавноеИзображение();
		} );
	}

	async УдалитьГлавноеИзображение()
	{
		await database.save( [ { "id": this.dataset.id, "Изображение": "" } ] );
		await this.ВывестиГлавноеИзображение();
	}

	async ВывестиДополнительныеИзображения()
	{
		document.get("section#secondary").innerHTML = "";
		let query = { "from": "owner",
			          "where": { "owner": this.dataset.id },
                      "filter": { "deleted": "" } };
		let has = false;
		for (let id of await database.select(query))
		{
			let эскиз = await database.find(id);
			let data = await this.ПолучитьДанныеИзображения(эскиз.Изображение);
			if (!data)
				continue;
			let template = document.template("template#image");
			template.fill( { "src": data } );
			await template.Join("section#secondary");
			has = true;
		}
		document.get("button[data-cmd='ОчиститьДополнительныеИзображения']").enable(has);
	}

	async ДобавитьДополнительноеИзображение()
	{
		new FileDialog().show(async (file) =>
		{
			let value = await this.СохранитьДанныеИзображения(file.name, file.type, file.data);
			await database.add(this.dataset.id, "Эскизы", { "Изображение": value } );
			await this.ВывестиДополнительныеИзображения();
		} );
	}

	async ОчиститьДополнительныеИзображения()
	{
		let changes = [ ];
		let query = { "from": "owner",
			          "where": { "owner": this.dataset.id } };
		for (let id of await database.select(query))
			changes.push( { "id": id, "deleted": "1" } );
		await database.save(changes);
		await this.ВывестиДополнительныеИзображения();
	}
};

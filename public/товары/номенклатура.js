
import {server, binding, database, review, auth} from "./manuscript.js";
import {FileDialog, ПолучитьДанныеИзображения,
        СохранитьДанныеИзображения} from "./client.js";
import {cart} from "./cart.js";

document.classes["номенклатура"] = class
{
	async Create()
	{
		await database.Begin();

		// Получение идентификатора
		let url = new URL(location);
		this.dataset.id = url.searchParams.get("id");

		// Получение экземпляра объекта
		let object = await database.find(this.dataset.id);

		this.layout = await server.Layout("номенклатура.html");
		await this.layout.template("#form").fill(object).Join(this);
		await review(this);
		await this.ВывестиГлавноеИзображение();
		await this.ВывестиДополнительныеИзображения();
	}

	async Записать()
	{
		await database.commit();
		close();
	}

	async ВывестиГлавноеИзображение()
	{
		let object = await database.find(this.dataset.id);
		let data = await ПолучитьДанныеИзображения(object.Изображение);
		if (data)
		{
			let template = this.layout.template("#image");
			template.fill({"src": data});
			await template.Join("section#primary", true);
		}
		else
		{
			let template = this.layout.template("#no-image");
			await template.Join("section#primary", true);
		}
		document.get("button[data-cmd='ВыбратьГлавноеИзображение']").show(!data);
		document.get("button[data-cmd='УдалитьГлавноеИзображение']").show(data);
	}

	async ВыбратьГлавноеИзображение()
	{
		new FileDialog().show(async (file) =>
		{
			let value = await СохранитьДанныеИзображения(file.name, file.type, file.data);
			await database.save([{"id": this.dataset.id, "Изображение": value}]);
			await this.ВывестиГлавноеИзображение();
		});
	}

	async УдалитьГлавноеИзображение()
	{
		await database.save([{"id": this.dataset.id, "Изображение": ""}]);
		await this.ВывестиГлавноеИзображение();
	}

	async ВывестиДополнительныеИзображения()
	{
		document.get("section#secondary").innerHTML = "";
		let query = {"from": "owner",
			         "where": {"owner": this.dataset.id},
                     "filter": {"deleted": ""}};
		let has = false;
		for (let id of await database.select(query))
		{
			let эскиз = await database.find(id);
			let data = await ПолучитьДанныеИзображения(эскиз.Изображение);
			if (!data)
				continue;
			let template = this.layout.template("#image");
			template.fill({"src": data});
			await template.Join("section#secondary");
			has = true;
		}
		document.get("button[data-cmd='ОчиститьДополнительныеИзображения']").enable(has);
	}

	async ДобавитьДополнительноеИзображение()
	{
		new FileDialog().show(async (file) =>
		{
			let value = await СохранитьДанныеИзображения(file.name, file.type, file.data);
			await database.add(this.dataset.id, "Эскизы", {"Изображение": value});
			await this.ВывестиДополнительныеИзображения();
		});
	}

	async ОчиститьДополнительныеИзображения()
	{
		let changes = [ ];
		let query = {"from": "owner", "where": {"owner": this.dataset.id}};
		for (let id of await database.select(query))
			changes.push({"id": id, "deleted": "1"});
		await database.save(changes);
		await this.ВывестиДополнительныеИзображения();
	}
};

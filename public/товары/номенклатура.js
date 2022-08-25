
import { FileDialog } from "./client.js";
import { Database, database } from "./database.js";
import { Layout, Template } from "./template.js";
import { hive } from "./server.js";
import { model } from "./model.js";
import { form } from "./form.js";
import { binding } from "./reactive.js";
import { cart } from "./cart.js";

model.classes.Номенклатура = class Номенклатура
{
	async view(element)
	{
		let layout = await new Layout().load("номенклатура.html");
		let template = layout.template();
		template.fill(form.object);
		await template.out(element);
		await binding(element);
		//document.find("#title").innerHTML = form.object.title;
		await this.ВывестиИзображения();
	}

	async ВКорзину()
	{
		console.log("add in cart:" + this.id);
		if (!await cart.find(this.id))
			await cart.add(this.id);
		let db = await new Database().transaction();
		form.object.ОбновитьЭлемент(db, this.id);

	}

	async Записать()
	{
		await database.commit();
		close();
	}

	async Выбрать()
	{
		new FileDialog().show(async function(file)
		{
			let extension = "";
			let point = file.name.lastIndexOf(".");
			if (point != -1)
				extension = file.name.slice(point + 1);
			
			let result = await hive.put(file.data, extension);
			let value = "name:" + file.name;
			if (file.type) 
				value += "|type:" + file.type;
			value += "|address:" + result.address + "|";

			await database.save( [ { "id": form.object.id, "Изображение": value } ] );
			await form.object.ВывестиИзображения();
		} );
	}

	async Добавить()
	{
		new FileDialog().show(async function(file)
		{
			let extension = "";
			let point = file.name.lastIndexOf(".");
			if (point != -1)
				extension = file.name.slice(point + 1);
			
			let result = await hive.put(file.data, extension);
			let value = "name:" + file.name;
			if (file.type) 
				value += "|type:" + file.type;
			value += "|address:" + result.address + "|";

			await database.add(form.object.id, "Эскизы", { "Изображение": value } );
			await form.object.ВывестиИзображения();
		} );
	}

	async Удалить()
	{
		await database.save( [ { "id": form.object.id, "Изображение": "" } ] );
		await this.ВывестиИзображения();
	}

	async ВывестиИзображения(value)
	{
		let values = [form.object.Изображение];
		let query =
		{
			"from": "owner",
			"where":
			{
				"owner": form.object.id
			}
		};
		for (let id of await database.select(query))
		{
			let эскиз = await database.find(id);
			values.push(эскиз.Изображение);
		}
		let order = -1;
		for (let value of values)
		{
			order++;

			let src = "";
			if (value)
			{
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
				let image = "data:image/jpeg;base64," + base64.content;
				src = image;
			}
			//else
			//	document.find("#image").src = "";

			let layout = await new Layout().load("номенклатура.html");
			let template = layout.template("#image");

			template.fill( { "id": "image" + order } );
			await template.out("#images");
			let img = document.find("#image" + order + " img");
			img.src = src;

			document.find("#choose").show(!value);
			document.find("#delete").show(value);
		}
	}
};

model.classes.Эскиз = class Эскиз
{
};

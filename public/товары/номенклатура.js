
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
		await this.ВывестиИзображение(form.object.Изображение);
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
			await form.object.ВывестиИзображение(value);
		} );
	}

	async Удалить()
	{
		await database.save( [ { "id": form.object.id, "Изображение": "" } ] );
		await this.ВывестиИзображение("");
	}

	async ВывестиИзображение(value)
	{
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
			document.find("#image").src = image;
		}
		else
			document.find("#image").src = "";
		document.find("#choose").show(!value);
		document.find("#delete").show(value);
	}
};


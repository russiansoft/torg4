
import { model } from "./model.js";
import { Template } from "./template.js";
import { binding } from "./reactive.js";
import { Database, database } from "./database.js";
import { auth, hive } from "./server.js";
import { cart } from "./cart.js";
import "./client.js";

document.classes.content = class
{
	async Create()
	{
		// Аутентификация
		await auth.load();

		// Начало транзакции
		await database.transaction();

		let url = new URL(location);
		if (!url.searchParams.has("Номенклатура"))
			return;
		let id = url.searchParams.get("Номенклатура");
		let record = await database.find(id);

		let template = new Template(document.querySelector("#form"));
		template.fill( { "товар": this.id } );

		//document.title = record.title;

		//record.Описание = record.Описание.replace(/\n/g, "<br/>");

		let money = Intl.NumberFormat("ru", { "style": "currency", "currency": "RUB" } );
		template.fill( { "Цена": money.format(record.Цена) } );

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
			let base64 = await hive.image(attributes.address, 600, -1);
			let image = "data:image/png;base64," + base64.content;
			template.fill( { "image": image } );
		}

		let qr = "https://xn--40-6kcai3c0bf.xn--p1ai/?id=" + record.id;
		template.fill( { "qr": qr } );

		await template.Join(this);
		//await binding(element);

		let qrcode = new QRCode(document.querySelector("#qrcode"));
		qrcode.makeCode(qr);

		this.Обновить();
	}

	async ВКорзину()
	{
		let url = new URL(location);
		if (!url.searchParams.has("Номенклатура"))
			return;
		let id = url.searchParams.get("Номенклатура");
		if (!await cart.find(id))
			await cart.add(id);
		await database.transaction();
		this.Обновить();
	}

	async Обновить()
	{
		let url = new URL(location);
		if (!url.searchParams.has("Номенклатура"))
			return;
		let id = url.searchParams.get("Номенклатура");
		let покупка = await database.find( { "from": "Покупка",
											 "where": { "Пользователь": auth.account },
											 "filter": { "Номенклатура": id,
														 "deleted": "" } } );
		document.querySelector("#buying-" + id).show(покупка == null);
		document.querySelector("#buyed-" + id).show(покупка != null);
		if (покупка != null)
		{
			let template = document.template("#buyed");
			template.fill(покупка);
			let item = await database.find(id);
			template.fill(item);
			await template.Join("#buyed-" + id);
		}
	}
}

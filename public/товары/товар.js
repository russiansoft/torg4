
import {server, binding, database, review, auth} from "./manuscript.js";
import {cart} from "./cart.js";
import {ПолучитьДанныеИзображения} from "./client.js";

document.classes["товар"] = class
{
	async Create()
	{
		await database.Begin();

		let url = new URL(location);
		if (!url.searchParams.has("Номенклатура"))
			return;
		let id = url.searchParams.get("Номенклатура");
		let record = await database.find(id);

		let layout = await server.Layout("товар.html");
		let template = layout.template("#form");
		template.fill({"товар": this.id});

		//document.title = record.title;

		//record.Описание = record.Описание.replace(/\n/g, "<br/>");

		let money = Intl.NumberFormat("ru", {"style": "currency", "currency": "RUB"});
		template.fill({"Цена": money.format(record.Цена)});

		template.fill(record);

		//let image = await ПолучитьДанныеИзображения(record.Изображение, 600, -1);
		//if (image)
		//	template.fill({"image": image});

		let qr = "https://xn--40-6kcai3c0bf.xn--p1ai/?id=" + record.id;
		template.fill({"qr": qr});

		await template.Join(this);
		//await binding(element);

		let images = [];
		if (record.Изображение)
			images.push(record.Изображение);
		let query = {"from": "owner",
			          "where": {"owner": id},
                      "filter": {"deleted": ""}};
		for (let id of await database.select(query))
		{
			let эскиз = await database.find(id);
			if (эскиз.Изображение)
				images.push(эскиз.Изображение);
		}
		for (let image of images)
		{
			let data = await ПолучитьДанныеИзображения(image, 100, -1);
			let template = layout.template("#image-list-item");
			template.fill({"image": image, "src": data});
			await template.Join("section#image-list");
		}
		document.get("section#image-list").show(images.length > 1);

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
		await database.Begin();
		this.Обновить();
	}

	async Обновить()
	{
		let layout = await server.Layout("товар.html");
		let url = new URL(location);
		if (!url.searchParams.has("Номенклатура"))
			return;
		let id = url.searchParams.get("Номенклатура");
		let покупка = await database.find({"from": "Покупка",
											 "where": {"Пользователь": auth.user},
											 "filter": {"Номенклатура": id,
														 "deleted": ""}});
		document.querySelector("#buying-" + id).show(покупка == null);
		document.querySelector("#buyed-" + id).show(покупка != null);
		if (покупка != null)
		{
			let template = layout.template("#buyed");
			template.fill(покупка);
			let item = await database.find(id);
			template.fill(item);
			await template.Join("#buyed-" + id);
		}
	}
}

document.classes["thumbnail-class"] = class
{
	async Create()
	{
		if (document.querySelectorAll(".selected-image").length)
			return;
		await this.ПереключитьИзображение();
	}

	async ПереключитьИзображение()
	{
		let layout = await server.Layout("товар.html");
		document.get("section#image-box").innerHTML = "";
		let data = await ПолучитьДанныеИзображения(this.dataset.image);
		let template = layout.template("#image-item");
		template.fill({"src": data});
		await template.Join("section#image-box");

		for (let item of document.querySelectorAll(".thumbnail-class"))
			item.classList.remove("selected-image");
		this.classList.add("selected-image");
	}
}

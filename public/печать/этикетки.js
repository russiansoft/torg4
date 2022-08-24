
import { model } from "./model.js";
import { Database, database } from "./database.js";
import { auth, hive } from "./server.js";
import { Layout, Template } from "./template.js";
import { binding } from "./reactive.js";
import { Sheet } from "./sheet.js";

model.classes.Этикетки = class Этикетки
{
	async view(element)
	{
		this.images = [];
		let layout = await new Layout().load("этикетки.html");
		let template = layout.template("#form");
		template.fill(this);
		await template.out(element);
		await binding(element);

		let query =  { "from": "ПокупкаПорядок",
					   "where" : { "Пользователь" : auth.account },
					   "filter" : { "deleted": "" }	};
		let records = await database.select(query);
		for (let id of records)
		{
			let entry = await database.find(id);
			let record = await database.find(entry.Номенклатура);
			if (document.querySelector("#qrcode-" + record.id))
				continue;
			let template = layout.template("#label");
			template.fill(record);

			await template.out("tbody");

			let qr = "https://xn--40-6kcai3c0bf.xn--p1ai/?id=" + record.id;
			let qrcode = new QRCode(document.find("#qrcode-" + record.id));
			qrcode.makeCode(qr);

			let img = document.find("#qrcode-" + record.id + " img");
			img.classList.add("img-fluid");
			this.images.push(img);

			// if (img.src == "")
			// 	throw "Пустая картинка";
		}
		setTimeout(async () => { await this.ОжиданиеКартинок(); } , 100);
	}

	async ОжиданиеКартинок()
	{
		let ready = true;
		for (let image of this.images)
		{
			if (image.src == "")
			{
				ready = false;
				break;
			}
		}
		if (ready)
		{
			await this.Печать();
			document.find("#hourglass").show(false);
			document.find("#print").show(true);
			document.find("table").show(true);
		}
		else
			setTimeout(ОжиданиеКартинок, 100);
	}

	async Печать()
	{
		let source = document.find("main").innerHTML;
		let sheet = new Sheet();
		let worksheet = await sheet.worksheet(source);

		let a = document.find("#print"); //document.createElement("a");
		a.download = "test.xlsx";
		let type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
		a.href = "data:" + type + ";base64," + worksheet;
	}
}


import {server, auth, hive, FileDialog, database, review, Sheet} from "./manuscript.js";

document.classes["этикетки"] = class
{
	async Create()
	{
		await database.Begin();

		this.images = [];
		let layout = await server.Layout("этикетки.html");
		let template = layout.template("#form");
		template.fill(this);
		await template.Join(this);
		let query =  {"from": "ПокупкаПорядок",
					  "where": {"Пользователь" : auth.user},
					  "filter": {"deleted": ""}};
		let records = await database.select(query);
		for (let id of records)
		{
			let entry = await database.find(id);
			let record = await database.find(entry.Номенклатура);
			if (document.querySelector("#qrcode-" + record.id))
				continue;
			let template = layout.template("#label");
			template.fill(record);

			await template.Join("tbody");

			let qr = "https://xn--40-6kcai3c0bf.xn--p1ai/?id=" + record.id;
			let qrcode = new QRCode(document.querySelector("#qrcode-" + record.id));
			qrcode.makeCode(qr);

			let img = document.querySelector("#qrcode-" + record.id + " img");
			img.classList.add("img-fluid");
			this.images.push(img);

			// if (img.src == "")
			// 	throw "Пустая картинка";
		}
		setTimeout(async () => {await this.ОжиданиеКартинок();} , 100);
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
			document.querySelector("#hourglass").show(false);
			document.querySelector("#print").show(true);
			document.querySelector("table").show(true);
		}
		else
			setTimeout(ОжиданиеКартинок, 100);
	}

	async Печать()
	{
		let source = document.querySelector("main").innerHTML;
		let sheet = new Sheet();
		let worksheet = await sheet.worksheet(source);

		let a = document.querySelector("#print"); //document.createElement("a");
		a.download = "test.xlsx";
		let type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
		a.href = "data:" + type + ";base64," + worksheet;
	}
}

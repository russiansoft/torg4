
async function Сформировать()
{
	await database.begin();
	let query =  { "from": "ПокупкаПорядок",
		           "where": { "Пользователь": auth.account },
		           "filter": { "deleted": "" }	};
	let records = await database.select(query);
	let rows = [];
	let row = null;
	for (let id of records)
	{
		if (!row)
		{
			row = [];
			rows.push(row);
		}
		let entry = await database.find(id);
		let record = await database.find(entry.Номенклатура);
		row.push(record);
		if (row.length == 3)
			row = null;
	}
	if (row)
	{
		while (row.length < 3)
			row.push( { "id": "", "title": "", "Код": "" } );
	}
	for (let row of rows)
	{
		let data = {};
		for (let i in row)
		{
			let record = row[i];
			if (!record.id)
				continue;
			data["id" + i] = record.id;
			data["title" + i] = record.title;
			data["Организация" + i] = "СВАРОПТТОРГ";
			data["Ссылка" + i] = "сварка40.рф";
			data["Код" + i] = record.Код;
		}
		
		let template = new Template("template");
		template.fill(data);
		template.out("tbody");

		for (let i in row)
		{
			let record = row[i];
			if (!record.id)
				continue;
			let qr = "https://xn--40-6kcai3c0bf.xn--p1ai/?id=" + record.id;
			let qrcode = new QRCode(element("#qrcode-" + record.id));
			qrcode.makeCode(qr);
			let img = element("#qrcode-" + record.id + " img");
			img.classList.add("img-fluid");
		}
	}
}

async function Печать()
{
	let source = element("main").innerHTML;
	let layout = new Layout();
	let worksheet = await layout.worksheet(source);

	let a = document.createElement("a");
    a.download = "test.xlsx";
	let type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    a.href = "data:" + type + ";base64," + worksheet;
    a.click();
}

async function Загрузка()
{
	Сформировать();
}

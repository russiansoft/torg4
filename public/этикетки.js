
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
	await dataset.begin();
	let query =  { "from": "ПокупкаПорядок",
		           "where" : { "Пользователь" : auth.account },
		           "filter" : { "deleted": "" }	};
	let records = await dataset.select(query);
	for (let id of records)
	{
		let entry = await dataset.find(id);
		let record = await dataset.find(entry.Номенклатура);
		let template = new Template("template");
		template.fill(record);

		template.out("tbody");

		let qr = "https://xn--40-6kcai3c0bf.xn--p1ai/?id=" + record.id;
		let qrcode = new QRCode(element("#qrcode-" + record.id));
		qrcode.makeCode(qr);

		let img = element("#qrcode-" + record.id + " img");
		img.classList.add("img-fluid");
	}
}

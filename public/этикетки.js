
async function Печать()
{
	let source = document.find("main").innerHTML;
	let layout = new Layout();
	let worksheet = await layout.worksheet(source);

	let a = document.find("#print"); //document.createElement("a");
    a.download = "test.xlsx";
	let type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    a.href = "data:" + type + ";base64," + worksheet;
}

let images = [];

async function Загрузка()
{
	await database.begin();
	let query =  { "from": "ПокупкаПорядок",
		           "where" : { "Пользователь" : auth.account },
		           "filter" : { "deleted": "" }	};
	let records = await database.select(query);
	for (let id of records)
	{
		let entry = await database.find(id);
		let record = await database.find(entry.Номенклатура);
		let template = new Template("template");
		template.fill(record);

		template.out("tbody");

		let qr = "https://xn--40-6kcai3c0bf.xn--p1ai/?id=" + record.id;
		let qrcode = new QRCode(document.find("#qrcode-" + record.id));
		qrcode.makeCode(qr);

		let img = document.find("#qrcode-" + record.id + " img");
		img.classList.add("img-fluid");
		images.push(img);

		// if (img.src == "")
		// 	throw "Пустая картинка";
	}
	setTimeout(ОжиданиеКартинок, 100);
}

function ОжиданиеКартинок()
{
	let ready = true;
	for (let image of images)
	{
		if (image.src == "")
		{
			ready = false;
			break;
		}
	}
	if (ready)
	{
		Печать();
		display("#hourglass", false);
		display("#print", true);
		display("table", true);
	}
	else
		setTimeout(ОжиданиеКартинок, 100);
}
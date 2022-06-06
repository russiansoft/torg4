
async function Загрузка()
{
	await dataset.begin();

	let url = new URL(location);
	if (url.searchParams.has("id"))
	{
		let id = url.searchParams.get("id");
		document.record = await dataset.find(id);
		document.title = document.record.title;
		//DataOut(document.record);

		document.record.Описание = document.record.Описание.replace(/\n/g, "<br/>");

		let template = new Template("#content");
		
		let money = Intl.NumberFormat("ru", { "style": "currency", "currency": "RUB" } );
		template.fill( { "Цена": money.format(document.record.Цена) } );

		template.fill(document.record);

		let file = document.record.Изображение;
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
			let base64 = await hive.get(attributes.address);
			let image = "data:image/jpeg;base64," + base64.content;
			template.fill( { "image": image } );
		}
	
		let qr = "https://xn--40-6kcai3c0bf.xn--p1ai/?id=" + document.record.id;
		template.fill( { "qr": qr } );

		template.out("main");

		let qrcode = new QRCode(element("main #qrcode"));
		qrcode.makeCode(qr);

		Обновить();
	}
}

async function ВКорзину()
{
	let id = document.record.id;
	await cart.add(id);
	await dataset.begin();
	Обновить();
}

async function Обновить()
{
	let id = document.record.id;
	let покупка = await dataset.find( { "from": "Покупка",
                                        "where": { "Пользователь": auth.account },
								        "filter": { "Номенклатура": id,
										            "deleted": "" } } );
	display("#buying-" + id, покупка == null);
	display("#buyed-" + id, покупка != null);
	if (покупка != null)
	{
		let template = new Template("#buyed");
		template.fill(покупка);
		let item = await dataset.find(id);
		template.fill(item);
		template.out("#buyed-" + id);
	}
}

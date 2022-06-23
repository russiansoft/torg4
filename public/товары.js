
let count = 0;

async function Заполнить(clear = false)
{
	element("main").innerHTML = "";
	count = 0;
	Дозаполнить();
}

async function Дозаполнить()
{
	try
	{
		await database.begin();
	}
	catch
	{
		new Template("#restricted").out("main");
		return;
	}
	let query =  { "from": "Номенклатура",
		           "skip": count,
		           "take": 15 };
	let search = element("#search").value;
	if (search)
		query.search = search;
	let records = await database.select(query);
	for (let id of records)
	{
		let record = await database.find(id);
		record.Артикул = ("" + record.Артикул).trim();
		if (!record.Артикул)
			record.Артикул = "(нет)";
		let template = new Template("#card").fill(record);

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
			let base64 = await hive.get(attributes.address);
			let image = "data:image/jpeg;base64," + base64.content;
			template.fill( { "image": image } );
		}
		else
			template.fill( { "image": "nophoto.jpeg" } );
		template.out("main");

		ОбновитьЭлемент(id);
	}
	count += records.length;
	query.skip += 14;
	query.take = 1;
	records = await database.select(query);
	display("#more", records.length > 0);
}

async function ВКорзину(id)
{
	if (!await cart.find(id))
		await cart.add(id);
	await database.begin();
	ОбновитьЭлемент(id);
}

async function ОбновитьЭлемент(id)
{
	let покупка = await database.find( { "from": "Покупка",
                                        "where": { "Пользователь": auth.account },
								        "filter": { "Номенклатура": id,
										            "deleted": "" } } );
	display("#buying-" + id, покупка == null);
	display("#buyed-" + id, покупка != null);
	if (покупка != null)
	{
		let template = new Template("#buyed");
		template.fill(покупка);
		let item = await database.find(id);
		template.fill(item);
		template.out("#buyed-" + id);
	}
}

async function Загрузка()
{
	Заполнить();
	element("#search").focus();
}

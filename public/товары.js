
let count = 0;

async function Заполнить(clear = false)
{
	element("main").innerHTML = "";
	count = 0;
	Дозаполнить();
}

async function Дозаполнить()
{
	await dataset.begin();
	let query =  { "from": "Номенклатура",
		           "skip": count,
		           "take": 15 };
	let search = element("#search").value;
	if (search)
		query.search = search;
	let records = await dataset.select(query);
	for (let id of records)
	{
		let record = await dataset.find(id);
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
	}
	count += records.length;
	query.skip += 14;
	query.take = 1;
	records = await dataset.select(query);
	display("#more", records.length > 0);
}

async function ВКорзину(id)
{
	await dataset.begin();
	let max = 0;
	let query = 
	{
		"from": "Покупка",
		"where" : { "Пользователь" : auth.account }
	};
	let records = await dataset.select(query);
	for (let id of records)
	{
		let entry = await dataset.find(id);
		if (max < entry.Порядок)
			max < entry.Порядок;
	}
	let values = { "Пользователь": auth.account,
		           "Порядок": "" + (max + 1),
		           "Номенклатура": id,
		           "Количество": "1" };
	let record = await dataset.create("Покупка",  values);
	await dataset.commit();
}

async function Загрузка()
{
	Заполнить();
	element("#search").focus();
}


async function Заполнить()
{
	element("main").innerHTML = "";
	await dataset.begin();
	let query =  { "from": "ПокупкаПорядок",
		           "where" : { "Пользователь" : auth.account },
		           "filter" : { "deleted": "" }	};
	let records = await dataset.select(query);
	for (let id of records)
	{
		let entry = await dataset.find(id);
		let template = new Template("#card").fill(entry);

		if (entry.Номенклатура)
		{
			let record = await dataset.find(entry.Номенклатура);
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
				let base64 = await hive.get(attributes.address);
				let image = "data:image/jpeg;base64," + base64.content;
				template.fill( { "image": image } );
			}
			else
				template.fill( { "image": "nophoto.jpeg" } );
		}
		template.out("main");
	}
}

async function Инвентаризация()
{
	if (!confirm("Создать инвентаризацию по выбранным товарам?"))
		return;
	await dataset.begin();
	let doc = await dataset.create("Инвентаризация");
	// await dataset.save( [ { "id": doc.id, "ИнвентаризацияОформлен": "1" } ] );
	let query =  { "from": "ПокупкаПорядок",
		           "where" : { "Пользователь" : auth.account },
		           "filter" : { "deleted": "" }	};
	let records = await dataset.select(query);
	for (let id of records)
	{
		let entry = await dataset.find(id);
		let values =
		{
			"Номенклатура": entry.Номенклатура,
			"Количество": "" + entry.Количество
		};
		let line = await dataset.add(doc.id, "Строки", values);
	}
	await dataset.commit();
	alert("Создан документ Инвентаризация");
}

async function Очистить()
{
	await cart.clear();
	Заполнить();
}

async function Увеличить(id)
{
	await cart.plus(id);
	Заполнить();
}

async function Уменьшить(id)
{
	await cart.minus(id);
	Заполнить();
}

async function Удалить(id)
{
	await cart.remove(id);
	Заполнить();
}

async function Загрузка()
{
	Заполнить();
}

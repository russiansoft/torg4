
async function Заполнить()
{
	element("main").innerHTML = "";
	await database.begin();
	let query =  { "from": "ПокупкаПорядок",
		           "where" : { "Пользователь" : auth.account },
		           "filter" : { "deleted": "" }	};
	let records = await database.select(query);
	for (let id of records)
	{
		let entry = await database.find(id);
		let template = new Template("#card").fill(entry);

		if (entry.Номенклатура)
		{
			let record = await database.find(entry.Номенклатура);
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
	await database.begin();
	let doc = await database.create("Инвентаризация");
	// await database.save( [ { "id": doc.id, "ИнвентаризацияОформлен": "1" } ] );
	let query =  { "from": "ПокупкаПорядок",
		           "where" : { "Пользователь" : auth.account },
		           "filter" : { "deleted": "" }	};
	let records = await database.select(query);
	for (let id of records)
	{
		let entry = await database.find(id);
		let values =
		{
			"Номенклатура": entry.Номенклатура,
			"Количество": "" + entry.Количество
		};
		let line = await database.add(doc.id, "Строки", values);
	}
	await database.commit();
	alert("Создан документ Инвентаризация");
}

async function Очистить()
{
	await cart.clear();
	Заполнить();
}

async function ВывестиКоличество(id)
{
	await database.begin();
	let entry = await database.find(id);
	let record = await database.find(entry.Номенклатура);
	element("#count-" + id).innerHTML = entry.Количество + " " + record.ЕдиницаИзмерения;
}

async function Увеличить(id)
{
	await cart.plus(id);
	ВывестиКоличество(id);
}

async function Уменьшить(id)
{
	await cart.minus(id);
	ВывестиКоличество(id);
}

async function ВвестиКоличество(id)
{
	let result = prompt("Введите количество", 0 + await cart.get(id));
	if (result == null)
		return;
	await cart.set(id, result);
	ВывестиКоличество(id);
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


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

async function Этикетки()
{
	let layout = new Layout();
	let test = await layout.test();
	let a = document.createElement("a");
    a.download = "test.xlsx";
	let type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    a.href = "data:" + type + ";base64," + test.content;
    a.click();
}

async function Инвентаризация()
{

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

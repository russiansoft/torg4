
async function Загрузка()
{
	element("main").innerHTML = "";
	await dataset.begin();
	let query = 
	{
		"from": "Покупка",
		"where" : { "Пользователь" : auth.account }
	};
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


async function Записать()
{
	await database.commit();
	close();
}

async function Выбрать()
{
	new FileDialog().show(async function(file)
	{
		let extension = "";
		let point = file.name.lastIndexOf(".");
		if (point != -1)
			extension = file.name.slice(point + 1);
		
		let result = await hive.put(file.data, extension);
		let value = "name:" + file.name;
		if (file.type) 
			value += "|type:" + file.type;
		value += "|address:" + result.address + "|";

		await database.save( [ { "id": document.record, "Изображение": value } ] );
		await ВывестиИзображение(value);
	} );
}

async function Удалить()
{
	await database.save( [ { "id": document.record, "Изображение": "" } ] );
	await ВывестиИзображение("");
}

async function ВывестиИзображение(value)
{
	if (value)
	{
		let attributes = { };
		for (let part of value.split("|"))
		{
			if (!part)
				continue;
			let pair = part.split(":");
			attributes[pair[0]] = pair[1];
		}
		attributes.address = attributes.address.replace(/\\/g, "/");
		let base64 = await hive.get(attributes.address);
		let image = "data:image/jpeg;base64," + base64.content;
		document.find("#image").src = image;
	}
	else
		document.find("#image").src = "";
	display("#choose", !value);
	display("#delete", value);
}

async function Загрузка()
{
	await database.begin();

	let url = new URL(location);
	if (url.searchParams.has("id"))
	{
		let id = url.searchParams.get("id");
		document.record = await database.find(id);
		document.title = document.record.title;
		document.find("#title").innerHTML = document.record.title;
		await ВывестиИзображение(document.record.Изображение);
	}
	let work = document.record;
	DataOut(document.record);
}


let cart = new class Cart
{
	async add(id)
	{
		await database.begin();
		let max = 0;
		let query =  { "from": "Покупка",
			           "where" : { "Пользователь" : auth.account } };
		let records = await database.select(query);
		for (let id of records)
		{
			let entry = await database.find(id);
			if (max < entry.Порядок)
				max = entry.Порядок;
		}
		let values = { "Пользователь": auth.account,
					"Порядок": "" + (max + 1),
					"Номенклатура": id,
					"Количество": "1" };
		let record = await database.create("Покупка",  values);
		await database.commit();
	}

	async find(item)
	{
		await database.begin();
		let query =  { "from": "Покупка",
			           "where": { "Пользователь": auth.account },
					   "filter": { "Номенклатура": item,
						           "deleted": "" } };
		return await database.find(query);
	}

	async get(id)
	{
		await database.begin();
		let entry = await database.find(id);
		if (entry)
			return entry.Количество;
	}

	async set(id, count)
	{
		await database.begin();
		let entry = await database.find(id);
		await database.save( [ { "id": id, "Количество": "" + count } ] );
		await database.commit();
	}

	async remove(id)
	{
		await database.begin();
		await database.save([ { "id": id, "deleted": "1" } ]);
		await database.commit();
	}

	async plus(id)
	{
		await database.begin();
		let entry = await database.find(id);
		await database.save( [ { "id": id, "Количество": "" + (entry.Количество + 1) } ] );
		await database.commit();
	}

	async minus(id)
	{
		await database.begin();
		let entry = await database.find(id);
		await database.save( [ { "id": id, "Количество": "" + (entry.Количество - 1) } ] );
		await database.commit();
	}

	async clear()
	{
		await database.begin();
		let changes = [ ];
		let query =  { "from": "Покупка",
			           "where" : { "Пользователь" : auth.account } };
		for (let id of await database.select(query))
			changes.push( { "id": id, "deleted": "1" } );
		await database.save(changes);
		await database.commit();
	}

	async count()
	{
		await database.begin();
		let changes = [ ];
		let query =  { "from": "Покупка",
			           "where" : { "Пользователь" : auth.account, "deleted": "" } };
		let records = await database.select(query);
		return records.length;
	}
}

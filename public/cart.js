
let cart = new class Cart
{
	async add(id)
	{
		await dataset.begin();
		let max = 0;
		let query =  { "from": "Покупка",
			           "where" : { "Пользователь" : auth.account } };
		let records = await dataset.select(query);
		for (let id of records)
		{
			let entry = await dataset.find(id);
			if (max < entry.Порядок)
				max = entry.Порядок;
		}
		let values = { "Пользователь": auth.account,
					"Порядок": "" + (max + 1),
					"Номенклатура": id,
					"Количество": "1" };
		let record = await dataset.create("Покупка",  values);
		await dataset.commit();
	}

	async remove(id)
	{
		await dataset.begin();
		await dataset.save([ { "id": id, "deleted": "1" } ]);
		await dataset.commit();
	}

	async plus(id)
	{
		await dataset.begin();
		let entry = await dataset.find(id);
		await dataset.save( [ { "id": id, "Количество": "" + (entry.Количество + 1) } ] );
		await dataset.commit();
	}

	async minus(id)
	{
		await dataset.begin();
		let entry = await dataset.find(id);
		await dataset.save( [ { "id": id, "Количество": "" + (entry.Количество - 1) } ] );
		await dataset.commit();
	}

	async clear()
	{
		await dataset.begin();
		let changes = [ ];
		let query =  { "from": "Покупка",
			           "where" : { "Пользователь" : auth.account } };
		for (let id of await dataset.select(query))
			changes.push( { "id": id, "deleted": "1" } );
		await dataset.save(changes);
		await dataset.commit();
	}

	async count()
	{
		await dataset.begin();
		let changes = [ ];
		let query =  { "from": "Покупка",
			           "where" : { "Пользователь" : auth.account, "deleted": "" } };
		let records = await dataset.select(query);
		return records.length;
	}
}

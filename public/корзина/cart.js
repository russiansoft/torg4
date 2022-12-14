
import {Database} from "./database.js";
import {auth} from "./server.js";

export let cart = new class Cart
{
	async add(id)
	{
		let db = await new Database().Begin();
		let max = 0;
		let query =  {"from": "Покупка",
			           "where" : {"Пользователь" : auth.user}};
		let records = await db.select(query);
		for (let id of records)
		{
			let entry = await db.find(id);
			if (max < entry.Порядок)
				max = entry.Порядок;
		}
		let values = {"Пользователь": auth.user,
					   "Порядок": "" + (max + 1),
					   "Номенклатура": id,
					   "Количество": "1"};
		let record = await db.create("Покупка",  values);
		await db.commit();
	}

	async find(item)
	{
		let db = await new Database().Begin();
		let query =  {"from": "Покупка",
			           "where": {"Пользователь": auth.user},
					   "filter": {"Номенклатура": item,
						           "deleted": ""}};
		return await db.find(query);
	}

	async get(id)
	{
		let db = await new Database().Begin();
		let entry = await db.find(id);
		if (entry)
			return entry.Количество;
	}

	async set(id, count)
	{
		let db = await new Database().Begin();
		let entry = await db.find(id);
		await db.save( [ {"id": id, "Количество": "" + count} ] );
		await db.commit();
	}

	async remove(id)
	{
		let db = await new Database().Begin();
		await db.save([ {"id": id, "deleted": "1"} ]);
		await db.commit();
	}

	async plus(id)
	{
		let db = await new Database().Begin();
		let entry = await db.find(id);
		await db.save( [ {"id": id, "Количество": "" + (entry.Количество + 1)} ] );
		await db.commit();
	}

	async minus(id)
	{
		let db = await new Database().Begin();
		let entry = await db.find(id);
		await db.save( [ {"id": id, "Количество": "" + (entry.Количество - 1)} ] );
		await db.commit();
	}

	async clear()
	{
		let db = await new Database().Begin();
		let changes = [ ];
		let query =  {"from": "Покупка",
			           "where" : {"Пользователь" : auth.user}};
		for (let id of await db.select(query))
			changes.push({"id": id, "deleted": "1"});
		await db.save(changes);
		await db.commit();
	}

	async count()
	{
		let db = await new Database().Begin();
		let changes = [ ];
		let query =  {"from": "Покупка",
			           "where" : {"Пользователь" : auth.user, "deleted": ""}};
		let records = await db.select(query);
		return records.length;
	}
}

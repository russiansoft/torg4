
let count = 0;

async function Заполнить(clear = false)
{
	element("#content").innerHTML = "";
	count = 0;
	Дозаполнить();
}

async function Дозаполнить()
{
	await dataset.begin();
	let query = 
	{
		"from": "Номенклатура",
		"skip": count,
		"take": 15
	};
	let search = element("#search").value;
	if (search)
		query.search = search;
	let records = await dataset.select(query);
	for (let id of records)
	{
		let record = await dataset.find(id);
		new Template("#card").fill(record).out("#content");
	}
	count += records.length;
	query.skip += 14;
	query.take = 1;
	records = await dataset.select(query);
	display("#more", records.length > 0);
}

function Открыть(id)
{
	open("товар?id=" + id);
}

onload = async function()
{
	Заполнить(true);
}


async function Записать()
{
	await dataset.commit();
	close();
}

addEventListener("load", async function()
{
	await dataset.begin();

	// Обработка изменений полей ввода
	document.onchange = OnChange;

	let url = new URL(location);
	if (url.searchParams.has("id"))
	{
		let id = url.searchParams.get("id");
		document.record = await dataset.find(id);
	}
	let work = document.record;
	DataOut(document.record);
} );

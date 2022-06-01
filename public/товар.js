
addEventListener("load", async function()
{
	await dataset.begin();

	let url = new URL(location);
	if (url.searchParams.has("id"))
	{
		let id = url.searchParams.get("id");
		document.record = await dataset.find(id);
		document.title = document.record.title;
		DataOut(document.record);
	}
} );

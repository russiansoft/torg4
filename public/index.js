
async function Загрузка()
{
	let url = new URL(location);
	if (url.searchParams.has("id"))
	{
		let id = url.searchParams.get("id");
		location = "товар?id=" + id;
	}
	await LoadNav();
}

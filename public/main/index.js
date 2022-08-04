
import { binding } from "./reactive.js";
import { LoadNav } from "./nav.js";
import "./classes.js";

async function Загрузка()
{
	let url = new URL(location);
	if (url.searchParams.has("id"))
	{
		let id = url.searchParams.get("id");
		location = "товар?id=" + id;
	}
	await LoadNav();
	await binding(document.find("body"));
}

addEventListener("load", Загрузка);

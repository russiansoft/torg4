
let User = ""; // Имя пользователя

// Вход
async function Войти()
{
	let auth = await app.auth(localStorage["device"]);
	if (!auth.user)
	{
		let google = await app.google();
		if (!google.client)
			throw "Отсутствет идентификатор клиента Google";
		if (google.uri != location.origin)
			throw "Ошибочный URI перенаправления Google";
		let request = "https://accounts.google.com/o/oauth2/v2/auth" +
					  "?client_id=" + google.client +
					  "&response_type=code" +
					  "&scope=openid%20email" +
					  "&redirect_uri=" + google.uri;
		console.log(request);
		location.replace(request);
	}
}

// Выход
async function Выйти()
{
	app.logout(localStorage["device"]);
	location.replace(location);
}

// Событие загрузки
addEventListener("load", async function()
{
	// Завершение аутентификации Google
	let url = new URL(location);
	if (url.searchParams.has("code"))
	{
		let code = url.searchParams.get("code");
		let device = localStorage["device"];
		await app.login(code, device);
		location.replace(location.origin);
		return;
	}

	// Идентификация устройства
	if (!localStorage["device"])
		localStorage["device"] = await app.guid();
	let device = localStorage["device"];
	console.log("Идентификатор устройства " + device);

	// Навигация
	(await new Template().load("nav.html")).out("nav");

	// Аутентификация
	if (device)
	{
		let auth = await app.auth(device);
		User = auth.user;
		let text = auth.user ? auth.user : "";
		element("#user").innerHTML = text;
	}

	// Обновление видимости
	display("#login", User == "");
	display("#logout", User != "");

	// Отступ
	let next = element("nav").nextElementSibling;
	if (next)
		next.style.marginTop = element("nav").offsetHeight + "px";
} );

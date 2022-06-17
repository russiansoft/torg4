
async function Войти()
{
	await auth.identify(localStorage["device"]);
	if (!auth.user)
	{
		let google = await auth.google();
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

async function Выйти()
{
	auth.logout(localStorage["device"]);
	location.replace(location);
}

// Загрузка
addEventListener("load", async function()
{
	// Завершение аутентификации Google
	let url = new URL(location);
	if (url.searchParams.has("code"))
	{
		let code = url.searchParams.get("code");
		await auth.login(code, localStorage["device"]);
		location.replace(location.origin);
		return;
	}

	// Регистрация устройства
	if (!localStorage["device"])
		localStorage["device"] = await auth.register();

	// Идентификация
	await auth.identify(localStorage["device"]);

	// Вывод
	let template = new Template();
	await template.load("nav.html");
	let name = auth.user ? auth.user : "";
	template.fill( { "user": name } );
	template.out("nav");

	// Обновление видимости
	display("#login", name == "");
	display("#logout", name != "");

	// Отступ
	let next = element("nav").nextElementSibling;
	if (next)
		next.style.marginTop = element("nav").offsetHeight + "px";

	if (Загрузка)
		Загрузка();
} );


import { auth } from "./server.js";
import { database } from "./database.js";
import { model } from "./model.js";
import { Layout } from "./template.js";
import { binding } from "./reactive.js";

model.classes.Навигация = class Навигация
{
	async view(element)
	{
		element.classList.add("navbar", "sticky-top", "navbar-expand",
		                      "navbar-dark", "bg-dark")
		let layout = await new Layout().load("навигация.html");
		let template = layout.template("#form");
		await template.fill(auth).fill(this).out(element);
		await binding(element);
		document.find("button#login").show(!auth.user);
		document.find("button#logout").show(auth.user);
	}

	async login()
	{
		auth.google();
	}

	async logout()
	{
		auth.logout();
	}
};

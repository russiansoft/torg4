
import { auth } from "./server.js";
import { database } from "./database.js";
import { server } from "./server.js";
import { Template } from "./template.js";
import { binding } from "./reactive.js";

document.classes["sot-nav"] = class SotNav
{
	async View()
	{
		this.classList.add("navbar", "sticky-top", "navbar-expand",
		                   "navbar-dark", "bg-dark");
		let layout = await server.LoadHTML("навигация.html");
		await layout.template().fill(auth).fill(this).Join(this);
		//document.find("button#login").show(!auth.user);
		//document.find("button#logout").show(auth.user);
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

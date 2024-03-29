
import {auth} from "./server.js";
import {database} from "./database.js";
import {server} from "./server.js";
import {Template} from "./template.js";
import {binding} from "./reactive.js";
import "./client.js";

document.classes["nav-class"] = class
{
	async Create()
	{
		this.classList.add("navbar", "sticky-top", "navbar-expand",
		                   "navbar-dark", "bg-dark");
		let layout = await server.Layout("навигация.html");
		await layout.template().fill(auth).fill(this).Join(this);
		document.get("#login").show(!auth.user);
		document.get("#telegram").show(!auth.user);
		document.get("#logout").show(auth.user);

		for (let element of this.querySelectorAll("[data-read]"))
		{
			let access = await database.access(element.dataset.read);
			if (access.indexOf("read") != -1)
				element.classList.remove("d-none");
		}		
	}

	async login()
	{
		auth.google();
	}

	async Telegram()
	{
		alert("?");
	}

	async logout()
	{
		auth.logout();
	}
};

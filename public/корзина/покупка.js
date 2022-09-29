
import { Database } from "./database.js";
import { model } from "./model.js";
import { cart } from "./cart.js";

document.classes["item-class"] = class
{
	async Увеличить()
	{
		await cart.plus(this.dataset.id);
		this.ВывестиКоличество();
	}

	async Уменьшить()
	{
		await cart.minus(this.dataset.id);
		this.ВывестиКоличество();
	}

	async ВывестиКоличество()
	{
		let db = await new Database().transaction();
		let entry = await db.find(this.dataset.id);
		let record = await db.find(entry.Номенклатура);
		let element = document.get("#count-" + this.dataset.id);
		element.innerHTML = entry.Количество + " " + record.ЕдиницаИзмерения;
	}

	async ВвестиКоличество()
	{
		let result = prompt("Введите количество", 0 + await cart.get(this.dataset.id));
		if (result == null)
			return;
		await cart.set(this.dataset.id, result);
		this.ВывестиКоличество();
	}

	async Удалить()
	{
		let db = await new Database().transaction();
		let entry = await db.find(this.dataset.id);
		let record = await db.find(entry.Номенклатура);
		if (!confirm("Удалить из корзины " + record.title + "?"))
			return;
		await cart.remove(this.dataset.id);
	}
};

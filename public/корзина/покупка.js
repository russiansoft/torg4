
import { Database } from "./database.js";
import { model } from "./model.js";
import { cart } from "./cart.js";

model.classes.Покупка = class
{
	async Увеличить()
	{
		await cart.plus(this.id);
		this.ВывестиКоличество();
	}

	async Уменьшить()
	{
		await cart.minus(this.id);
		this.ВывестиКоличество();
	}

	async ВывестиКоличество()
	{
		let db = await new Database().transaction();
		let entry = await db.find(this.id);
		let record = await db.find(entry.Номенклатура);
		let element = document.find("#count-" + this.id);
		if (element)
			element.innerHTML = entry.Количество + " " + record.ЕдиницаИзмерения;
	}

	async ВвестиКоличество()
	{
		let result = prompt("Введите количество", 0 + await cart.get(this.id));
		if (result == null)
			return;
		await cart.set(this.id, result);
		this.ВывестиКоличество();
	}

	async Удалить()
	{
		let db = await new Database().transaction();
		let record = await db.find(this.Номенклатура);
		if (!confirm("Удалить из корзины " + record.title + "?"))
			return;
		await cart.remove(this.id);
	}
};

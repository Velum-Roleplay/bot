

export function logInDev(...text: unknown[]) {
	const time = new Date();
	const timeString = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
	/** get the called function name */
	const stack = new Error().stack;
	const caller = stack?.split("\n")[2].trim().split(" ")[1];
	if (process.env.NODE_ENV === "development") {
		if (text.length === 1 && typeof text[0] === "string") {
			console.log(`${timeString} (${caller}) - ${text}`);
		} else {
			console.log(`${timeString} (${caller})`, text);
		}
	}
}

export function roundUp(num: number): number {
	if (num >= 0) {
		return Math.ceil(num);
	} else {
		return Math.floor(num);
	}
}

export function removeFromArguments(args: string[], toRemove: RegExp) {
	return args.filter((arg) => !toRemove.test(arg));
}

export function removeFromArgumentsWithString(args: string[], toRemove: string | undefined) {
	if (!toRemove) return args;
	return args.filter((arg) => arg !== toRemove);
}

export function latinise(str: string) {
	return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}



export function capitalize(str: string) {
	return str[0].toUpperCase() + str.slice(1);
}

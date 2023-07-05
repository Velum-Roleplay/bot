import {Message} from "discord.js";
import {Parameters, PARAMS, Seuil, SEUIL_KEYS, STATISTIQUES} from "../interface";
import {
	getSeuil,
	getStatistique,
	latinize,
	logInDev,
	removeFromArguments,
	removeFromArgumentsWithString
} from "../utils";
import {getConfig} from "../maps";


export function getParameters(message: Message, rollType: "neutre"|"combat") {
	let messageContent = message.content.split(" ");
	//remove trigger
	messageContent.shift();
	
	const args : Parameters = {
		statistiques: 10,
		statistiqueName: "Neutre",
		user: message.author.id,
		modificateur: 0,
	};
	
	if (rollType === "neutre") {
		args.seuil = getSeuil("moyen");
	} else {
		args.cc = false;
	}
	const guildID = message.guild?.id ?? "";
	const roleStaff = getConfig(guildID, "staff");
	const hasRoleStaff = message.member?.roles.cache.has(roleStaff) ?? false;
	const user = getUser(message, messageContent, args, hasRoleStaff);
	messageContent = user.params;
	args.user = user.user;
	const perso = getPersonnage(messageContent);
	messageContent = perso.params;
	args.personnage = perso.personnage;
	args.fiche = perso.fiche;
	const statistiques = getParamStats(messageContent, guildID, args);
	messageContent = statistiques.params;
	args.statistiques = statistiques.param.statistiques;
	
	const commentaire = getCommentaire(messageContent);
	messageContent = commentaire.params;
	args.commentaire = commentaire.commentaire;
	
	if (rollType === "neutre") {
		const seuil = getSeuilInParameters(messageContent);
		messageContent = seuil.params;
		args.seuil = seuil.seuil;
	} else if (rollType === "combat") {
		const cc = getCC(messageContent);
		messageContent = cc.params;
		args.cc = cc.cc;
	}
	
	const modificateur = getModifier(messageContent);
	messageContent = modificateur.params;
	args.modificateur = modificateur.modificateur;
	
	if (messageContent.length > 0 && !args.commentaire) {
		//set the rest of the message as comment
		args.commentaire = messageContent.join(" ");
	}
	logInDev(args);
	return args;
}

function getUser(message: Message, params: string[], parameters: Parameters, staff: boolean) {
	const isSomeoneMentionned = message.mentions.users ?? false;
	let user = parameters.user;
	if (isSomeoneMentionned && staff) {
		user = message.mentions.users.first()?.id ?? parameters.user;
		params = removeFromArgumentsWithString(params, `<@${parameters.user}>`);
	}
	return {params, user};
}

function getPersonnage(params: string[]) {
	const personnageFind = params.find( (value) => value.match(PARAMS.personnage));
	let fiche = false;
	let personnage = "main";
	if (personnageFind) {
		personnage = personnageFind.replace(PARAMS.personnage, "");
		params = removeFromArguments(params, PARAMS.personnage);
		fiche = true;
	}
	return {params, personnage, fiche};
}

function getParamStats(params: string[], guildID: string, param: Parameters) {
	if (params.length >= 1) {
		/** search right value of statistiques **/
		const statistiquesArgs = STATISTIQUES.find( (value) => value.includes(latinize(params[0].toLowerCase()))) ?? "neutre";
		param.statistiqueName = statistiquesArgs;
		params = removeFromArgumentsWithString(params, statistiquesArgs);
		/** remove params[0] */
		params = params.slice(1);
		param.statistiques = getStatistique(param.user, guildID, statistiquesArgs, param.personnage ?? "main");
	}
	return {params, param};
}

function getCommentaire(params: string[]) {
	const commentaireFind = params.find( (value) => value.match(PARAMS.commentaire));
	let commentaire: string;
	if (params.length === 2 && !commentaireFind) {
		commentaire = params[1];
	} else {
		const commentaireFind = params.find( (value) => value.match(PARAMS.commentaire));
		commentaire = commentaireFind ? commentaireFind.replace(PARAMS.commentaire, "") : "";
		params = removeFromArguments(params, PARAMS.commentaire);
	}
	return {params, commentaire};
}

function getSeuilInParameters(params: string[]) {
	const seuilFind = params.find( (value) => value.match(PARAMS.seuil));
	let seuil = Seuil.moyen;
	if (seuilFind) {
		const seuilName = SEUIL_KEYS.find( (value) => value.includes(latinize(seuilFind.replace(PARAMS.seuil, "").toLowerCase()))) ?? "moyen";
		seuil = getSeuil(seuilName);
		params = removeFromArguments(params, PARAMS.seuil);
	}
	return {params, seuil};
}

function getModifier(params: string[]) {
	const find = params.find( (value) => value.match(PARAMS.modificateur));
	const modificateur = find ? parseInt(find) : 0;
	params = removeFromArguments(params, PARAMS.modificateur);
	return {params, modificateur};
}

function getCC(params: string[]) {
	const find = params.find( (value) => value.match(PARAMS.cc));
	const cc = !!find;
	params = removeFromArguments(params, PARAMS.cc);
	return {params, cc};
}
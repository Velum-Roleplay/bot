import {ChannelType, Client, GuildMember, MessageFlagsBitField, userMention} from "discord.js";

import {exportMaps, getConfig} from "../maps";
import {rollCombat, rollNeutre} from "../roll";
import {helpCombat} from "../roll/help";
import {getParameters} from "../roll/parseArg";
import {displayATQ, displayNEUTRE, ephemeralInfo} from "../roll/results";
import {logInDev,} from "../utils";

export default (client: Client): void => {
	client.on("messageCreate", async (message) => {
		if (message.author.bot) return;
		if (message.channel.type === ChannelType.DM) return;
		if (!message.guild) return;
		if (message.content.toLowerCase().startsWith("$db") && process.env.NODE_ENV === "development") {
			const db = exportMaps();
			await message.reply({
				content: "Regarder la console",
			});
			logInDev(db);
			return;
		}
		const prefix = getConfig(message.guild?.id, "prefix");
		if (message.content.toLowerCase().startsWith(`${prefix}r`)) {
			if (message.content.toLowerCase().startsWith(`${prefix}r --help`)) {
				await message.reply({embeds: [helpCombat(message, "neutre")]});
				return;
			}
			const messageSaved = `||${userMention(message.author.id)}: \`${message.content}\`||`;
			/** Parse parameters **/
			const param = getParameters(message, "neutre");
			const result = rollNeutre(param);
			if (!result?.success) return;
			const member = message.guild?.members.cache.get(param.user.id) as GuildMember;
			const embed = displayNEUTRE(param, result, member);
			const info = ephemeralInfo(param) + messageSaved;
			const channel = message.channel;
			await message.delete();
			await channel.send({
				content: info,
				embeds: [embed],
				flags: [MessageFlagsBitField.Flags.SuppressNotifications]
			});
			return;
		} else if (message.content.toLowerCase().startsWith(`${prefix}atq`)) {
			if (message.content.toLowerCase().startsWith(`${prefix}atq --help`)) {
				await message.reply({embeds: [helpCombat(message, "combat")]});
				return;
			}
			const messageSaved = `||${userMention(message.author.id)}: \`${message.content}\`||`;
			const param = getParameters(message, "combat");
			const result = rollCombat(param);
			if (!result) return;
			const member = message.guild?.members.cache.get(param.user.id) as GuildMember;
			const embed = displayATQ(param, result, member);
			const info = ephemeralInfo(param) + messageSaved;
			const channel = message.channel;
			await message.delete();
			await channel.send({
				content: info,
				embeds: [embed]
			});
			return;
		}
	});
};

import {
	ActionRowBuilder,
	SelectMenuBuilder,
	SlashCommandBuilder,
} from 'discord.js';
import {
	setAutomaticVoteEndTime,
} from '../../MongoRequests/clans.js';
import { checkAccessRight } from '../../accessManager.js';

export const data = new SlashCommandBuilder()
	.setName('settings_vote_end_time')
	.setDMPermission(false)
	.setDescription('The clan leader can change Innocent Wolve vote end time here');


export const execute = async (interaction) => {
	// check if user has access
	await interaction.deferReply({ ephemeral: true });
	try {
		checkAccessRight(interaction).then(rights => {
			const access = rights[0];
			const coLeaderAcess = rights[1];
			const userData = rights[2];
			if (access == 'leader' || (access == 'coLeader' && coLeaderAcess)) {
				userHasAccessResponse(interaction, userData.clanId);
			}
			else if (access == 'clanNotRegistered') {
				interaction.editReply({
					content: 'Your Clan is not registered to this Server.',
					ephemeral: true,
				});
			}
			else {
				interaction.editReply({ content: 'You have no access to this command.', ephemeral: true });
			}
		});
	}
	catch (e) {
		console.log(e);
		interaction.editReply({
			content: 'You have no access to the bot or a internal error accured.',
			ephemeral: true,
		});
	}

};

const voteEndTime = (endTime) => {
	const getOptions = (start, end, skips, defaultValue, type) => {
		const day = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
		const options = [];
		while (start <= end) {
			options.push(
				{
					label: type == 'days' ? day[parseInt(start)] : type + ': ' + start.toString(),
					value: start.toString(),
					default: (defaultValue == start),
				},
			);
			start += skips;
		}
		return options;
	};
	return [
		new ActionRowBuilder()
			.addComponents(
				new SelectMenuBuilder()
					.setCustomId('voteDayEndTime')
					.setPlaceholder(endTime.slice(0, 1))
					.setOptions(getOptions(0, 6, 1, parseInt(endTime.slice(0, 1)), 'days')),
			),
		new ActionRowBuilder().addComponents(
			new SelectMenuBuilder()
				.setCustomId('voteHourEndTime')
				.setPlaceholder(endTime.slice(2, 4))
				.setOptions(getOptions(0, 23, 1, parseInt(endTime.slice(2, 4)), 'Hour')),
		),
		new ActionRowBuilder().addComponents(
			new SelectMenuBuilder()
				.setCustomId('voteMinuteEndTime')
				.setPlaceholder(endTime.slice(5, 7))
				.setOptions(getOptions(0, 55, 5, parseInt(endTime.slice(5, 7)), 'Minute')),
		)];
};

const userHasAccessResponse = (interaction, clanInformation) => {
	const menu = voteEndTime(clanInformation.settings.autoVotingTimeEnd);
	interaction.editReply({
		content:  'Innocent Wolve Quest End Settings \n' +
			'The format for the quest end below is\n' +
			'day 0 - Monday | 6 - Sunday\n' +
			'hour\n' +
			'minute',
		components: menu,
		ephemeral: true,
	});
	const collector = interaction.channel.createMessageComponentCollector({ time: 30000 });

	collector.on('collect', async i => {
		await i.deferUpdate({ ephemeral: true });

		if (i.customId == 'voteDayEndTime') {
			setAutomaticVoteEndTime(i.guildId, 0, i.values[0]).then(d => {
				const newMenu = voteEndTime(d.settings.autoVotingTimeEnd);
				i.editReply({
					content: 'Innocent Wolve Quest End Settings | UPDATED: ' + new Date().toLocaleString() + '\n' +
						'The format for the questStart below is\n' +
						'day 0 - Monday | 6 - Sunday\n' +
						'hour\n' +
						'minute',
					components: newMenu,
					ephemeral: true,
				});
			}).catch(e => {
				console.log(e);
			});
		}
		if (i.customId == 'voteHourEndTime') {
			setAutomaticVoteEndTime(i.guildId, 1, i.values[0]).then(d => {
				const newMenu = voteEndTime(d.settings.autoVotingTimeEnd);
				i.editReply({
					content: 'Innocent Wolve Quest Start Settings | UPDATED: ' + new Date().toLocaleString() + '\n' +
						'The format for the questStart below is\n' +
						'day 0 - Monday | 6 - Sunday\n' +
						'hour\n' +
						'minute',
					components: newMenu,
					ephemeral: true,
				});
			}).catch(e => {
				console.log(e);
			});
		}
		if (i.customId == 'voteMinuteEndTime') {
			setAutomaticVoteEndTime(i.guildId, 2, i.values[0]).then(d => {
				const newMenu = voteEndTime(d.settings.autoVotingTimeEnd);
				i.editReply({
					content: 'Innocent Wolve Quest Start Settings | UPDATED: ' + new Date().toLocaleString() + '\n' +
						'The format for the questStart below is\n' +
						'day 0 - Monday | 6 - Sunday\n' +
						'hour\n' +
						'minute',
					components: newMenu,
					ephemeral: true,
				});
			}).catch(e => {
				console.log(e);
			});
		}

	});

	collector.on('end', collected => console.log(`Collected ${collected.size} items`));
};

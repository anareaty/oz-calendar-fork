import OZCalendarPlugin from 'main';
import { Modal, TFolder, Notice } from 'obsidian';
import { createNewMarkdownFile } from './util/utils';
import { stripIndents } from 'common-tags';
import dayjs from 'dayjs';
import { FolderSuggest } from 'settings/suggestor';

export class CreateNoteModal extends Modal {
	plugin: OZCalendarPlugin;
	destinationDate: Date;

	constructor(plugin: OZCalendarPlugin, destinationDate: Date) {
		super(plugin.app);
		this.plugin = plugin;
		this.destinationDate = destinationDate;
	}

	onOpen(): void {
		let { contentEl } = this;
		let thisModal = this;

		const headerEl = contentEl.createEl('div', { text: 'Create Note' });
		headerEl.addClass('modal-title');

		// Input El
		contentEl.createEl('p', { text: 'File Name:' });
		const fileNameInputEl = contentEl.createEl('input', { cls: 'oz-calendar-modal-inputel' });

		let defFileNamePref = this.plugin.settings.defaultFileNamePrefix;
		if (defFileNamePref !== '') {
			fileNameInputEl.value = dayjs(this.destinationDate).format(defFileNamePref) + ' ';
		}

		fileNameInputEl.focus();

		// Folder Select
		let folderInputEl: HTMLInputElement = null;
		if (this.plugin.settings.showDestinationFolderDuringCreate) {
			contentEl.createEl('p', { text: 'Destination Folder:' });
			folderInputEl = contentEl.createEl('input', { cls: 'oz-calendar-modal-inputel' });
			new FolderSuggest(folderInputEl);
			folderInputEl.value = this.plugin.settings.defaultFolder;
		}

		// Additional Space
		let addSpace = contentEl.createEl('div', { cls: 'oz-calendar-modal-addspacediv ' });

		// Create - Cancel Buttons
		const createButton = contentEl.createEl('button', {
			text: 'Create Note',
			cls: this.plugin.settings.newNoteCancelButtonReverse ? 'oz-calendar-modal-float-right' : '',
		});
		const cancelButton = contentEl.createEl('button', {
			text: 'Cancel',
			cls: this.plugin.settings.newNoteCancelButtonReverse ? '' : 'oz-calendar-modal-float-right',
		});
		cancelButton.addEventListener('click', () => {
			thisModal.close();
		});

		const onClickCreateButton = async () => {
			let newFileName = fileNameInputEl.value;

			if (newFileName === '') {
				new Notice('You didnt provide file name');
				return;
			}

			if (newFileName.includes('/') && !this.plugin.settings.allowSlashhDuringCreate) {
				new Notice('You can not have a slash (/) in file name');
				return;
			}

			let defFolderSrc = folderInputEl ? folderInputEl.value : this.plugin.settings.defaultFolder;
			let defFolder = this.app.vault.getAbstractFileByPath(defFolderSrc);






			/*

			// Default Text Preparation for File with YAML and Date
			let defaultNewFileText = stripIndents`
			---
			${this.plugin.settings.yamlKey}: ${dayjs(this.destinationDate).format(this.plugin.settings.dateFormat)}
			---
			`;

			// Create the MD File and close the modal
			await createNewMarkdownFile(
				this.plugin,
				defFolder as TFolder,
				newFileName,
				this.plugin.settings.dateSource === 'yaml' ? defaultNewFileText : ''
			);


			*/

			let dateKey = this.plugin.settings.yamlKey
			let dateSource = this.plugin.settings.dateSource
			let selectedDate = dayjs(this.destinationDate).format(this.plugin.settings.dateFormat)


			let isDaily
			if (newFileName.trim() == selectedDate) {
				isDaily = true
				newFileName = dayjs(selectedDate).format(this.plugin.settings.dailyNameFormat)
				defFolder = this.app.vault.getAbstractFileByPath(this.plugin.settings.dailyFolder)

				let localeMonths = {
					en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], 
					ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]
				}
			
				for (let month of localeMonths.en) {
					let index = localeMonths.en.indexOf(month)
					newFileName = newFileName.replace(month, localeMonths.ru[index])
				}
			}
			
			if (!defFolder || !(defFolder instanceof TFolder)) {
				new Notice('Folder couldnt be found in the Vault');
				return;
			}
			
			await createNewMarkdownFile(
				this.plugin,
				defFolder,
				newFileName,
				{dateKey, dateSource, selectedDate, isDaily}
			);





			thisModal.close();
		};

		createButton.addEventListener('click', onClickCreateButton);
		fileNameInputEl.addEventListener('keydown', async (e) => {
			if (e.key === 'Enter') await onClickCreateButton();
		});
	}

	onClose() {
		let { contentEl } = this;
		contentEl.empty();
	}
}

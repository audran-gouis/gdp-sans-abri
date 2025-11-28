/**
 * World - Contexte partagé pour Cucumber
 * Fournit des méthodes utilitaires et un état partagé entre les steps
 */

const { setWorldConstructor, World } = require('@cucumber/cucumber');
const helpers = require('./helpers');

/**
 * Classe World personnalisée pour partager des données entre les steps
 */
class CustomWorld extends World {
  constructor(options) {
    super(options);
    
    // Variables partagées entre les steps
    this.transmissions = [];
    this.adpPersonnes = [];
    this.selectedDate = null;
    this.filters = {};
    this.currentModal = null;
    this.formData = {};
  }
  
  // ==================== MÉTHODES UTILITAIRES (délègue à helpers.js) ====================
  
  async waitForElement(selector, timeout = 5000) {
    return await helpers.waitForElement(this.page, selector, timeout);
  }
  
  async clickElement(selector) {
    return await helpers.clickElement(this.page, selector);
  }
  
  async fillInput(selector, value) {
    return await helpers.fillInput(this.page, selector, value);
  }
  
  async selectOption(selector, value) {
    return await helpers.selectOption(this.page, selector, value);
  }
  
  async checkCheckbox(selector) {
    return await helpers.checkCheckbox(this.page, selector);
  }
  
  async uncheckCheckbox(selector) {
    return await helpers.uncheckCheckbox(this.page, selector);
  }
  
  async getText(selector) {
    return await helpers.getText(this.page, selector);
  }
  
  async isVisible(selector) {
    return await helpers.isVisible(this.page, selector);
  }
  
  async isHidden(selector) {
    return await helpers.isHidden(this.page, selector);
  }
  
  async hasClass(selector, className) {
    return await helpers.hasClass(this.page, selector, className);
  }
  
  async wait(ms) {
    return await helpers.wait(this.page, ms);
  }
  
  // ==================== MÉTHODES SPÉCIFIQUES À L'APPLICATION ====================
  
  async clearDatabase(dbName = 'MaraudesDB') {
    return await helpers.clearDatabase(this.page, dbName);
  }
  
  async getDatabaseData(dbName = 'MaraudesDB', storeName = 'transmissions') {
    return await helpers.getDatabaseData(this.page, dbName, storeName);
  }
  
  async addTestTransmission(data, dbName = 'MaraudesDB') {
    return await helpers.addTestTransmission(this.page, data, dbName);
  }
  
  async takeScreenshot(path) {
    return await helpers.takeScreenshot(this.page, path);
  }
}

setWorldConstructor(CustomWorld);

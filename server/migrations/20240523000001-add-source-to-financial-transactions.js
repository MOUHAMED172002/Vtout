/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('financial_transactions', 'source', {
      type: Sequelize.STRING(32),
      allowNull: true,
      comment: 'Source of the earning (supplier, deliverer, platform, etc.)'
    });

    // Backfill existing rows based on description
    await queryInterface.sequelize.query(`
      UPDATE financial_transactions
      SET source = CASE
        WHEN description LIKE '%Livreur%' OR description LIKE '%Course%' OR description LIKE '%Course%' THEN 'deliverer'
        WHEN description LIKE '%Vente%' OR description LIKE '%Boutique%' THEN 'supplier'
        WHEN description LIKE '%Com.%' OR description LIKE '%Commission%' THEN 'platform'
        ELSE NULL
      END
      WHERE source IS NULL AND type = 'earning'
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('financial_transactions', 'source');
  }
};
